import { Request, Response, NextFunction } from "express"
import { idSchema } from "../validationSchema"

export const verifyID = (req: Request, res: Response, next: NextFunction) => {
    const { error } = idSchema.validate(req.params)
    try {
        if (error) {
            throw new Error(`${error}`)
        }
        next()
    }
    catch (error) {
        res.status(404).json({ error: error.message })
    }
}