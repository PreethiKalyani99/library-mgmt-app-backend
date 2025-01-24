import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBooks1737691559887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE books(book_id SERIAL PRIMARY KEY, author_id INT, title VARCHAR, published_year INT, CONSTRAINT fk_author_id FOREIGN KEY (author_id) REFERENCES authors(author_id))
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "books"`)

    }

}
