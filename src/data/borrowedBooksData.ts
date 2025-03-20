import { BorrowedBooks } from "../entity/BorrowedBooks";
import { Books } from "../entity/Books";
import { Users } from "../entity/Users";
import { AppDataSource } from "../data-source";

interface BookProp {
    id?: number
    title?: string
}

interface BorrowerProp {
    id?: number
    email?: string
}

interface InsertProp {
    book: BookProp
    borrower: BorrowerProp
    borrow_date: Date
    queryRunner: any
}

async function getBookById(id: number, queryRunner: any){
   const book = await queryRunner.manager.findOne(Books, { where: { book_id: id }}) 
   return book
}

async function getBookByTitle(title: string, queryRunner: any){
    const book = await queryRunner.manager.createQueryBuilder(Books, "books")
    .where("LOWER(books.title) = LOWER(:title)", { title })
    .getOne() 
    return book
}

async function getUserById(id: number, queryRunner: any){
    const user = await queryRunner.manager.findOne(Users, { where: { user_id: id }, select: ['email', 'user_id']})
    return user
}

async function getUserByEmail(email: string, queryRunner: any){
    const user = await queryRunner.manager.findOne(Users, { where: { email: email.toLowerCase() }})
    return user
}

function getBook(id: number, title: string, queryRunner: any){
    if(id){
        return getBookById(id, queryRunner)
    }
    return getBookByTitle(title, queryRunner)
}

function getUser(id: number, email: string, queryRunner: any){
    if(id){
        return getUserById(id, queryRunner)
    }
    return getUserByEmail(email, queryRunner)
}

export async function insertBorrowedBook({ book, borrower, borrow_date, queryRunner }: InsertProp){ 
    const newBorrowedBook = new BorrowedBooks()

    const bookExist = await getBook(book.id, book.title, queryRunner)
    if(!bookExist){
        throw new Error(`Book with ${book.id ? `id ${book.id}` : `title ${book.title}`} not found`)
    }
    newBorrowedBook.books = bookExist

    const userExist = await getUser(borrower.id, borrower.email, queryRunner)
    if(!userExist){
        throw new Error(`Borrower with ${borrower.id ? `id ${borrower.id}` : `email ${borrower.email}`} not found`)
    }
    newBorrowedBook.users = userExist

    newBorrowedBook.borrow_date = new Date(borrow_date)
    newBorrowedBook.return_date =  null

    await queryRunner.manager.save(newBorrowedBook)
    return newBorrowedBook
}

interface UpdateBorrowerProp {
    id: number
    return_date: Date | null
    queryRunner: any
}

export async function updateBorrowedBook({ id, return_date, queryRunner }: UpdateBorrowerProp){
    const borrowedBook = await queryRunner.manager.findOne(BorrowedBooks, { where: { id }})

    if(!borrowedBook){
        throw new Error(`ID ${id} not found`)
    }

    borrowedBook.return_date = new Date(return_date)
    await queryRunner.manager.save(borrowedBook)
    return borrowedBook
}

interface GetBorrowedBooksByPage {
    page_number: number
    page_size: number
    search: string
    id?: number
}

export async function getBorrowedBooksByPage({ id, page_number, page_size, search }:GetBorrowedBooksByPage){
    const borrowedBooks = AppDataSource.getRepository(BorrowedBooks)
    const skip = (page_number - 1) * page_size

    const queryBuilder = borrowedBooks.createQueryBuilder('borrowedBooks')
        .skip(skip)
        .take(page_size)
        .leftJoinAndSelect('borrowedBooks.books', 'books')
        .leftJoin('borrowedBooks.users', 'users')
        .addSelect(['users.user_id', 'users.email'])
        .where('borrowedBooks.deleted_at IS NULL')

    if (id) {
        queryBuilder.where('users.user_id = :id', { id })
    }
    
    if(search){
        queryBuilder.andWhere(
            "LOWER(books.title) LIKE LOWER(:search) OR users.email LIKE LOWER(:search)", { search: `%${search}%` }
        )
    }

    const [data, totalCount] = await queryBuilder.getManyAndCount()
    
    return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
        currentPage: page_number
    }
}       

