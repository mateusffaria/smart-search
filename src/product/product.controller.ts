import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.productService.findOne(+id);
  // }

  @Get('/search')
  async searchByTextDB(@Query('q') q: string) {
    console.log({ q });
    return await this.productService.findByDescriptionDB(q);
  }

  @Get('/elasticsearch')
  async searchByTextES(@Query('q') q: string) {
    console.log({ q });
    return await this.productService.findByDescriptionES(q);
  }
}
