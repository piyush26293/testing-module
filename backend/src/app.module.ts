import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import minioConfig from './config/minio.config';
import openaiConfig from './config/openai.config';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TestCasesModule } from './modules/test-cases/test-cases.module';
import { TestSuitesModule } from './modules/test-suites/test-suites.module';
import { ExecutionsModule } from './modules/executions/executions.module';
import { StorageModule } from './modules/storage/storage.module';
// import { ReportsModule } from './modules/reports/reports.module';
// import { AiEngineModule } from './modules/ai-engine/ai-engine.module';
// import { AuditModule } from './modules/audit/audit.module';
// import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, redisConfig, minioConfig, openaiConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          db: parseInt(process.env.REDIS_DB) || 0,
        },
      }),
    }),
    // HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    TestCasesModule,
    TestSuitesModule,
    ExecutionsModule,
    // ReportsModule,
    StorageModule,
    // AiEngineModule,
    // AuditModule,
  ],
})
export class AppModule {}
