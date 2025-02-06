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
    all: string
    page_number: number
    page_size: number
    search: string
}

const authors = AppDataSource.getRepository(Authors)

export async function insertAuthor({ name, country, queryRunner, userId }: AuthorData) {
    const user = await queryRunner.manager.findOne(Users, { where: { user_id: userId }})

    const newAuthor = queryRunner.manager.create(Authors, {
        name,
        country: country,
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

function getAllAuthors(){
    return authors.createQueryBuilder("author").leftJoin('author.users', 'users').addSelect(['users.user_id', 'users.email']).getMany()
}

export async function getAuthorsByPage({ page_number, page_size, all, search }: GetAuthorsByPage) {
    if(all && search === ''){
        return getAllAuthors()
    }

    const skip = (page_number - 1) * page_size

    const queryBuilder = authors.createQueryBuilder("author").skip(skip).take(page_size).leftJoin('author.users', 'users').addSelect(['users.user_id', 'users.email'])

    if(!!search){
        queryBuilder.where("LOWER(author.name) LIKE LOWER(:search)", { search: `${search}%`})
    }
   
    const [data, totalCount] = await queryBuilder.getManyAndCount()
    
    return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
        currentPage: page_number
    }
}