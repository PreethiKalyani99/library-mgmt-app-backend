import { AppDataSource } from "../../data-source";
import { createRole, getRoles } from "../../data/roleData";

describe('insert role', () => {
    it('should create a new role', async () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn(),
                save: jest.fn(),
            }
        }
        const mockData = { role: "reader" }
    
        queryRunner.manager.findOne.mockResolvedValueOnce(null)
        
        const result = await createRole({ ...mockData, queryRunner })

        expect(result).toEqual(mockData)
    })

    it('should not create role if role already exist', () => {
        const queryRunner = { 
            manager: {
                findOne: jest.fn()
            }
        }

        const mockData = { role: "reader" }
    
        queryRunner.manager.findOne.mockResolvedValueOnce({ role_id: 1, role: "reader" })
        
        expect(createRole({ ...mockData, queryRunner })).rejects.toThrow("Role reader already exists")
    })
})

test('get roles', async () => {
    
    const mockRepo = {
        find : jest.fn().mockResolvedValue([{ role_id: 1, role: "librarian" }, {role_id: 2, role: "reader"}])
    }
    
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

    const result = await getRoles()

    expect(result).toEqual([{ role_id: 1, role: "librarian" }, {role_id: 2, role: "reader"}])
})
