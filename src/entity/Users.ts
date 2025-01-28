import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany } from "typeorm";
import { hash } from "bcrypt"
import { Authors } from "./Authors";
import { Books } from "./Books";

@Entity()
export class Users{
    @PrimaryGeneratedColumn()
    user_id: number

    @Column()
    email: string

    @Column()
    password: string

    @OneToMany(() => Authors, (author) => author.users)
    authors: Authors[]

    @OneToMany(() => Books, (book) => book.users)
    books: Books[]

    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            try {
                this.password = await hash(this.password, 10)
            } 
            catch (error) {
                console.error('Error hashing password:', error)
                throw new Error('Password hashing failed')
            }
        }
    }
}
