import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthorsTestTable1737446441662 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE authors_test(id SERIAL PRIMARY KEY, name VARCHAR, country VARCHAR)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "authors_test"`)
    }

}
