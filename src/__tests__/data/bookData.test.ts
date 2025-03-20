import { insertBook, isAuthorExists, updateBook, deleteBook, getBooksByPage } from "../../data/bookData";
import { AppDataSource } from "../../data-source";
import { Authors } from "../../entity/Authors";

const queryRunner = { 
    manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn()
    }
}

describe('isAuthorExist', () => {

    const mockExistAuthor = {
        author_id: 1,
        name: 'James Clear',
        country: 'US',
    }

    it('should return author if author is found by id', async () => {

        queryRunner.manager.findOne.mockResolvedValue(mockExistAuthor)

        const isExist = await isAuthorExists(1, null, queryRunner)

        expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Authors, { where: { author_id: 1 } })
        expect(isExist).toEqual(mockExistAuthor)
    })

    it('should return author if author is found by name', async () => {

        queryRunner.manager.createQueryBuilder.mockReturnValue({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(mockExistAuthor)
        })

        const isExist = await isAuthorExists(null, 'James clear', queryRunner)

        expect(queryRunner.manager.createQueryBuilder).toHaveBeenCalledWith(Authors, 'author')
        expect(isExist).toEqual(mockExistAuthor)
    })

    it('should return undefined if author does not exist', async () => {

        queryRunner.manager.findOne.mockResolvedValue(null)

        const result = await isAuthorExists(12, null, queryRunner)

        expect(result).toBeUndefined()
        expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Authors, { where: { author_id: 12 }})
    })
})

describe('create book', () => {
    const mockUser = { user_id: 1, email: 'user1@example.com' }
    const author = { id: 1, name: 'James Clear', country: 'US' }
    const title = 'Atomic Habbits'
    const published_year = 2010
    const mockBook = { title, published_year, author, users: mockUser }

    it('should create book', async () => {

        queryRunner.manager.findOne.mockResolvedValueOnce(author)
        queryRunner.manager.findOne.mockResolvedValue(mockUser)

        const result = await insertBook({ author, title, published_year, queryRunner, userId: 1 })

        expect(result).toEqual(mockBook)
        expect(queryRunner.manager.save).toHaveBeenCalledWith(mockBook)
    })

    it('should throw error if author not found', () => {

        queryRunner.manager.findOne.mockResolvedValue(null)
    
        expect(insertBook({ author, title, published_year, queryRunner, userId: 1 })).rejects.toThrow("Author with id 1 not found")
    })

    it('should return null for user if user not found', async () => {
        queryRunner.manager.findOne.mockResolvedValueOnce(author)
        queryRunner.manager.findOne.mockResolvedValue(null)

        const result = await insertBook({ author, title, published_year, queryRunner, userId: 1 })

        expect(result).toEqual({...mockBook, users: null})
    })
    
})

describe("update book", () => {
    const mockUser = { user_id: 1, email: 'user1@example.com' }
    const author = { id: 1, name: 'James Clear', country: 'US' }
    const title = 'Atomic Habbits'
    const published_year = 2010
    const mockBook = { book_id: 1, title, published_year, author, users: mockUser }

    it('should update book', async () => {
        queryRunner.manager.findOne.mockResolvedValue(mockBook)

        const result = await updateBook({ book_id: 1, title: "Who Moved my Cheese", queryRunner, userId: 1 })
        expect(result).toEqual(mockBook)
    })

    it('should throw error if book not found', () => {
        queryRunner.manager.findOne.mockResolvedValue(null)

        expect(updateBook({ book_id: 1, title: "Who Moved my Cheese", queryRunner, userId: 1 })).rejects.toThrow("Book with id 1 not found")
    })
    
    it('should update author', async () => {
        const mockNewAuthor = { name: "Spencer Johnson", country: "US" }
        
        queryRunner.manager.findOne.mockResolvedValueOnce(mockBook)
        queryRunner.manager.createQueryBuilder.mockReturnValueOnce({
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null)
        })
        queryRunner.manager.findOne.mockResolvedValueOnce(mockUser)

        queryRunner.manager.create.mockReturnValue(mockNewAuthor)
        queryRunner.manager.save.mockResolvedValue(mockNewAuthor)

        queryRunner.manager.save.mockResolvedValue({ ...mockBook, author: mockNewAuthor })

        const result = await updateBook({ book_id: 1, author: { name: "Spencer Johnson"}, queryRunner, userId: 1 })
        expect(result).toEqual({ ...mockBook, author: mockNewAuthor })
    })
})

describe('delete book', () => {
    const mockUser = { user_id: 1, email: 'user1@example.com' }
    const mockBook = { 
        book_id: 2, 
        title: 'Atomic Habbits', 
        borrowedBooks: [ { book_id: 1, borrowed_by: mockUser, is_deleted: false }] 
    }

    it('should delete book', async () => {
        queryRunner.manager.findOne.mockResolvedValueOnce(mockBook)

        const result = await deleteBook(1, queryRunner)

        expect(result.is_deleted).toBe(true)
    })

    it('should throw error if book not found', () => {
        queryRunner.manager.findOne.mockResolvedValueOnce(null)

        expect(deleteBook(1, queryRunner)).rejects.toThrow("Book with id 1 not found")
    })
})

describe('get book by page', () => {
    it('should return only the search data', async () => {
        const  mockQueryBuilder = {
            leftJoin: jest.fn().mockReturnThis(),
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orWhere: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[
                { 
                    book_id: 1,
                    title: "Atomic Habbits",
                    author: { author_id: 1, name: "Kalki", country: "India" }, 
                    users: [{ user_id: 1, email: "user1@gmail.com"}]
                }
            ], 1]),
        }
        
        const mockRepo = {
            createQueryBuilder : jest.fn().mockReturnValue(mockQueryBuilder)
        }
        
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        const result: any = await getBooksByPage({ page_number: 1, page_size: 10, search: 'Atomic Habbits'})
        
        expect(result.data).toEqual([
            { 
                book_id: 1,
                title: "Atomic Habbits",
                author: { author_id: 1, name: "Kalki", country: "India" }, 
                users: [{ user_id: 1, email: "user1@gmail.com"}]
            }
        ])
    })
})