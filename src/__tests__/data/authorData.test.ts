import { insertAuthor, updateAuthor, deleteAuthor, getAuthorsById, getAuthorsByPage } from "../../data/authorData";
import { Users } from "../../entity/Users";
import { Authors } from "../../entity/Authors";
import { AppDataSource } from "../../data-source";

const queryRunner = { 
    manager: {
        findOne: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        remove: jest.fn()
    }
}

describe('Insert author', () => {
    const mockUser = { user_id: 1, name: "Preethi"}
    
    it('should create new author', async () => {
        const mockData = { name: "Kalki", country: "India", queryRunner, userId: 1 }
        const mockResult = { name: "Kalki", country: "India", created_by: mockUser }

        queryRunner.manager.findOne.mockResolvedValue(mockUser)
        queryRunner.manager.create.mockReturnValue(mockResult)
        queryRunner.manager.save.mockResolvedValue(mockResult)

        const result = await insertAuthor(mockData)

        expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Users, { where: { user_id: 1 } })
        expect(queryRunner.manager.save).toHaveBeenCalledWith(mockResult)
        expect(result).toEqual(mockResult)
    })
})

describe('update author', () => {
    it('should update author', async () => {
        const updateData = { author_id: 1, name: "Thiruvalluvar", queryRunner }
        const existAuthor = { author_id: 1, name: "Kalki", country: "India" }
    
        queryRunner.manager.findOne.mockResolvedValue(existAuthor)
        queryRunner.manager.save.mockResolvedValue(existAuthor)
    
        const result = await updateAuthor(updateData)
    
        expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Authors, { where: { author_id: 1 } })
        expect(queryRunner.manager.save).toHaveBeenCalledWith({...existAuthor, name: "Thiruvalluvar" })
        expect(result).toEqual({ author_id: 1, name: "Thiruvalluvar", country: "India" })
    })

    it('should throw error if author does not exist', async () => {
        queryRunner.manager.findOne.mockResolvedValue(null)

        const updateData = { author_id: 1, name: "James Clear", country: "US", queryRunner }

        await expect(updateAuthor(updateData)).rejects.toThrow('Author with id 1 not found')
    })
})

describe('delete author', () => {
    it('should delete author', async() => {
        const existAuthor = { author_id: 1, name: "Kalki", country: "India" }
    
        queryRunner.manager.findOne.mockResolvedValue(existAuthor)
        queryRunner.manager.remove.mockResolvedValue(existAuthor)

        const result = await deleteAuthor(1, queryRunner)
    
        expect(queryRunner.manager.findOne).toHaveBeenCalledWith(Authors, { where: { author_id: 1 } })
        expect(queryRunner.manager.remove).toHaveBeenCalledWith(existAuthor)
        expect(result).toEqual(existAuthor)
    })

    it('should throw error if author does not exist', async () => {
        queryRunner.manager.findOne.mockResolvedValue(null)

        await expect(deleteAuthor(1, queryRunner)).rejects.toThrow('Author with id 1 not found')
    })
})

const mockAuthors = [
    { author_id: 1, name: "Kalki", country: "India", users: [{ user_id: 1, email: "user1@gmail.com"}]},
    { author_id: 2, name: "James Clear", country: "USA", users: [{ user_id: 2, email: "user2@gmail.com"}]},
]

describe('get authors by page', () => {
    it('should return all authors if "all" is true and search is empty', async () => {
        const  mockQueryBuilder = {
            leftJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([mockAuthors, mockAuthors.length]),
            getMany: jest.fn().mockResolvedValue(mockAuthors)
        }
        
        const mockRepo = {
            createQueryBuilder : jest.fn().mockReturnValue(mockQueryBuilder)
        }
        
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        const result: any = await getAuthorsByPage({ page_number: 1, page_size: 10, all: true, search: ''})
        
        expect(result).toEqual(mockAuthors)
    })

    it('should return only the search data', async () => {
        const  mockQueryBuilder = {
            leftJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[{ author_id: 1, name: "Kalki", country: "India", users: [{ user_id: 1, email: "user1@gmail.com"}]}], 1]),
        }
        
        const mockRepo = {
            createQueryBuilder : jest.fn().mockReturnValue(mockQueryBuilder)
        }
        
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        const result: any = await getAuthorsByPage({ page_number: 1, page_size: 10, all: false, search: 'Kalki'})

        expect(result.data).toEqual([{ author_id: 1, name: "Kalki", country: "India", users: [{ user_id: 1, email: "user1@gmail.com"}]}])
    })
})

describe("get authors by page", () => {
    it('should return the author', async () => {
        const mockAuthor = {
            author_id: 1,
            name: "Kalki",
            country: "India",
            users: [{ user_id: 1, email: "user1@gmail.com" }]
        }

        const mockRepo = {
            findOne: jest.fn().mockResolvedValue(mockAuthor)
        }
        
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        const result = await getAuthorsById({ author_id: 1 })

        expect(result).toEqual(mockAuthor)
    })

    it('should throw error if author not found', async () => {
        const mockRepo = {
            findOne: jest.fn().mockResolvedValue(null)
        }
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        expect(getAuthorsById({ author_id: 1 })).rejects.toThrow("Author with id 1 not found")
    })
})