import { MigrationInterface, QueryRunner } from "typeorm";

export class SoftDeleteBooks1742442245832 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE books DROP COLUMN is_deleted
        `)

        await queryRunner.query(`
            ALTER TABLE borrowed_books DROP COLUMN is_deleted
        `)

        await queryRunner.query(`
            ALTER TABLE books ADD COLUMN deleted_at TIMESTAMP NULL
        `)

        await queryRunner.query(`
            ALTER TABLE borrowed_books ADD COLUMN deleted_at TIMESTAMP NULL
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE books DROP COLUMN deleted_at
        `)

        await queryRunner.query(`
            ALTER TABLE borrowed_books DROP COLUMN deleted_at
        `)
    }

}
