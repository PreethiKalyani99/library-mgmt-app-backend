import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRoles1738839689629 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE roles(role_id SERIAL PRIMARY KEY, role VARCHAR NOT NULL)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE roles`)
    }

}
