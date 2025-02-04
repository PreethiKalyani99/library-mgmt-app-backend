import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Books } from "./Books";
import { Borrowers } from "./Borrowers";

@Entity()
export class BorrowedBooks {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Books, (book) => book.borrowedBooks)
    @JoinColumn({ name: "book_id" })
    books: Books

    @ManyToOne(() => Borrowers, (borrower) => borrower.borrowedBooks)
    @JoinColumn({ name: "borrower_id" })
    borrowers: Borrowers

    @Column("date")
    borrow_date: Date

    @Column("date", { nullable: true })
    return_date: Date | null
}