import { Books } from "../entity/Books";
import { Authors } from "../entity/Authors";
import { Users } from "../entity/Users";
import { insertAuthor } from "./authorData";
import { AppDataSource } from "../data-source";
interface Author {
    id?: number
    name?: string
    country?: string
}
interface InsertProps {
    queryRunner: any
    userId: number
    title: string
    author: Author
    published_year?: number
}

interface UpdateProps {
    userId: number
    queryRunner: any
    book_id: number
    title?: string
    published_year?: number
    author?: Author
}

interface GetBookById {
    book_id: number | null
}

interface GetBooksByPage {
    page_number: number
    page_size: number
    search: string
}

const books = AppDataSource.getRepository(Books)

async function isAuthorExists(author_id: number | null, name: string | null, queryRunner: any) {
    if(author_id){
        const author = await queryRunner.manager.findOne(Authors, { where: { author_id } })
        if (author) {
            return author
        }
    }
    else{
        const author = await queryRunner.manager.createQueryBuilder(Authors, "author")
        .where("LOWER(author.name) = LOWER(:name)", {name})
        .getOne()

        if(author){
            return author
        }
    }
}

export async function insertBook({ author, title, published_year, queryRunner, userId }: InsertProps) {
    const newBook = new Books()
    newBook.title = title

    if (author.id) {
        const authorExists = await isAuthorExists(author.id, null, queryRunner)

        if (!authorExists) {
            throw new Error(`Author id ${author.id} not found`)
        }
        newBook.author = authorExists
    }

    if(author.name){
        const authorExists = await isAuthorExists(null, author.name, queryRunner)
        if(authorExists){
            newBook.author = authorExists
        }
        else{
            const newAuthor = await insertAuthor({name: author.name, country: author.country || null, queryRunner, userId})
            newBook.author = newAuthor
        }
    }

    if (published_year) {
        newBook.published_year = published_year
    }

    if(userId){
        const user = await queryRunner.manager.findOne(Users, { where: { user_id: userId }})
        newBook.users = user || null
    }

    await queryRunner.manager.save(newBook)
    return newBook
}

export async function updateBook({ book_id, title, author, published_year, queryRunner, userId }: UpdateProps) {
    const bookToUpdate = await queryRunner.manager.findOne(Books, { where: { book_id } })

    if (!bookToUpdate) {
        throw new Error(`Book with id ${book_id} not found`)
    }

    if (title) {
        bookToUpdate.title = title
    }

    if (author?.id) {
        const authorExists = await isAuthorExists(author.id, null, queryRunner)
        if (!authorExists) {
            throw new Error(`Author id ${author.id} not found`)
        }

        bookToUpdate.author = authorExists
    }

    if(author?.name){
        const authorExists = await isAuthorExists(null, author.name, queryRunner)
        if(!authorExists){
            const newAuthor = await insertAuthor({name: author.name, country: author.country || null, queryRunner, userId})
            bookToUpdate.author = newAuthor
        }
        else{
            bookToUpdate.author = authorExists
        }

    }
    if (published_year) {
        bookToUpdate.published_year = published_year
    }

    queryRunner.manager.save(bookToUpdate)
    return bookToUpdate
}

export async function deleteBook(book_id: number, queryRunner: any) {
    const bookToDelete = await queryRunner.manager.findOne(Books, { where: { book_id } })

    if (!bookToDelete) {
        throw new Error(`Book with id ${book_id} not found`)
    }
    await queryRunner.manager.remove(bookToDelete)

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

export async function getBooksByPage({ page_number, page_size, search }: GetBooksByPage){
    const skip = (page_number - 1) * page_size

    const queryBuilder = books.createQueryBuilder("book")
        .skip(skip)
        .take(page_size)
        .leftJoinAndSelect('book.author', "author")
        .leftJoin('book.users', 'users')
        .addSelect(['users.user_id', 'users.email'])

    if(!!search){
        queryBuilder
            .where("LOWER(book.title) LIKE LOWER(:search)", { search: `${search}%`})
            .orWhere("LOWER(author.name) LIKE LOWER(:search)", { search: `${search}%` })
            .orWhere("book.published_year::text LIKE :search", { search: `${search}%` })
            .orWhere("users.email LIKE LOWER(:search)", { search: `${search}%` })
    }

    const [data, totalCount] = await queryBuilder.getManyAndCount()

    return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
        currentPage: page_number
    }
}