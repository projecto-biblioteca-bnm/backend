import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as cors from 'cors';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaService } from './prisma/prisma.service';

dotenv.config();

async function fixMissingReaderRecords(prisma: PrismaService) {
  try {
    const readerUsers = await prisma.user.findMany({
      where: { user_type: 'Reader' }
    });

    let fixedCount = 0;
    for (const user of readerUsers) {
      const existingReader = await prisma.reader.findUnique({
        where: { id: user.id }
      });

      if (!existingReader) {
        await prisma.reader.create({
          data: {
            id: user.id,
            identification_number: `READER_${user.id}`,
          },
        });
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      console.log(`✅ Fixed ${fixedCount} missing Reader records`);
    }
  } catch (error) {
    console.error('❌ Error fixing Reader records:', error);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with default options
  app.use(cors());

  // Apply the global exception filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are provided
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );

  // Add a global prefix to all routes
  app.setGlobalPrefix('api');

  // Initialize database and fix missing records
  const prismaService = app.get(PrismaService);
  await fixMissingReaderRecords(prismaService);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
