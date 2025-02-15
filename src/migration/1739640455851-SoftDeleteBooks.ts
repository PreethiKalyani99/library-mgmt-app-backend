import { MigrationInterface, QueryRunner } from "typeorm";

export class SoftDeleteBooks1739640455851 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE books ADD COLUMN is_deleted BOOLEAN NULL
        `)

        await queryRunner.query(`
            ALTER TABLE borrowed_books ADD COLUMN is_deleted BOOLEAN NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE books DROP COLUMN is_deleted
        `)

        await queryRunner.query(`
            ALTER TABLE borrowed_books DROP COLUMN is_deleted
        `)
    }

}
