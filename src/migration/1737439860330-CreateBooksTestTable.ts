import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBooksTestTable1737439860330 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE books_test(id SERIAL PRIMARY KEY, name VARCHAR, address VARCHAR)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "books_test"`)
    }

}
