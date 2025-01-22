import express, { Express, Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { insertAuthor, updateAuthor, deleteAuthor, getAuthorsById, getAuthorsByPage } from "./data/authorData"
import { insertBook, updateBook, deleteBook, listBooks } from "./data/bookData"

const app: Express = express()
const port: number = 4000

app.use(express.json())

AppDataSource.initialize().then(async () => {
    app.get('/authors/:id', async (req: Request, res: Response) => {
        const { id } = req.params
        try{
            if(!id){
                throw new Error("ID is required")
            }
            if (id && !/^[0-9]+$/.test(id.toString())) {
                throw new Error(`ID ${id} is invalid`);
            }

            const result =  await getAuthorsById({author_id: Number(id)})
            res.status(200).json(result)
        }
        catch(error){
            console.error('Error:', error.message)
            res.status(404).json({ error: error.message })
        }
    })

    app.get('/authors', async (req: Request, res: Response) => {
        const { page_number, page_size } = req.query 
        const pageNumber = /^[0-9]+$/.test(page_number?.toString()) ? Number(page_number) : 1
        const pageSize = /^[0-9]+$/.test(page_size?.toString()) ? Number(page_size) : 10

        try{
            const result = await getAuthorsByPage({ page_number: pageNumber, page_size: pageSize})
            res.status(200).json(result)
        }
        catch(error){
            console.error('Error:', error.message)
            res.status(404).json({ error: error.message })
        }
    })

    app.post('/authors', async (req: Request, res: Response) => {
        const { name, country } = req.body
        try{
            if(!name && !country){
                throw new Error("Name is required")
            }
            const result = await insertAuthor({name: name, country: country})
            res.status(201).json(result)
        }
        catch(error){
            console.error('Error:', error.message)
            res.status(404).json({ error: error.message })
        }
    })

    app.put('/authors/:id', async (req: Request, res: Response) => {
        const { id } = req.params
        const { name, country } = req.body

        try{
            if(!id){
                throw new Error("ID is required")
            }
            if (id && !/^[0-9]+$/.test(id.toString())) {
                throw new Error(`ID ${id} is invalid`)
            }

            const result = await updateAuthor({author_id: Number(id), name: name, country: country})
            res.status(200).json(result)
        }
        catch(error){
            console.error('Error:', error.message)
            res.status(404).json({ error: error.message })
        }
    })

    app.delete('/authors/:id', async (req: Request, res: Response) => {
        const { id } = req.params

        try{
            if(!id){
                throw new Error("ID is required")
            }
            if (id && !/^[0-9]+$/.test(id.toString())) {
                throw new Error(`ID ${id} is invalid`)
            }
            await deleteAuthor(Number(id))
            res.status(200).send()
        }
        catch(error){
            console.error('Error:', error.message)
            res.status(404).json({ error: error.message })
        }
    })

    app.get('/books/:id', async (req: Request, res: Response) => {
        const { id } = req.params

        try{
            if(!id){
                throw new Error("ID is required")
            }
            if (id && !/^[0-9]+$/.test(id.toString())) {
                throw new Error(`ID ${id} is invalid`);
            }

            const result =  await listBooks({book_id: Number(id)})
            res.status(200).json(result)
        }
        catch(error){
            console.error('Error:', error.message)
            res.status(404).json({ error: error.message })
        }
    })

    app.get('/books/all', async (req: Request, res: Response) => {
        const result =  await listBooks({book_id: null})
        res.status(200).json(result)
    })
    
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    })
    
}).catch(error => console.log(error))
