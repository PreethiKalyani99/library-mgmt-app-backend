require('dotenv').config()

import "reflect-metadata"
import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    // host: 'localhost',
    // port: 4000,
    synchronize: true,
    logging: true,
    entities: ['src/entity/**/*.ts'],
    migrations: [
        "src/migration/**/*.ts",
    ],
    subscribers: [],
    migrationsTransactionMode: "each"
})
    