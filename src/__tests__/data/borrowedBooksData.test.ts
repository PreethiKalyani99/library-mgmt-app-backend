import { AppDataSource } from "../../data-source";
import { insertBorrowedBook, updateBorrowedBook, getBorrowedBooksByPage } from "../../data/borrowedBooksData";

const queryRunner = { 
    manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn()
    }
}

describe('create borrowed book', () => {
    const book = { title: "Atomic Habbits", id: 1 }
    const borrower = { id: 1, email: "user1@gmail.com"}
    const borrow_date = new Date("2025-02-01")
    const return_date = new Date("2025-03-01")
    const mockData = { book, borrower, borrow_date, return_date }

    it('should create borrowed book', async () => {

        queryRunner.manager.findOne.mockResolvedValueOnce(book)
        queryRunner.manager.findOne.mockResolvedValueOnce(borrower)

        const result = await insertBorrowedBook({...mockData, queryRunner})
        expect(result).toEqual({
            books: book,
            borrow_date,
            return_date,
            users: borrower
        })
    })

    it('should throw error if book is not found', async () => {

        queryRunner.manager.findOne.mockResolvedValueOnce(null)
        queryRunner.manager.findOne.mockResolvedValueOnce(borrower)

        expect(insertBorrowedBook({...mockData, queryRunner})).rejects.toThrow("Book with id 1 not found")
    })

    it('should throw error if borrower is not found', async () => {
        const borrower = { email: "user1@gmail.com"}
        const mockData = { book, borrower, borrow_date, return_date }

        queryRunner.manager.findOne.mockResolvedValueOnce(null) 
        queryRunner.manager.findOne.mockResolvedValueOnce(book)
    
        await expect(insertBorrowedBook({ ...mockData, queryRunner })).rejects.toThrow("Borrower with email user1@gmail.com not found")
    })
})

describe('update borrower', () => {
    const borrowedBook = {id: 1, title: "Atomic Habbits"}
    const mockData = { id: 1, return_date: new Date("2025-03-01") }

    it('should update borrower', async () => {
        queryRunner.manager.findOne.mockResolvedValueOnce(borrowedBook)

        const result = await updateBorrowedBook({ ...mockData, queryRunner })
        expect(result).toEqual({...borrowedBook, ...mockData})
    })

    it('should throw error if borrower not found', async () => {
        queryRunner.manager.findOne.mockResolvedValueOnce(null)

        await updateBorrowedBook({ ...mockData, queryRunner })
        expect(updateBorrowedBook({ ...mockData, queryRunner })).rejects.toThrow("ID 1 not found")
    })
})

describe('get borrowed books by page', () => {
    it('should return only the search data', async () => {
        const  mockQueryBuilder = {
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[
                { 
                    books: { book_id: 1, title: "Atomic Habbits" }, 
                    users: [{ user_id: 1, email: "user1@gmail.com" }]
                }
            ], 1]),
        }

        const mockRepo = {
            createQueryBuilder : jest.fn().mockReturnValue(mockQueryBuilder)
        }
        
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        const result: any = await getBorrowedBooksByPage({ page_number: 1, page_size: 10, search: 'Atomic Habbits'})

        expect(result.data).toEqual([
            { 
                books: { book_id: 1, title: "Atomic Habbits" }, 
                users: [{ user_id: 1, email: "user1@gmail.com" }]
            }
        ])
    })
})