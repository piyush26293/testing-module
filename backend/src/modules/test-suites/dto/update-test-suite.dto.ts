import { PartialType } from '@nestjs/swagger';
import { CreateTestSuiteDto } from './create-test-suite.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateTestSuiteDto extends PartialType(
  OmitType(CreateTestSuiteDto, ['projectId'] as const),
) {}
