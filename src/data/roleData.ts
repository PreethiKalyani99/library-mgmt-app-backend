import { Roles } from "../entity/Roles";
import { AppDataSource } from "../data-source";

interface Role {
    role: string
    queryRunner: any
}

async function getRole({ role, queryRunner }: Role){
    const lowercaseRole = role.toLowerCase()
    return await queryRunner.manager.findOne(Roles, { where: { role: lowercaseRole }})
}

export async function createRole({ role, queryRunner }: Role){
    const newRole = new Roles()

    const roleExist = await getRole({ role, queryRunner })

    if(roleExist){
        throw new Error(`Role ${role} already exists`)
    }
    newRole.role = role
    
    await queryRunner.manager.save(newRole)
    return newRole
}


export function getRoles(){
    const role = AppDataSource.getRepository(Roles)
    
    return role.find()
}