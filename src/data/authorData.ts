import { AppDataSource } from "../data-source";
import { Authors } from "../entity/Authors";

interface AuthorData {
    name: string
    country?: string | null
}

interface UpdateProps {
    author_id: number
    name?: string
    country?: string
}

interface GetAuthorProps {
    author_id: number | undefined
}

const authors = AppDataSource.getRepository(Authors)

export async function insertAuthor({ name, country }: AuthorData){
    if(!name){
        throw new Error("Author name is required")
    }
    const newAuthor = authors.create({
        name, 
        country: country || null
    })

    await authors.save(newAuthor)
    return newAuthor
}

export async function updateAuthor({ author_id, name, country }: UpdateProps){
    const authorToUpdate = await authors.findOne({ where: { author_id }})

    if(!authorToUpdate){
        throw new Error(`Author with id ${author_id} not found`)
    }

    if(name){
        authorToUpdate.name = name
    }

    if(country){
        authorToUpdate.country = country
    }

    await authors.save(authorToUpdate)

    return authorToUpdate
}

export async function deleteAuthor(author_id: number){
    const authorToDelete = await authors.findOne({ where: { author_id }})

    if(!authorToDelete){
        throw new Error(`Author with id ${author_id} not found`)
    }

    await authors.remove(authorToDelete)

    return authorToDelete
}

export async function getAuthor({ author_id }: GetAuthorProps){
    if(author_id){
        const author = await authors.findOne({ where: { author_id }})
        if(author){
            return author
        }
        else{
            throw new Error(`Author with id ${author_id} not found`)
        }
    }
    else{
        const allAuthors = await authors.find()
        return allAuthors
    }
}