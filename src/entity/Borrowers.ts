import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BorrowedBooks } from "./BorrowedBooks";

@Entity()
export class Borrowers {
    @PrimaryGeneratedColumn()
    borrower_id: number

    @Column()
    name: string

    @Column()
    phone: string

    @OneToMany(() => BorrowedBooks, (borrowed_book) => borrowed_book.borrowers)
    borrowedBooks: BorrowedBooks[]
}