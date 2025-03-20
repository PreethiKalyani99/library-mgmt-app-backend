import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from "typeorm";
import { Books } from "./Books";
import { Users } from "./Users";

@Entity()
export class BorrowedBooks {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Books, (book) => book.borrowedBooks)
    @JoinColumn({ name: "book_id" })
    books: Books

    @ManyToOne(() => Users, (user) => user.borrowedBooks)
    @JoinColumn({ name: "borrower_id" })
    users: Users

    @Column("date")
    borrow_date: Date

    @Column("date", { nullable: true })
    return_date: Date | null

    @DeleteDateColumn({ nullable: true })
    is_deleted: Date | null
}