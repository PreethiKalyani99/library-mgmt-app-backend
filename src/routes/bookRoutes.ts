import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { insertBook, updateBook, deleteBook, getBookById, getBooksByPage } from "../data/bookData";
import { verifyID } from "../middleware/verifyID";
import { searchPaginationSchema, bookCreateSchema } from "../validationSchema";
import { authorizeRole } from "../middleware/authorization";
import { roles } from "../constants/roles";

interface JwtPayload {
    userId: number
    email: string
}

const router = Router()

router.get('/:id', authorizeRole([roles.LIBRARIAN, roles.READER]), verifyID, async (req: Request, res: Response) => {
    const { id } = req.params 

    try{
        const result =  await getBookById({book_id: Number(id)})
        res.status(200).json(result)
    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.get('/', authorizeRole([roles.LIBRARIAN, roles.READER]), async (req: Request, res: Response) => {
    const { error, value } = searchPaginationSchema.validate(req.query)

    try{
        if(error){
            throw new Error(`${error}`)
        }

        const { page_number, page_size } = value
        const result = await getBooksByPage({ page_number, page_size })
        res.status(200).json(result)
    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.post('/', authorizeRole([roles.LIBRARIAN]), async (req: Request, res: Response) => {
    const { error, value } = bookCreateSchema.validate(req.body)
    const { userId } = req.user as JwtPayload

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()
    
    try{
        if(error){
            throw new Error(`${error}`)
        }
        const { author, title, published_year } = value

        const result = await insertBook({author: author, title: title, published_year: published_year, queryRunner, userId: userId})
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

router.put('/:id', authorizeRole([roles.LIBRARIAN]), verifyID, async (req: Request, res: Response) => {
    const { id } = req.params
    const { userId } = req.user as JwtPayload
    const { author, title, published_year } = req.body

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()

    try{
        const result = await updateBook({ book_id: Number(id), author: author, title: title, published_year: published_year, queryRunner, userId })
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

router.delete('/:id', authorizeRole([roles.LIBRARIAN]),  verifyID, async (req: Request, res: Response) => {
    const { id } = req.params

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()

    try{
        await deleteBook(Number(id), queryRunner)
        await queryRunner.commitTransaction()
        res.status(200).send()
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