import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DefaultModule } from './default/default.module';

@Module({
  imports: [DefaultModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
