import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

interface JwtPayload {
    user_id: number
    email: string
    role: string
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers
    try{
        if(!authorization){
            throw new Error("Unauthorized")
        }
        const userInfo = jwt.verify(authorization, process.env.SECRET_KEY) as JwtPayload | null
        if(!userInfo){
            throw new Error("Invalid token")
        }
        req.user = {
            userId: userInfo.user_id,
            email: userInfo.email,
            role: userInfo.role
        }
        next()
    }
    catch(error){
        res.status(401).json({ error: error.message })
    }
} 