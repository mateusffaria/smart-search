import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);

  const seeder = app.get(SeedService);
  // const rest = await seeder.populateSeed();
  const rest = await seeder.populateIndex();

  console.log(rest);

  // await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
