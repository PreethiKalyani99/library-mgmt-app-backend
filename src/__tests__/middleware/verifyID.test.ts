import { NextFunction } from "express"
import { verifyID } from "../../middleware/verifyID"

test('should not throw error if ID is valid', () => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        params: {
            id: "1"
        }
    }
    const idSchema = {
        validate: jest.fn()
    }

    idSchema.validate.mockReturnValue({ error: null })

    verifyID(req, res, next)

    expect(res.status).not.toHaveBeenCalledWith(404)
})

test('should throw error if ID is invalid', () => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        params: {
            id: "1dsafds"
        }
    }
    const idSchema = {
        validate: jest.fn()
    }

    idSchema.validate.mockReturnValue({ error: 'Invalid'})

    verifyID(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
})