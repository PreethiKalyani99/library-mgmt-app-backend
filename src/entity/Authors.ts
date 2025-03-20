import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { Books } from "./Books";
import { Users } from "./Users";

@Entity()
export class Authors{
    @PrimaryGeneratedColumn()
    author_id: number

    @Column()
    name: string

    @Column()
    country: string

    @ManyToOne(() => Users, (user) => user.authors, { onDelete: 'SET NULL', nullable: true})
    @JoinColumn({ name: "created_by"})
    users: Users

    @OneToMany(() => Books, (book) => book.author, { cascade: true })
    books: Books[]
}