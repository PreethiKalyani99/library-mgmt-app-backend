import { MigrationInterface, QueryRunner } from "typeorm";

export class Users1737793962009 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users(user_id SERIAL PRIMARY KEY NOT NULL, email VARCHAR UNIQUE, password VARCHAR NOT NULL)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE users`)
    }
    
}