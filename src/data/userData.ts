import { Users } from "../entity/Users";
import { Roles } from "../entity/Roles";
import { compare } from "bcrypt";

interface UserProps{
    email: string
    password: string
    queryRunner:any
    role: string
}

async function isUserExists(email: string, queryRunner: any){
    const lowerCaseEmail = email.toLowerCase()
    return await queryRunner.manager.findOne(Users, { where: { email: lowerCaseEmail }})
}

export async function insertUser({email, password, queryRunner, role}: UserProps){
    const user = await isUserExists(email, queryRunner)
    
    if(user){
        throw new Error(`User ${email.toLowerCase()} already exists`)
    }
    const roleExist = await  queryRunner.manager.findOne(Roles, { where: { role }})

    if(!roleExist){
        throw new Error(`Role ${role} does not exist`)
    }

    const newUser = new Users()
    
    newUser.email = email.toLowerCase()
    newUser.password = password
    newUser.role = roleExist

    await queryRunner.manager.save(newUser)
    return newUser
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