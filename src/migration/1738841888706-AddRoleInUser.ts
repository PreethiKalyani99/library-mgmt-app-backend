import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleInUser1738841888706 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users ADD COLUMN role_id INT, ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(role_id)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN role_id`)
    }

}
