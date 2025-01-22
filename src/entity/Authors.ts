import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Books } from "./Books";

@Entity()
export class Authors{
    @PrimaryGeneratedColumn()
    author_id: number

    @Column()
    name: string

    @Column()
    country: string

    @OneToMany(() => Books, (book) => book.author, { cascade: true })
    books: Books[]
}