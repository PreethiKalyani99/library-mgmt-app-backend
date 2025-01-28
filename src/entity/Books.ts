import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Authors } from "./Authors";
import { Users } from "./Users";

@Entity()
export class Books{
    @PrimaryGeneratedColumn()
    book_id: number

    @Column()
    title: string

    @Column()
    published_year: number
    
    @ManyToOne(() => Authors, (author) => author.books, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "author_id" }) 
    author: Authors

    @ManyToOne(() => Users, (user) => user.books, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: "created_by" })
    users: Users
}