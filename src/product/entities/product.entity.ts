import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ scale: 2, type: 'float' })
  average_rating: number;

  @Column({ scale: 4, type: 'float', nullable: true })
  price: number;
}
