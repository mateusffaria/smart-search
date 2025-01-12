import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'node:fs';
import * as split2 from 'split2';
import { Product } from 'src/product/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  async populateSeed() {
    const redable = createReadStream('dummy/meta_Subscription_Boxes.jsonl');

    redable.pipe(split2(JSON.parse)).on('data', async (data) => {
      await this.productRepository.save({
        average_rating: data.average_rating,
        description: data.description.toString(),
        title: data.title,
      });
    });

    redable.on('close', async () => {
      console.log('close stream');
    });

    redable.on('error', (err) => console.log(err));

    return `This action returns all product`;
  }
}
