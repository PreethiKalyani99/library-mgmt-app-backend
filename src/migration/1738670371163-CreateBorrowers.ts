import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBorrowers1738670371163 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE borrowers(borrower_id SERIAL PRIMARY KEY, name VARCHAR NOT NULL, phone VARCHAR UNIQUE)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE borrowers  
        `)
    }

}
