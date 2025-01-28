import { Request, Response, NextFunction } from "express"

export const verifyID = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params 
    try{
        if(!id){
            throw new Error("ID is required")
        }
        if (id && !/^[0-9]+$/.test(id.toString())) {
            throw new Error(`ID ${id} is invalid`)
        }
        next()
    }
    catch(error){
        res.status(404).json({ error: error.message })
    }
}