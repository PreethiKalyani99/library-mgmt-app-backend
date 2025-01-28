import { Router, Request, Response, NextFunction } from "express"
import authorRoutes from '../routes/authorRoutes'
import bookRoutes from "../routes/bookRoutes"
import userRoutes from "../routes/userRoutes"
import "../strategies/local-strategies"
import jwt, { JwtPayload} from 'jsonwebtoken'

const router = Router()

const tokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers
    try{
        if(!authorization){
            res.status(401).json({ error: "Unauthorized" })
        }
        const userInfo = jwt.verify(authorization, process.env.SECRET_KEY) as JwtPayload | null
        if(!userInfo){
            throw new Error("Invalid token")
        }
        req.user = {
            userId: userInfo.user_id,
            email: userInfo.email
        }
        next()
    }
    catch(error){
        res.status(401).json({ error: error.message })
    }
} 

router.use('/authors', tokenValidation, authorRoutes)
router.use('/books', tokenValidation,  bookRoutes)
router.use('/users', userRoutes)

export default router