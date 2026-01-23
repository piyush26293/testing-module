import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiEngineService } from './ai-engine.service';
import { AiEngineController } from './ai-engine.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AiEngineController],
  providers: [AiEngineService],
  exports: [AiEngineService],
})
export class AiEngineModule {}
