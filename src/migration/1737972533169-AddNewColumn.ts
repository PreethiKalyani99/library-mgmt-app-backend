import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColumn1737972533169 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE books ADD COLUMN created_by INT, ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
        `)
        await queryRunner.query(`
            ALTER TABLE authors ADD COLUMN created_by INT, ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id)
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE books DROP COLUMN created_by
        `)
        await queryRunner.query(`
            ALTER TABLE authors DROP COLUMN created_by
        `)
    }
}
