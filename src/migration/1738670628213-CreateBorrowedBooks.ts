import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBorrowedBooks1738670628213 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE borrowed_books(
                id SERIAL PRIMARY KEY, 
                book_id INT, 
                borrower_id INT, 
                borrow_date DATE NOT NULL, 
                return_date DATE, 
                CONSTRAINT fk_book_id FOREIGN KEY (book_id) REFERENCES books(book_id), 
                CONSTRAINT fk_borrower_id FOREIGN KEY (borrower_id) REFERENCES borrowers(borrower_id),
                CONSTRAINT date_check CHECK (borrow_date < return_date OR return_date IS NULL)
            )  
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE borrowed_books  
        `)
    }

}
