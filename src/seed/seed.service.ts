import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'node:fs';
import { Readable, Transform } from 'node:stream';
import pLimit from 'p-limit';
import * as split2 from 'split2';
import { Product } from 'src/product/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly elasticsearchService: ElasticsearchService,
  ) {}
  async populateSeed() {
    const redable = createReadStream('C:\\Users\\mateu\\Downloads\\meta_Automotive.jsonl');
    const limit = pLimit(600); // Defina o limite de promessas simultâneas para 5, por exemplo

    const BATCH_SIZE = 600; // Número de itens por lote
    let batch = []; // Buffer para armazenar o lote

    // Função para salvar o lote de itens no banco de dados
    const saveBatch = async (data) => {
      // Simulação de gravação no banco de dados (poderia ser this.productRepository.save(batch))
      // console.log(`Salvando lote com ${JSON.stringify(batch)} itens...`);
      // Aqui você deveria substituir por uma chamada ao banco para salvar o lote de uma vez.
      const parsedData = JSON.parse(data);
      // console.log({ data });
      // batch.push({
      //   average_rating: parsedData.average_rating,
      //   description: parsedData.description?.toString(),
      //   title: parsedData.title?.toString(),
      //   price: parsedData.price,
      // });
      console.log(batch.length);

      try {
        console.log('saved');
        // await this.productRepository.save(batch);
        // await this.elasticsearchService.index({
        //   index: 'postgres-data-3',
        //   document: parsedData,
        // });

        batch = [];
      } catch (error) {
        // console.error('Erro no stream batch:', JSON.stringify(batch));
        console.error('cod error ', error);
      }
      if (batch.length >= 600) {
      }
    };

    const processStream = async () => {
      const transform = split2((data) => {
        try {
          console.log('saved');
          const obj = JSON.parse(data);
          // await this.productRepository.save(batch);
          this.elasticsearchService.index({
            index: 'postgres-data-3',
            document: {
              average_rating: obj.average_rating,
              description: obj.description?.toString(),
              title: obj.title?.toString(),
              price: obj.price,
            },
          });

          batch = [];
        } catch (error) {
          console.log('cod error ', error);
        }
        console.log('Processamento concluído.');
      });

      redable
        .pipe(transform)
        // .on('data', async (parsedData: string) => {
        //   // Processa o restante de itens no lote após o fim do arquivo
        //   try {
        //     console.log('saved');
        //     const obj = JSON.parse(parsedData);
        //     // await this.productRepository.save(batch);
        //     await this.elasticsearchService.index({
        //       index: 'postgres-data-3',
        //       document: {
        //         average_rating: obj.average_rating,
        //         description: obj.description?.toString(),
        //         title: obj.title?.toString(),
        //         price: obj.price,
        //       },
        //     });

        //     batch = [];
        //   } catch (error) {
        //     // console.error('Erro no stream batch:', JSON.stringify(batch));
        //     console.log('cod error ', error);
        //   }
        //   // if (batch.length >= 600) {
        //   // } else {
        //   //   try {
        //   //     // transform.resume();
        //   //   } catch (error) {
        //   //     console.error('failed to resume', error);
        //   //   }
        //   // }
        //   console.log('Processamento concluído.');
        // })
        // Divida o fluxo por linha
        // .on('pause', () => {
        //   if (batch.length >= 600) {
        //     const interval = setInterval(() => {
        //       if (batch.length >= 600) {
        //         // console.log(batch.length);
        //         return;
        //       } else {
        //         // transform.resume();
        //         clearInterval(interval);
        //       }
        //     }, 500);
        //   }
        // })
        .on('error', (err) => {
          console.error('Erro no stream:', err);
          console.error('Erro no stream batch:', JSON.stringify(batch));
        });
    };

    // Inicia o processamento do arquivo
    await processStream();
  }

  async populateIndex() {
    const selectStream = await this.productRepository.createQueryBuilder().select().stream();

    const elasticsearchService = this.elasticsearchService;

    const t = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        elasticsearchService
          .index({
            index: 'postgres-data-3',
            document: {
              id: chunk.Product_id,
              title: chunk.title,
              description: chunk.description,
              average_rating: chunk.average_rating,
              price: chunk.price,
            },
          })
          .catch((err) => console.error(err));

        callback();
      },
    });

    console.log('called');

    selectStream.pipe(t);

    selectStream.on('data', (data: any) => {
      // console.log({ data });
      // const res = JSON.parse(data as string);
      // this.elasticsearchService.index({
      //   index: 'postgres-data-2',
      //   document: {
      //     id: data.Product_id,
      //     title: data.title,
      //     description: data.description,
      //     average_rating: data.average_rating,
      //     price: data.price,
      //   },
      // });
    });

    return 'populateIndex';
  }
}
