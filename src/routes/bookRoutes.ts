import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { insertBook, updateBook, deleteBook, getBookById, getBooksByPage } from "../data/bookData";

const router = Router()

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params

    try{
        if(!id){
            throw new Error("ID is required")
        }
        if (id && !/^[0-9]+$/.test(id.toString())) {
            throw new Error(`ID ${id} is invalid`)
        }

        const result =  await getBookById({book_id: Number(id)})
        res.status(200).json(result)
    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.get('/', async (req: Request, res: Response) => {
    const { page_number, page_size } = req.query 
    const pageNumber = /^[0-9]+$/.test(page_number?.toString()) ? Number(page_number) : 1
    const pageSize = /^[0-9]+$/.test(page_size?.toString()) ? Number(page_size) : 10

    try{
        const result = await getBooksByPage({ page_number: pageNumber, page_size: pageSize})
        res.status(200).json(result)
    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.post('/', async (req: Request, res: Response) => {
    const { author, title, published_year } = req.body
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    
    try{
        if(!title){
            throw new Error("Title is required")
        }
        if (author?.id && !/^[0-9]+$/.test(author.id.toString())) {
            throw new Error(`ID ${author.id} is invalid`)
        }

        const result = await insertBook({author: author, title: title, published_year: published_year, queryRunner})
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

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const { author, title, published_year } = req.body
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try{
        if(!id){
            throw new Error("ID is required")
        }
        if (id && !/^[0-9]+$/.test(id.toString())) {
            throw new Error(`ID ${id} is invalid`);
        }
        const result = await updateBook({ book_id: Number(id), author: author, title: title, published_year: published_year, queryRunner })
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

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try{
        if(!id){
            throw new Error("ID is required")
        }
        if (id && !/^[0-9]+$/.test(id.toString())) {
            throw new Error(`ID ${id} is invalid`)
        }
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