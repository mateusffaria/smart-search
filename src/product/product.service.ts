import { Injectable } from '@nestjs/common';
import { FindOperator, Like, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}
  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  findByDescriptionDB(desc: string) {
    return this.productRepository
      .createQueryBuilder('products')
      .select()
      .where(`products.title like :desc or products.description like :desc`)
      .setParameters({ desc: `%${desc}%` })
      .limit(10)
      .getMany();
  }

  async findByDescriptionES(desc: string) {
    const q = await this.elasticsearchService.search({
      index: 'postgres-data-3',
      query: {
        // more_like_this: {
        //   like: desc,
        //   fields: ['title', 'description'],
        // },

        multi_match: {
          query: desc,
          fields: ['title', 'description'],
        },
      },
    });

    console.log(q);
    const hits = q.hits.hits;
    return hits.map((item) => item._source);
  }
}
