import request from "supertest";
import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../../data-source";
import app from "../../app";
import { insertAuthor } from "../../data/authorData"; 

jest.mock('../../data/authorData')

jest.mock("../../middleware/verifyToken", () => ({
    verifyToken: jest.fn((req: Request, res: Response, next: NextFunction) => {
        req.user = { userId: 1, role: "admin" }
        next()
    }),
}))

jest.mock("../../middleware/authorization", () => ({
    authorizeRole: jest.fn((allowedRoles: string[]) =>
        jest.fn(async (req: Request, res: Response, next: NextFunction) => {
            next()
        })
    ),
}))


beforeAll(async () => {
    await AppDataSource.initialize()
})

afterAll(async () => {
    await AppDataSource.destroy()
    await new Promise((resolve) => setTimeout(resolve, 1000))
})

const author = { name: "Kalki", country: "India" }

test("should create a new author", async () => {
    (insertAuthor as jest.Mock).mockResolvedValue(author)

    const response = await request(app)
        .post("/authors")
        .set("Authorization", "mock token")
        .send(author)

    expect(response.status).toBe(201)
    expect(response.body).toEqual(author)
})
