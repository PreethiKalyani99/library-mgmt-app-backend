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
    return_date: Date | null
    queryRunner: any
}

interface EntityProp {
    entity: string
    queryRunner: any
    id?: number
    title?: string
    email?: string
}

async function checkEntityExists({ id, title, email, queryRunner, entity }: EntityProp){
    if(entity === 'book'){
        if(id){
            return await queryRunner.manager.findOne(Books, { where: { book_id: id }}) 
        }
        else if(title){
            return await queryRunner.manager.createQueryBuilder(Books, "books")
            .where("LOWER(books.title) = LOWER(:title)", { title })
            .getOne() 
        }
    }
    else if(entity === 'user'){
        if(id){
            return await queryRunner.manager.findOne(Users, { where: { user_id: id }})
        }
        else if(email){
            return await queryRunner.manager.findOne(Users, { where: { email: email.toLowerCase() }})
        }
    }
}

export async function insertBorrowedBook({ book, borrower, borrow_date, return_date, queryRunner }: InsertProp){
    const newBorrowedBook = new BorrowedBooks()

    const bookExist = await checkEntityExists({ id: book.id, title: book.title, entity: 'book', queryRunner })
    if(!bookExist){
        throw new Error(`Book with ${book.id ? `id ${book.id}` : `title ${book.title}`} not found`)
    }
    newBorrowedBook.books = bookExist

    const userExist = await checkEntityExists({ id: borrower.id, email: borrower.email, entity: 'user', queryRunner })
    if(!userExist){
        throw new Error(`Borrower with ${borrower.id ? `id ${borrower.id}` : `email ${borrower.email}`} not found`)
    }
    newBorrowedBook.users = userExist

    newBorrowedBook.borrow_date = new Date(borrow_date)
    newBorrowedBook.return_date = return_date || null

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

const borrowedBooks = AppDataSource.getRepository(BorrowedBooks)

export async function getBorrowerBookById(id: number){
    const borrowedBooksList = await borrowedBooks.find({ where: { users: { user_id: id } }, relations: ['books']})
    if(!borrowedBooksList){
        throw new Error(`ID ${id} not found`)
    }
    return borrowedBooksList
}

interface GetBorrowedBooksByPage {
    page_number: number
    page_size: number
    search: string
}

export async function getBorrowedBooksByPage({ page_number, page_size, search }:GetBorrowedBooksByPage){
    const skip = (page_number - 1) * page_size

    const queryBuilder = borrowedBooks.createQueryBuilder('borrowedBooks')
        .skip(skip)
        .take(page_size)
        .leftJoinAndSelect('borrowedBooks.books', 'books')
        .leftJoin('borrowedBooks.users', 'users')
        .addSelect(['users.user_id', 'users.email'])

    if(search){
        queryBuilder.where(
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

