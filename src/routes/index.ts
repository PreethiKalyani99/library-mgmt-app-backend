import { Router, Request, Response, NextFunction } from "express"
import authorRoutes from '../routes/authorRoutes'
import bookRoutes from "../routes/bookRoutes"
import userRoutes from "../routes/userRoutes"
import "../strategies/local-strategies"
import jwt from 'jsonwebtoken'

const router = Router()

const tokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers
    try{
        if(!authorization){
            res.status(401).json({ error: "Unauthorized" })
        }
        const tokenMatch = jwt.verify(authorization, process.env.SECRET_KEY)
        if(!tokenMatch){
            throw new Error("Invalid token")
        }
        next()
    }
    catch(error){
        res.status(401).json({ error: error.message })
    }
}

router.use('/authors',tokenValidation, authorRoutes)
router.use('/books', bookRoutes)
router.use('/users', userRoutes)

export default router