import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { borrowedBookCreateSchema, borrowedBookUpdateSchema, searchPaginationSchema } from "../validationSchema";
import { insertBorrowedBook, updateBorrowedBook, getBorrowedBooksByPage } from "../data/borrowedBooksData";
import { verifyID } from "../middleware/verifyID";
import { authorizeRole } from "../middleware/authorization";
import { roles } from "../constants/roles";

const router = Router()

router.post('/', authorizeRole([roles.LIBRARIAN, roles.RECEPTIONIST]), async (req: Request, res: Response) => {
    const { error, value } = borrowedBookCreateSchema.validate(req.body)

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    await queryRunner.startTransaction()

    try{
        if(error){
            throw new Error(`${error}`)
        }
        const { book, borrower, borrow_date } = value
        const result = await insertBorrowedBook({ book, borrower, borrow_date, queryRunner })
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

router.get('/:id', authorizeRole([roles.LIBRARIAN, roles.READER, roles.RECEPTIONIST]), verifyID, async (req: Request, res: Response) => {
    const { error, value } = searchPaginationSchema.validate(req.query)
    const { id } = req.params

    try {
        if(error){
            throw new Error(`${error}`)
        }
        const { page_number, page_size, search } = value

        const result = await getBorrowedBooksByPage({ id: Number(id), page_number, page_size, search })
        res.status(200).json(result)
    }
    catch (error) {
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.get('/',authorizeRole([roles.LIBRARIAN, roles.RECEPTIONIST]),  async (req: Request, res: Response) => {
    const { error, value } = searchPaginationSchema.validate(req.query)

    try {
        if(error){
            throw new Error(`${error}`)
        }
        const { page_number, page_size, search } = value
        
        const result = await getBorrowedBooksByPage({ page_number, page_size, search })
        res.status(200).json(result)
    }
    catch (error) {
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.put('/:id', verifyID, authorizeRole([roles.LIBRARIAN, roles.RECEPTIONIST]), async (req: Request, res: Response) => {
    const { id } = req.params
    const { error, value } = borrowedBookUpdateSchema.validate(req.body)

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()
    
    await queryRunner.startTransaction()

    try{
        if(error){
            throw new Error(`${error}`)
        }
        const { return_date } = value
        const result = await updateBorrowedBook({ id: Number(id), return_date, queryRunner })
        await queryRunner.commitTransaction()
        res.status(200).json(result)
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

export default router