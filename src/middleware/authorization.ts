import { Request, Response, NextFunction } from "express"
import { AppDataSource } from "../data-source"
import { Roles } from "../entity/Roles"

interface JwtPayload {
    role: string
}

const rolesRepo = AppDataSource.getRepository(Roles)

export const authorizeRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { role } = req.user as JwtPayload
        try {
            const isRoleExist = await rolesRepo.findOne({ where: { role: role.toLowerCase() }})

            if(role.toLowerCase() === 'admin'){
                return next()
            }
            
            if (!isRoleExist || !allowedRoles.includes(role.toLowerCase())) {
                throw new Error("Forbidden: You do not have permission to access this resource.")
            }
            next()
        }
        catch (error) {
            res.status(403).json({ error: error.message })
        }
    }
}
