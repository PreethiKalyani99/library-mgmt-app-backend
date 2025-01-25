import { Users } from "../entity/Users";
import { compare } from "bcrypt";

interface UserProps{
    email: string
    password: string
    queryRunner:any
}

async function isUserExists(email: string, queryRunner: any){
    const lowerCaseEmail = email.toLowerCase()
    return await queryRunner.manager.findOne(Users, { where: { email: lowerCaseEmail }})
}

export async function insertUser({email, password, queryRunner}: UserProps){
    const user = await isUserExists(email, queryRunner)

    if(!user){
        const newUser = new Users()
        newUser.email = email.toLowerCase()
        newUser.password = password

        await queryRunner.manager.save(newUser)
        return newUser
    }
    else{
        throw new Error(`User ${email.toLowerCase()} already exists`)
    }
}

export async function getUser({ email, password, queryRunner }: UserProps) {
    const user = await isUserExists(email, queryRunner)

    if(!user){
        throw new Error(`User with email ${email} does not exist`)
    }

    const isPasswordMatch = await compare(password, user.password)

    if(!isPasswordMatch){
        throw new Error(`Incorrect Password`)
    }
    return user
}