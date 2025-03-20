import { AppDataSource } from "../../data-source";
import { insertUser, getUser, updateUser, getUsersByPage } from "../../data/userData";

jest.mock("bcrypt")

describe('insert user', () => {
    it('should create a new user', async () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
                createQueryBuilder: jest.fn()
            }
        }
        const mockData = { email: "user1@gmail.com", password: "User@123", role: "reader" }
    
        queryRunner.manager.findOne.mockResolvedValueOnce(null)
        queryRunner.manager.findOne.mockResolvedValueOnce({ role_id: 1, role: "reader" })
        
        const result = await insertUser({ ...mockData, queryRunner })

        expect(result).toEqual({
            ...mockData,
            role: {
                role_id: 1, 
                role: "reader"
            }
        })
    })

    it('should not create user if user already exist', () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
                createQueryBuilder: jest.fn()
            }
        }

        const mockData = { email: "user1@gmail.com", password: "User@123", role: "reader" }
    
        queryRunner.manager.findOne.mockResolvedValueOnce({ user_id: 1, email: "user1@gmail.com" })
        queryRunner.manager.findOne.mockResolvedValueOnce({ role_id: 1, role: "reader" })
        
        expect(insertUser({ ...mockData, queryRunner })).rejects.toThrow("User user1@gmail.com already exists")
    })

    it('should not create user if role does not exist', async () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
                createQueryBuilder: jest.fn()
            }
        }
        const mockData = { email: "user1@gmail.com", password: "User@123", role: "reader" }
        
        queryRunner.manager.findOne.mockResolvedValueOnce(null)
        queryRunner.manager.findOne.mockResolvedValueOnce(null)
    
        await expect(insertUser({ ...mockData, queryRunner })).rejects.toThrow("Role reader does not exist")
    })
})

describe('get user', () => {
    it('should get user', async () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
            }
        }
        const mockData = { email: "user1@gmail.com", password: "User@123" }

        queryRunner.manager.findOne.mockResolvedValueOnce(mockData)
        require("bcrypt").compare.mockImplementation(() => true)

        const result = await getUser({ ...mockData, queryRunner })

        expect(result).toEqual(mockData)
    })

    it('should throw error if passwords do not match', async () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
            }
        }
        const mockData = { email: "user1@gmail.com", password: "User@123" }

        queryRunner.manager.findOne.mockResolvedValueOnce(mockData)
        require("bcrypt").compare.mockImplementation(() => false)

        expect(getUser({ ...mockData, queryRunner })).rejects.toThrow("Incorrect Password")
    })
})

describe('update user', () => {
    it('should update user', async () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn()
            }
        }
        const mockData = { id: 1, role: 'librarian' }

        queryRunner.manager.findOne.mockResolvedValueOnce({ id: 1, email: "user@gmail.com", role: "reader"})
        queryRunner.manager.findOne.mockResolvedValueOnce({ id: 1, role: "librarian"})

        const result = await updateUser({ ...mockData, queryRunner })

        expect(result).toEqual({ 
            id: 1, 
            email: "user@gmail.com" ,
            role: mockData
        })
    })

    it('should throw error if user not found', () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn()
            }
        }
        const mockData = { id: 1, role: 'librarian' }

        queryRunner.manager.findOne.mockResolvedValueOnce(null)
        queryRunner.manager.findOne.mockResolvedValueOnce({ id: 1, role: "librarian"})

        expect(updateUser({ ...mockData, queryRunner })).rejects.toThrow("User with ID 1 does not exist")
    })

    it('should throw error if role not found', () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn()
            }
        }
        const mockData = { id: 1, role: 'librarian' }

        queryRunner.manager.findOne.mockResolvedValueOnce({ id: 1, email: "user@gmail.com", role: "reader"})
        queryRunner.manager.findOne.mockResolvedValueOnce(null)

        expect(updateUser({ ...mockData, queryRunner })).rejects.toThrow("Role librarian does not exist")
    })
})

describe('get users by page', () => {
    it('should return only the search data', async () => {
        const  mockQueryBuilder = {
            leftJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([[
                { 
                    users: { user_id: 1, email: "user1@gmail.com" },
                    role: { role: "reader" }
                },
                { 
                    users: { user_id: 2, email: "user2@gmail.com" },
                    role: { role: "reader" }
                }
            ], 1]),
        }

        const mockRepo = {
            createQueryBuilder : jest.fn().mockReturnValue(mockQueryBuilder)
        }
        
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

        const result: any = await getUsersByPage({ page_number: 1, page_size: 10, search: 'reader'})

        expect(result.data).toEqual([
            { 
                users: { user_id: 1, email: "user1@gmail.com" },
                role: { role: "reader" }
            },
            { 
                users: { user_id: 2, email: "user2@gmail.com" },
                role: { role: "reader" }
            }
        ])
    })
})