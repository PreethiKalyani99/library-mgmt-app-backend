import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAddressTable1739938583487 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE address(
                id SERIAL PRIMARY KEY, 
                houseNumber VARCHAR, 
                street VARCHAR,
                area VARCHAR,
                city VARCHAR,
                country VARCHAR,
                pincode VARCHAR,
                coordinates POINT NOT NULL
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE address
        `)
    }

}
