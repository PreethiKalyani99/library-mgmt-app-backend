import { Router, Request, Response } from "express";
import { addressSchema } from "../validationSchema";
import { getCoordinates } from "../data/addressData";
import { AppDataSource } from "../data-source";

const router = Router()

router.get('/', async(req: Request, res: Response) => {
    const { error, value } = addressSchema.validate(req.body)

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()

    try{
        if(error){
            throw new Error(`${error}`)
        }
        const { houseNumber, street, area, city, country, pincode } = value

        const result = await getCoordinates({ 
            housenumber: houseNumber || null, 
            street: street || null, 
            area: area || null, 
            city: city || null, 
            country: country || null, 
            pincode: pincode || null,
            queryRunner
        })

        await queryRunner.commitTransaction()
        res.status(200).json(result)
    }
    catch(error){
        await queryRunner.rollbackTransaction()
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
    finally{
        await queryRunner.release()
    }
})

export default router