import { Users } from "../entity/Users";
import { Roles } from "../entity/Roles";
import { compare } from "bcrypt";
import { AppDataSource } from "../data-source";

interface User{
    email: string
    password: string
    queryRunner:any
    role: string
}

interface FindUser {
    queryRunner:any
    id?: number
    email?: string
}

async function findUser({ id, email, queryRunner }: FindUser){
    if(email){
        const lowerCaseEmail = email.toLowerCase()
        return await queryRunner.manager.findOne(Users, { where: { email: lowerCaseEmail }})
    }
    if(id){
        return await queryRunner.manager.findOne(Users, { where: { user_id: id }}) 
    }
}

export async function insertUser({email, password, queryRunner, role}: User){
    const user = await findUser({ email, queryRunner })
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

interface GetUser {
    email: string
    password: string
    queryRunner: any
}

export async function getUser({ email, password, queryRunner }: GetUser) {
    const user = await findUser({ email, queryRunner })

    if(!user){
        throw new Error(`User with email ${email} does not exist`) 
    }

    const isPasswordMatch = await compare(password, user.password)

    if(!isPasswordMatch){
        throw new Error(`Incorrect Password`)
    }
    return user
}

interface UpdateUser {
    id: number
    role: string
    queryRunner: any
}

export async function updateUser({ id, role, queryRunner }: UpdateUser) {
    const user = await findUser({ id, queryRunner })
    
    if(!user){
        throw new Error(`User with ID ${id} does not exist`)
    }

    const roleExist = await  queryRunner.manager.findOne(Roles, { where: { role }})

    if(!roleExist){
        throw new Error(`Role ${role} does not exist`)
    }

    user.role = roleExist
    queryRunner.manager.save(user)
    return user
}

interface GetUsersByPage {
    page_number: number
    page_size: number
    search: string
}

export async function getUsersByPage({ page_number, page_size, search }: GetUsersByPage){
    const users = AppDataSource.getRepository(Users)
    const skip = (page_number - 1) * page_size

    const queryBuilder = users.createQueryBuilder('user')
        .skip(skip)
        .take(page_size)
        .select(['user.user_id', 'user.email'])
        .leftJoin('user.role', 'role')
        .addSelect(['role.role'])

    if(search){
        queryBuilder.where(
            "LOWER(role.role) LIKE LOWER(:search) OR user.email LIKE LOWER(:search)", { search: `%${search}%` } 
        )
    }

    const [data, totalCount] = await queryBuilder.getManyAndCount()
    
    return {
        data,
        totalCount,
        totalPages: Math.ceil(totalCount / page_size),
        currentPage: page_number
    }
}