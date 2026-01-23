import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTestCaseDto } from './create-test-case.dto';

export class UpdateTestCaseDto extends PartialType(
  OmitType(CreateTestCaseDto, ['projectId', 'steps'] as const),
) {}
