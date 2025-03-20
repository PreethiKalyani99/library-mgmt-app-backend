import { NextFunction } from "express"
import jwt from "jsonwebtoken"
import { verifyToken } from "../../middleware/verifyToken"

jest.mock('jsonwebtoken')

const mockUser = { user_id: 1, email: 'user@example.com', role: 'admin' }

test('should not throw error if token is valid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => mockUser)

    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        headers: {
            authorization: "valid token"
        }
    }

    verifyToken(req, res, next)

    expect(res.status).not.toHaveBeenCalledWith(401)
})

test('should throw error if token is invalid', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => null)

    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        headers: {
            authorization: "invalid token"
        }
    }

    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' })
})

test('should throw error if no authorization header is provided', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => null)

    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        headers: {}
    }

    verifyToken(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
})
