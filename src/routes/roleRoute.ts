import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { roleSchema } from "../validationSchema";
import { createRole, getRoles } from "../data/roleData";

const router = Router()

router.post('/', async (req: Request, res: Response) => {
    const { error, value } = roleSchema.validate(req.body)

    const queryRunner = AppDataSource.createQueryRunner()
    await queryRunner.connect()

    await queryRunner.startTransaction()

    try{
        if(error){
            throw new Error(`${error}`)
        }
        const { role } = value
        const result = await createRole({ role, queryRunner })
        await queryRunner.commitTransaction()
        res.status(201).json(result)
    }
    catch(error){
        await queryRunner.rollbackTransaction()
        console.error('Error:', error.message)
        res.status(404).json({ error: error.message })
    }
})

router.get('/', async (req: Request, res: Response) => {
    try {
        const result = await getRoles()
        res.status(200).json(result)
    }
    catch(error){
        res.status(404).json({ error: error.message })
    }
})
export default router