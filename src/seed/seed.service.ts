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
    const limit = pLimit(100); // Defina o limite de promessas simultâneas para 5, por exemplo

    const BATCH_SIZE = 100; // Número de itens por lote
    let batch = []; // Buffer para armazenar o lote

    // Função para salvar o lote de itens no banco de dados
    const saveBatch = async (data) => {
      // Simulação de gravação no banco de dados (poderia ser this.productRepository.save(batch))
      // console.log(`Salvando lote com ${JSON.stringify(batch)} itens...`);
      // Aqui você deveria substituir por uma chamada ao banco para salvar o lote de uma vez.
      const parsedData = JSON.parse(data);
      console.log({ data });
      batch.push({
        average_rating: parsedData.average_rating,
        description: parsedData.description?.toString(),
        title: parsedData.title,
        price: parsedData.price,
      });
      console.log(batch.length);
      if (batch.length >= 10000) {
        try {
          console.log('saved');
          await this.productRepository.save(batch);
          batch = [];
        } catch (error) {
          // console.error('Erro no stream batch:', JSON.stringify(batch));
          // console.error('cod error ', error);
        }
      }
    };

    const processStream = () => {
      const transform = split2(saveBatch);

      redable
        .on('data', async () => {
          // Processa o restante de itens no lote após o fim do arquivo
          if (batch.length >= 10000) {
            transform.pause();
          } else {
            try {
              transform.resume();
            } catch (error) {
              console.error('failed to resume', error);
            }
          }
          console.log('Processamento concluído.');
        })
        .pipe(transform) // Divida o fluxo por linha
        .on('pause', () => {
          if (batch.length >= 10000) {
            const interval = setInterval(() => {
              if (batch.length >= 10000) {
                return;
              } else {
                transform.resume();
                clearInterval(interval);
              }
            }, 500);
          }
        })
        .on('error', (err) => {
          console.error('Erro no stream:', err);
          console.error('Erro no stream batch:', JSON.stringify(batch));
        });
    };

    // Inicia o processamento do arquivo
    processStream();
  }

  async populateIndex() {
    const selectStream = await this.productRepository.createQueryBuilder().select().stream();

    const elasticsearchService = this.elasticsearchService;

    const t = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        elasticsearchService
          .index({
            index: 'postgres-data-2',
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
