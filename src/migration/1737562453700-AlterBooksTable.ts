import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBooksTable1737562453700 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE books ALTER COLUMN author_id SET NOT NULL`)
        await queryRunner.query(`ALTER TABLE books ALTER COLUMN title SET NOT NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE books ALTER COLUMN author_id DROP NOT NULL`)
        await queryRunner.query(`ALTER TABLE books ALTER COLUMN title DROP NOT NULL`)
    }

}