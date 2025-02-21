import { Address } from "../entity/Address";
import { AppDataSource } from "../data-source";
import fetch from "node-fetch";

interface AddressProp {
    housenumber: string | null
    street: string | null
    area: string | null
    city: string | null
    country?: string | null
    pincode?: string | null
    queryRunner?: any
}

interface InsertProp extends AddressProp {
    data: any
}

const addressRepo = AppDataSource.getRepository(Address)

const checkConstraints = (field: string, value: string | undefined | null, queryBuilder: any) => {
    if (value) {
        if((field === 'street' || field === 'area')){
            queryBuilder.andWhere(`similarity(address.${field}, :${field}) > 0.5`, { street: value })
            return
        }
        queryBuilder.andWhere(`LOWER(address.${field}) LIKE LOWER(:${field})`,
            { [field]: value }
        )
    }
    else {
        queryBuilder.andWhere(`address.${field} IS NULL`)
    }
}

export async function searchAddress({ housenumber, street, area, city, country, pincode }: AddressProp) {
    const queryBuilder = addressRepo.createQueryBuilder("address").select(["address.coordinates"])

    checkConstraints('housenumber', housenumber, queryBuilder)
    checkConstraints('street', street, queryBuilder)
    checkConstraints('city', city, queryBuilder)
    checkConstraints('area', area, queryBuilder)

    if (!city) {
        checkConstraints("country", country, queryBuilder)
        checkConstraints("pincode", pincode, queryBuilder)
    }

    return queryBuilder.getOne()
}


export async function insertAddress({
    data,
    queryRunner,
    housenumber,
    street,
    area,
    city,
    country,
    pincode
}: InsertProp) {
    const newAddress = new Address()

    if (!data.results || data.results.length === 0) {
        throw new Error("No results found from Google Maps API")
    }

    const addressComponents = data.results[0].address_components

    addressComponents.forEach((component: any) => {
        if (housenumber && component.types.includes("premise")) {
            newAddress.housenumber = component.long_name
        }
        if (street && component.types.includes("neighborhood")) {
            newAddress.street = component.long_name
        }
        if (area && component.types.includes("sublocality_level_1")) {
            newAddress.area = component.long_name
        }
        if (city && component.types.includes("locality")) {
            newAddress.city = component.long_name
        }
        if (country && component.types.includes("country")) {
            newAddress.country = component.long_name
        }
        if (pincode && component.types.includes("postal_code")) {
            newAddress.pincode = component.long_name
        }
    })

    newAddress.coordinates = `(${data.results[0].geometry.location.lng}, ${data.results[0].geometry.location.lat})`

    await queryRunner.manager.save(newAddress)
    return newAddress
}

export async function getCoordinates({ housenumber, street, area, city, country, pincode, queryRunner }: AddressProp) {
    const searchResult = await searchAddress({ housenumber, street, area, city, country, pincode })

    if (searchResult) {
        return searchResult.coordinates
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    const addressInput = `${housenumber || ""} ${street || ""}, ${area || ""}, ${city || ""}, ${country || ""}, ${pincode || ""}`
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressInput)}&key=${apiKey}`

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error("Failed to fetch coordinates")
    }
    const data = await response.json() as any

    await insertAddress({data, queryRunner, housenumber, street, area, city})
    return data
}