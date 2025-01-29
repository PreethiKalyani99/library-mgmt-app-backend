import { Authors } from "../entity/Authors";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/Users";

interface AuthorData {
    queryRunner: any
    userId: number
    name: string
    country?: string | null
}

interface UpdateProps {
    queryRunner: any
    author_id: number
    name?: string
    country?: string
}

interface GetAuthorProps {
    author_id: number
}

interface GetAuthorsByPage {
    str?: string
    page_number: number
    page_size: number
}

const authors = AppDataSource.getRepository(Authors)

export async function insertAuthor({ name, country, queryRunner, userId }: AuthorData) {
    const user = await queryRunner.manager.findOne(Users, { where: { user_id: userId }})

    const newAuthor = queryRunner.manager.create(Authors, {
        name,
        country: country || null,
        created_by: user || null
    })

    await queryRunner.manager.save(newAuthor)
    return newAuthor
}

export async function updateAuthor({ author_id, name, country, queryRunner }: UpdateProps) {
    const authorToUpdate = await queryRunner.manager.findOne(Authors, { where: { author_id } })

    if (!authorToUpdate) {
        throw new Error(`Author with id ${author_id} not found`)
    }

    if (name) {
        authorToUpdate.name = name
    }

    if (country) {
        authorToUpdate.country = country
    }

    await queryRunner.manager.save(authorToUpdate)

    return authorToUpdate
}

export async function deleteAuthor(author_id: number, queryRunner: any) {
    const authorToDelete = await queryRunner.manager.findOne(Authors, { where: { author_id } })

    if (!authorToDelete) {
        throw new Error(`Author with id ${author_id} not found`)
    }

    await queryRunner.manager.remove(authorToDelete)

    return authorToDelete
}

export async function getAuthorsById({ author_id }: GetAuthorProps) {
    const author = await authors.findOne({ where: { author_id }, relations: ['users'] })
    if (author) {
        return author
    }
    else {
        throw new Error(`Author with id ${author_id} not found`)
    }
}

async function getAllAuthors(){
    const allData = await authors.find({relations: ['users']})
    return allData 
}

export async function getAuthorsByPage({ page_number, page_size, str }: GetAuthorsByPage) {
    if(str.toLowerCase() === 'all'){
        const allData = await getAllAuthors()
        return allData
    }
    const skip = (page_number - 1) * page_size
    const [data, totalCount] = await authors.findAndCount({ skip, take: page_size, relations: ['users'] })

    if (page_size > totalCount) {
        const allData = await getAllAuthors()
        return {
            data: allData,
            totalCount,
            totalPages: Math.ceil(totalCount / page_size)
        }
    }

    return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
        currentPage: page_number
    }
}