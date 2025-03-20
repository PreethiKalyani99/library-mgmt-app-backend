import { MigrationInterface, QueryRunner } from "typeorm";

export class EmployeesTestTable1737446462676 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE employees_test(id SERIAL PRIMARY KEY, name VARCHAR, phone VARCHAR(10))
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "employees_test"`)
    }

}
