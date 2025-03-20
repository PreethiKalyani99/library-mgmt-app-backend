import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Address{
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    housenumber: string

    @Column({ nullable: true })
    street: string

    @Column({ nullable: true })
    area: string

    @Column({ nullable: true })
    city: string

    @Column({ nullable: true })
    country: string

    @Column({ nullable: true })
    pincode: string

    @Column()
    coordinates: string
}