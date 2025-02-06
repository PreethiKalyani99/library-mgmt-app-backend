import passport from "passport";
import { Strategy } from "passport-local";
import { compare } from "bcrypt";
import { Users } from "../entity/Users";
import { AppDataSource } from "../data-source";
import jwt from "jsonwebtoken";

const userRepo = AppDataSource.getRepository(Users)

export default passport.use(
    new Strategy({ usernameField: "email"}, async (email, password, done) => {
        try{
            const lowerCaseEmail = email.toLowerCase()
            const user = await userRepo.findOne({ where: { email: lowerCaseEmail }, relations: ["role"]})
            
            if(!user){
                throw new Error("User not found")
            }
            const isPasswordMatch = await compare(password, user.password)
            
            if(!isPasswordMatch){
                throw new Error("Invalid credentials")
            }

            const userData = {
                user_id: user.user_id,
                email: user.email,
                role: user.role.role
            }

            const token = jwt.sign(userData, process.env.SECRET_KEY, { expiresIn: "1h" })

            done(null, { token })
        }
        catch(error){
            done(error, null)
        }
    })
)