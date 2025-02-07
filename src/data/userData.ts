import { Users } from "../entity/Users";
import { Roles } from "../entity/Roles";
import { compare } from "bcrypt";

interface UserProps{
    email: string
    password: string
    queryRunner:any
    role: string
}

interface UserExistProp {
    queryRunner:any
    id?: number
    email?: string
}

async function isUserExists({ id, email, queryRunner }: UserExistProp){
    if(email){
        const lowerCaseEmail = email.toLowerCase()
        return await queryRunner.manager.findOne(Users, { where: { email: lowerCaseEmail }})
    }
    if(id){
        return await queryRunner.manager.findOne(Users, { where: { user_id: id }}) 
    }
}

export async function insertUser({email, password, queryRunner, role}: UserProps){
    const user = await isUserExists({ email, queryRunner })
    
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
    const user = await isUserExists({ email, queryRunner })

    if(!user){
        throw new Error(`User with email ${email} does not exist`)
    }

    const isPasswordMatch = await compare(password, user.password)

    if(!isPasswordMatch){
        throw new Error(`Incorrect Password`)
    }
    return user
}

interface UpdateUserProp {
    id: number
    role: string
    queryRunner: any
}

export async function updateUser({ id, role, queryRunner }: UpdateUserProp) {
    const user = await isUserExists({ id, queryRunner })
    const roleExist = await  queryRunner.manager.findOne(Roles, { where: { role }})

    if(!user){
        throw new Error(`User with ID ${id} does not exist`)
    }

    user.role = roleExist
    queryRunner.manager.save(user)
    return user
}
