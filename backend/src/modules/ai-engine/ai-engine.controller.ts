import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiEngineService } from './ai-engine.service';
import { JwtAuthGuard } from '../../common/guards';
import { GenerateTestDto } from './dto/generate-test.dto';
import { AnalyzePageDto } from './dto/analyze-page.dto';
import { SelfHealDto } from './dto/self-heal.dto';

@ApiTags('ai-engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-engine')
export class AiEngineController {
  constructor(private readonly aiEngineService: AiEngineService) {}

  @Post('generate-test')
  @ApiOperation({ summary: 'Generate test code from user flow description' })
  async generateTest(@Body() dto: GenerateTestDto) {
    return this.aiEngineService.generateTest(dto);
  }

  @Post('analyze-page')
  @ApiOperation({ summary: 'Analyze page DOM and accessibility tree' })
  async analyzePage(@Body() dto: AnalyzePageDto) {
    return this.aiEngineService.analyzePage(dto);
  }

  @Post('self-heal')
  @ApiOperation({ summary: 'Suggest self-healing locators' })
  async suggestSelfHealing(@Body() dto: SelfHealDto) {
    return this.aiEngineService.suggestSelfHealing(dto);
  }

  @Get('edge-cases')
  @ApiOperation({ summary: 'Suggest edge cases for a test scenario' })
  async suggestEdgeCases(@Query('scenario') scenario: string) {
    return this.aiEngineService.suggestEdgeCases(scenario);
  }
}
