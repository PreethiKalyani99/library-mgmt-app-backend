import { Router, Request, Response } from "express";
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
    const { author_id, title, published_year } = req.body
    try{
        if(!author_id || !title){
            throw new Error('Author id and title are required')
        }
        if (author_id && !/^[0-9]+$/.test(author_id.toString())) {
            throw new Error(`ID ${author_id} is invalid`)
        }

        const result = await insertBook({author_id: author_id, title: title, published_year: published_year})
        res.status(201).json(result)

    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params
    const { author_id, title, published_year } = req.body

    try{
        if(!id){
            throw new Error("ID is required")
        }
        if (id && !/^[0-9]+$/.test(id.toString())) {
            throw new Error(`ID ${id} is invalid`);
        }
        const result = await updateBook({ book_id: Number(id), author_id: author_id, title: title, published_year: published_year })
        res.status(200).json(result)
    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params

    try{
        if(!id){
            throw new Error("ID is required")
        }
        if (id && !/^[0-9]+$/.test(id.toString())) {
            throw new Error(`ID ${id} is invalid`)
        }
        await deleteBook(Number(id))
        res.status(200).send()
    }
    catch(error){
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

export default router