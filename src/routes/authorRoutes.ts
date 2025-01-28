import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { insertAuthor, updateAuthor, deleteAuthor, getAuthorsById, getAuthorsByPage } from "../data/authorData";
import { verifyID } from "../middleware/verifyID";

interface JwtPayload {
    userId: number
    email: string
}

const router = Router()

router.get('/:id', verifyID, async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await getAuthorsById({ author_id: Number(id) })

        res.status(200).json(result)
    }
    catch (error) {
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.get('/', async (req: Request, res: Response) => {
    const { page_number, page_size } = req.query
    const pageNumber = /^[0-9]+$/.test(page_number?.toString()) ? Number(page_number) : 1
    const pageSize = /^[0-9]+$/.test(page_size?.toString()) ? Number(page_size) : 10
    try {
        const result = await getAuthorsByPage({ page_number: pageNumber, page_size: pageSize })

        res.status(200).json(result)
    }
    catch (error) {
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.post('/', async (req: Request, res: Response) => {
    const { name, country } = req.body
    const { userId } = req.user as JwtPayload
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    try {
        if (!name && !country) {
            throw new Error("Name is required")
        }
        const result = await insertAuthor({ name: name, country: country, queryRunner, userId: userId })
        await queryRunner.commitTransaction()
        res.status(201).json(result)
    }
    catch (error) {
        await queryRunner.rollbackTransaction()
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
    finally{
        await queryRunner.release()
    }
})

router.put('/:id', verifyID, async (req: Request, res: Response) => {
    const { id } = req.params
    const { name, country } = req.body
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try{
        const result = await updateAuthor({author_id: Number(id), name: name, country: country, queryRunner })

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

router.delete('/:id', verifyID, async (req: Request, res: Response) => {
    const { id } = req.params
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try{
        await deleteAuthor(Number(id), queryRunner)
        await queryRunner.commitTransaction()
        res.status(200).send()
    }
    catch(error){
        await queryRunner.rollbackTransaction()
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
    finally{
        queryRunner.release()
    }
})

export default router