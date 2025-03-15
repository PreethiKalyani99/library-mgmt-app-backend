require('dotenv').config()

import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    dropSchema: true,
    logging: true,
    entities: ['src/entity/**/*.ts'],
    migrations: [
        "src/migration/**/*.ts",
    ],
    subscribers: [],
    migrationsTransactionMode: "each"
})
    