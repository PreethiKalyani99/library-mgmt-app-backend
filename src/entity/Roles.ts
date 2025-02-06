import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Users } from "./Users";

@Entity()
export class Roles {
    @PrimaryGeneratedColumn()
    role_id: number

    @Column()
    role: string

    @OneToMany(() => Users, (user) => user.role)
    users: Users[]
}