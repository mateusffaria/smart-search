import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgresPass',
      database: 'smart_search',
      entities: [Product],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [],
  providers: [SeedService],
})
export class SeedModule {}
