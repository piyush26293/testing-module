import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GenerateTestDto } from './dto/generate-test.dto';
import { AnalyzePageDto } from './dto/analyze-page.dto';
import { SelfHealDto } from './dto/self-heal.dto';
import {
  TEST_GENERATION_PROMPT,
  PAGE_ANALYSIS_PROMPT,
  SELF_HEALING_PROMPT,
  EDGE_CASE_PROMPT,
} from './prompts/test-generation.prompts';

@Injectable()
export class AiEngineService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateTest(dto: GenerateTestDto): Promise<any> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const prompt = TEST_GENERATION_PROMPT.replace('{{USER_FLOW}}', dto.userFlow)
      .replace('{{URL}}', dto.url || '')
      .replace('{{FRAMEWORK}}', dto.framework || 'playwright');

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert test automation engineer.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return {
        testCode: completion.choices[0].message.content,
        framework: dto.framework || 'playwright',
      };
    } catch (error) {
      throw new BadRequestException('Failed to generate test: ' + error.message);
    }
  }

  async analyzePage(dto: AnalyzePageDto): Promise<any> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const prompt = PAGE_ANALYSIS_PROMPT.replace('{{DOM_TREE}}', dto.domTree)
      .replace('{{URL}}', dto.url)
      .replace('{{A11Y_TREE}}', dto.accessibilityTree || '');

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert in web accessibility and test automation.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      });

      const analysis = completion.choices[0].message.content;

      return {
        analysis,
        suggestions: this.extractSuggestions(analysis),
        elements: this.extractKeyElements(dto.domTree),
      };
    } catch (error) {
      throw new BadRequestException('Failed to analyze page: ' + error.message);
    }
  }

  async suggestSelfHealing(dto: SelfHealDto): Promise<any> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const prompt = SELF_HEALING_PROMPT.replace('{{BROKEN_LOCATOR}}', dto.brokenLocator)
      .replace('{{ERROR_MESSAGE}}', dto.errorMessage)
      .replace('{{DOM_SNAPSHOT}}', dto.domSnapshot);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert in test automation and locator strategies.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const suggestion = completion.choices[0].message.content;

      return {
        originalLocator: dto.brokenLocator,
        suggestedLocators: this.extractLocators(suggestion),
        explanation: suggestion,
        confidence: this.calculateConfidence(suggestion),
      };
    } catch (error) {
      throw new BadRequestException('Failed to suggest self-healing: ' + error.message);
    }
  }

  async suggestEdgeCases(testScenario: string): Promise<any> {
    if (!this.openai) {
      throw new BadRequestException('OpenAI API key not configured');
    }

    const prompt = EDGE_CASE_PROMPT.replace('{{TEST_SCENARIO}}', testScenario);

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert QA engineer focused on edge cases.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      const edgeCases = completion.choices[0].message.content;

      return {
        edgeCases: this.parseEdgeCases(edgeCases),
        recommendations: edgeCases,
      };
    } catch (error) {
      throw new BadRequestException('Failed to suggest edge cases: ' + error.message);
    }
  }

  private extractSuggestions(analysis: string): string[] {
    // Extract bullet points or numbered items
    const lines = analysis.split('\n');
    return lines
      .filter((line) => line.trim().match(/^[-*\d.]/))
      .map((line) => line.replace(/^[-*\d.]\s*/, '').trim())
      .filter((line) => line.length > 0);
  }

  private extractKeyElements(domTree: string): any[] {
    // Simple extraction of interactive elements
    const buttonRegex = /<button[^>]*>.*?<\/button>/gi;
    const inputRegex = /<input[^>]*>/gi;
    const linkRegex = /<a[^>]*>.*?<\/a>/gi;

    const buttons = domTree.match(buttonRegex) || [];
    const inputs = domTree.match(inputRegex) || [];
    const links = domTree.match(linkRegex) || [];

    return [
      ...buttons.map((el) => ({ type: 'button', element: el })),
      ...inputs.map((el) => ({ type: 'input', element: el })),
      ...links.map((el) => ({ type: 'link', element: el })),
    ];
  }

  private extractLocators(suggestion: string): string[] {
    // Extract potential locator suggestions
    const locatorPatterns = [
      /data-testid="([^"]+)"/g,
      /id="([^"]+)"/g,
      /class="([^"]+)"/g,
      /\[aria-label="([^"]+)"\]/g,
      /getByRole\(['"]([^'"]+)['"]\)/g,
      /getByText\(['"]([^'"]+)['"]\)/g,
    ];

    const locators = new Set<string>();

    for (const pattern of locatorPatterns) {
      const matches = suggestion.matchAll(pattern);
      for (const match of matches) {
        locators.add(match[0]);
      }
    }

    return Array.from(locators);
  }

  private calculateConfidence(suggestion: string): number {
    // Simple confidence calculation based on suggestion quality
    const hasMultipleLocators = (suggestion.match(/data-testid|id=|getBy/g) || []).length;
    const hasExplanation = suggestion.length > 100;
    const hasCode = suggestion.includes('```');

    let confidence = 0.5;
    if (hasMultipleLocators >= 2) confidence += 0.2;
    if (hasExplanation) confidence += 0.1;
    if (hasCode) confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  private parseEdgeCases(edgeCases: string): any[] {
    const lines = edgeCases.split('\n');
    const cases = [];

    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+?):\s*(.+)$/);
      if (match) {
        cases.push({
          title: match[1].trim(),
          description: match[2].trim(),
        });
      } else if (line.trim().match(/^[-*]/)) {
        const content = line.replace(/^[-*]\s*/, '').trim();
        if (content.length > 0) {
          cases.push({
            title: content.split(':')[0],
            description: content,
          });
        }
      }
    }

    return cases;
  }
}
