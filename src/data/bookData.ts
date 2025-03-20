import { Books } from "../entity/Books";
import { BorrowedBooks } from "../entity/BorrowedBooks";
import { Authors } from "../entity/Authors";
import { Users } from "../entity/Users";
import { insertAuthor } from "./authorData";
import { AppDataSource } from "../data-source";
import { throwError } from "../utils/errorMessage";
interface Author {
    id?: number
    name?: string
    country?: string
}
interface InsertBook {
    queryRunner: any
    userId: number
    title: string
    author: Author
    published_year?: number
}

interface UpdateBook {
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

async function getByName(name: string, queryRunner: any){
    const author = await queryRunner.manager.createQueryBuilder(Authors, "author")
    .where("LOWER(author.name) = LOWER(:name)", {name})
    .getOne()

   return author
}

async function getById(author_id: number, queryRunner: any){
    const author = await queryRunner.manager.findOne(Authors, { where: { author_id } })
    return author
}

async function findOrCreateAuthor(id: number | null, name: string = '', country : string = '', queryRunner: any, userId: number | null){
    if (id) {
        const authorExists = await getById(id, queryRunner)
        return authorExists
    }

    if(name){
        const authorExists = await getByName(name, queryRunner)
       
        if(!authorExists){
            const newAuthor = await insertAuthor({name: name, country: country || null, queryRunner, userId})
            return newAuthor
        }
        return authorExists
    }

}

export async function insertBook({ author, title, published_year, queryRunner, userId }: InsertBook) {
    const newBook = new Books()
    newBook.title = title

    const authorExist = await findOrCreateAuthor(author.id, author.name, author.country, queryRunner, userId)

    if(!authorExist){
       throwError('Author', 'id', author.id)
    }

    newBook.author = authorExist

    if (published_year) {
        newBook.published_year = published_year
    }

    if(userId){
        const user = await queryRunner.manager.findOne(Users, { where: { user_id: userId }, select: ["user_id", "email"]})
        newBook.users = user || null
    }

    await queryRunner.manager.save(newBook)
    return newBook
}

export async function updateBook({ book_id, title, author, published_year, queryRunner, userId }: UpdateBook) {
    const bookToUpdate = await queryRunner.manager.findOne(Books, { where: { book_id } })

    if (!bookToUpdate) {
        throwError('Book', 'id', book_id)
    }

    if (title) {
        bookToUpdate.title = title
    }

    const authorExist = findOrCreateAuthor(author.id, author.name, author.country, queryRunner, userId)

    if(!authorExist){
        throwError('Author', 'id', author.id)
    }
    bookToUpdate.author = authorExist

    if (published_year) {
        bookToUpdate.published_year = published_year
    }

    queryRunner.manager.save(bookToUpdate)
    return bookToUpdate
}

export async function deleteBook(book_id: number, queryRunner: any) {
    const bookToDelete = await queryRunner.manager.findOne(Books, { 
        where: [
            { book_id, deleted_at: null }
        ],
        relations: ["borrowedBooks"]
    })

    if (!bookToDelete) {
        throwError('Book', 'id', book_id)
    }

    await queryRunner.manager
        .getRepository(Books)
        .softDelete(book_id)

    if (bookToDelete.borrowedBooks.length > 0) {
        for (const borrowedBook of bookToDelete.borrowedBooks) {
            await queryRunner.manager
            .getRepository(BorrowedBooks)
            .softDelete(borrowedBook.id)
        }
    }

    return
}

export async function getBookById({ book_id }: GetBookById) {
    const books = AppDataSource.getRepository(Books)

    const book = await books.findOne({ where: { book_id }, relations: ['author'] })

    if (!book) {
        throwError('Book', 'id', book_id)
    }
    return book
}

export async function getBooksByPage({ page_number, page_size, search }: GetBooksByPage){
    const skip = (page_number - 1) * page_size
    const books = AppDataSource.getRepository(Books)

    const queryBuilder = books.createQueryBuilder("book")
        .skip(skip)
        .take(page_size)
        .leftJoinAndSelect('book.author', "author")
        .leftJoin('book.users', 'users')
        .addSelect(['users.user_id', 'users.email'])
        .where('book.deleted_at IS NULL')

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