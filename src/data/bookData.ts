import { AppDataSource } from "../data-source";
import { Books } from "../entity/Books";
import { Authors } from "../entity/Authors";
import { insertAuthor } from "./authorData";
interface Author {
    id?: number
    name?: string
    country?: string
}
interface InsertProps {
    author?: Author
    title: string
    published_year?: number
}

interface UpdateProps {
    book_id: number
    title?: string
    published_year?: number
    author?: Author
}

interface GetBookById {
    book_id: number | null
}

const books = AppDataSource.getRepository(Books)
const authors = AppDataSource.getRepository(Authors)

async function isAuthorAvailable(author_id: number | null, name: string | null) {
    if(author_id){
        const author = await authors.findOne({ where: { author_id } })
        if (author) {
            return author
        }
    }
    else{
        const author = await authors.createQueryBuilder("author")
        .where("LOWER(author.name) = LOWER(:name)", {name})
        .getOne()

        if(author){
            return author
        }
    }
}

export async function insertBook({ author, title, published_year }: InsertProps) {
    const newBook = new Books()
    newBook.title = title

    if(!author.id && !author.name){
        throw new Error("Either author name or author id is required")
    }

    if (author.id) {
        const authorAvailable = await isAuthorAvailable(author.id, null)

        if (!authorAvailable) {
            throw new Error(`Author id ${author.id} not found`)
        }
        newBook.author = authorAvailable
    }

    if(author.name){
        const authorAvailable = await isAuthorAvailable(null, author.name)
        if(authorAvailable){
            newBook.author = authorAvailable
        }
        else{
            const newAuthor = await insertAuthor({name: author.name, country: author.country || null})
            newBook.author = newAuthor
        }
    }

    if (published_year) {
        newBook.published_year = published_year
    }

    await books.save(newBook)
    return newBook
}

export async function updateBook({ book_id, title, author, published_year }: UpdateProps) {
    const bookToUpdate = await books.findOne({ where: { book_id: book_id } })

    if (!bookToUpdate) {
        throw new Error(`Book with id ${book_id} not found`)
    }

    if (title) {
        bookToUpdate.title = title
    }

    if (author?.id) {
        const authorAvailable = await isAuthorAvailable(author.id, null)
        if (!authorAvailable) {
            throw new Error(`Author id ${author.id} not found`)
        }

        bookToUpdate.author = authorAvailable
    }

    if(author?.name){
        const authorAvailable = await isAuthorAvailable(null, author.name)
        if(!authorAvailable){
            const newAuthor = await insertAuthor({name: author.name, country: author.country || null})
            bookToUpdate.author = newAuthor
        }
        else{
            bookToUpdate.author = authorAvailable
        }

    }
    if (published_year && !isNaN(published_year)) {
        bookToUpdate.published_year = published_year
    }

    books.save(bookToUpdate)
    return bookToUpdate
}

export async function deleteBook(book_id: number) {
    const bookToDelete = await books.findOne({ where: { book_id } })

    if (!bookToDelete) {
        throw new Error(`Book with id ${book_id} not found`)
    }
    await books.remove(bookToDelete)

    return bookToDelete
}

export async function getBookById({ book_id }: GetBookById) {
    const book = await books.findOne({ where: { book_id }, relations: ['author'] })

    if (book) {
        return book
    }
    else {
        throw new Error(`Book with id ${book_id} not found`)
    }
}

export async function getBooksByPage({ page_number, page_size }){
    const skip = (page_number - 1) * page_size
    const [data, totalCount] = await books.findAndCount({ skip, take: page_size, relations:['author'] })

    if (page_size > totalCount) {
        const allData = await books.find({relations: ['author']})
        return {
            data: allData,
            totalCount,
            totalPages: Math.ceil(totalCount / page_size),
            currentPage: page_number
        }
    }

    return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
        currentPage: page_number
    }
}