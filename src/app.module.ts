import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DefaultModule } from './default/default.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/workshop-unit-tests'),
    DefaultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
