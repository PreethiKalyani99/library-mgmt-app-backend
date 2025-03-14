import { Request, Response, NextFunction } from "express";
import { authorizeRole } from "../../middleware/authorization";
import { AppDataSource } from "../../data-source";

test('should allow if role is admin', async () => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        user: {
            role: "admin",
            userId: 1
        },
        params: {
            id: "1"
        },
        baseUrl: "/author"
    }

    await authorizeRole([])(req as Request, res as Response, next as NextFunction)

    expect(res.status).not.toHaveBeenCalledWith(403)
})

test('should allow if role is librarian', async () => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        user: {
            role: "librarian",
            userId: 1
        },
        params: {
            id: "1"
        },
        baseUrl: "/author"
    }

    const mockRepo = {
        findOne: jest.fn().mockResolvedValue({ role_id: 1, role: "librarian" })
    }
    
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

    await authorizeRole(['librarian'])(req as Request, res as Response, next as NextFunction)

    
    expect(res.status).not.toHaveBeenCalledWith(403)
})

test('should not allow if role is reader', async () => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        user: {
            role: "reader",
            userId: 1
        },
        params: {
            id: "1"
        },
        baseUrl: "/author"
    }

    const mockRepo = {
        findOne: jest.fn().mockResolvedValue({ role_id: 1, role: "reader" })
    }
    
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

    await authorizeRole(['librarian'])(req as Request, res as Response, next as NextFunction)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
        error: 'Forbidden: You do not have permission to access this resource.'
    })
})

test('should allow reader if route is /borrow and ids are matched', async () => {
    const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    }
    const next: NextFunction = jest.fn()
    const req: any = {
        user: {
            role: "reader",
            userId: 1
        },
        params: {
            id: "1"
        },
        baseUrl: "/borrow"
    }

    const mockRepo = {
        findOne: jest.fn().mockResolvedValue({ role_id: 1, role: "reader" })
    }
    
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo)

    await authorizeRole(['librarian', 'reader'])(req as Request, res as Response, next as NextFunction)

    expect(res.status).not.toHaveBeenCalledWith(403)
})
