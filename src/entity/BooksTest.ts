import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class BooksTest{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    address: string
}