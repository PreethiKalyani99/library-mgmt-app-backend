import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { insertUser, getUser } from "../data/userData";

const router = Router()

router.post('/sign-up', async (req: Request, res: Response) => {
    const { email, password } = req.body

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()

    if (!email || !password) {
        throw new Error("Email and Password are required")
    }

    try{
        const result = await insertUser({ email: email, password: password, queryRunner: queryRunner})
        await queryRunner.commitTransaction()
        res.status(201).json(result)
    }
    catch(error){
        await queryRunner.rollbackTransaction()
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
    finally{
        await queryRunner.release()
    }
})

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()

    if (!email || !password) {
        throw new Error("Email and Password are required")
    }

    try{
        const result = await getUser({ email: email, password: password, queryRunner: queryRunner})
        await queryRunner.commitTransaction()
        res.status(200).json(result)
    }
    catch(error){
        await queryRunner.rollbackTransaction()
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
    finally{
        await queryRunner.release()
    }
})

export default router