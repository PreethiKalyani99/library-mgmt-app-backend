import { Roles } from "../entity/Roles";

interface RoleProp {
    role: string
    queryRunner: any
}

async function isRoleExist({ role, queryRunner }: RoleProp){
    const lowercaseRole = role.toLowerCase()
    return await queryRunner.manager.findOne(Roles, { where: { role: lowercaseRole }})
}

export async function createRole({ role, queryRunner }: RoleProp){
    const newRole = new Roles()

    const roleExist = await isRoleExist({ role, queryRunner })

    if(roleExist){
        throw new Error(`Role ${role} already exists`)
    }
    newRole.role = role
    
    await queryRunner.manager.save(newRole)
    return newRole
}