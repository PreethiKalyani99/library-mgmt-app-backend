import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthors1737690708194 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE authors(author_id SERIAL PRIMARY KEY, name VARCHAR, country VARCHAR)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE authors`)
    }

}
