# AI Engine Module

## Overview
The AI Engine module provides intelligent test generation and analysis capabilities using OpenAI's GPT models. It enables automatic test creation, page analysis, self-healing locators, and edge case detection.

## Features

- **Test Generation**: Generate test code from natural language user flow descriptions
- **Page Analysis**: Analyze DOM and accessibility trees to suggest test strategies
- **Self-Healing Locators**: Automatically suggest alternative locators when tests fail
- **Edge Case Detection**: Identify potential edge cases for comprehensive testing
- **Multiple Frameworks**: Support for Playwright, Selenium, and other frameworks

## API Endpoints

### Generate Test
```
POST /ai-engine/generate-test
```
Generate test code from a user flow description.

**Request Body:**
```json
{
  "userFlow": "User logs in, navigates to dashboard, and creates a new project",
  "url": "https://example.com",
  "framework": "playwright"
}
```

**Response:**
```json
{
  "testCode": "import { test, expect } from '@playwright/test'...",
  "framework": "playwright"
}
```

### Analyze Page
```
POST /ai-engine/analyze-page
```
Analyze a web page's DOM and accessibility tree.

**Request Body:**
```json
{
  "url": "https://example.com/login",
  "domTree": "<html>...</html>",
  "accessibilityTree": "{...}"
}
```

**Response:**
```json
{
  "analysis": "The page contains a login form with...",
  "suggestions": [
    "Use data-testid for form inputs",
    "Consider aria-labels for buttons"
  ],
  "elements": [
    { "type": "button", "element": "<button>..." }
  ]
}
```

### Self-Healing Locators
```
POST /ai-engine/self-heal
```
Get suggestions for fixing broken locators.

**Request Body:**
```json
{
  "brokenLocator": "#submit-button",
  "errorMessage": "Element not found",
  "domSnapshot": "<html>...</html>"
}
```

**Response:**
```json
{
  "originalLocator": "#submit-button",
  "suggestedLocators": [
    "[data-testid='submit']",
    "button[type='submit']"
  ],
  "explanation": "The ID selector failed because...",
  "confidence": 0.85
}
```

### Suggest Edge Cases
```
GET /ai-engine/edge-cases?scenario=user login flow
```
Get edge case suggestions for a test scenario.

**Response:**
```json
{
  "edgeCases": [
    {
      "title": "Empty credentials",
      "description": "Test login with empty username and password"
    }
  ],
  "recommendations": "Consider testing..."
}
```

## Configuration

Configure OpenAI integration in your `.env` file:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4
```

## Prompt Templates

The module uses carefully crafted prompt templates for different scenarios:

- `TEST_GENERATION_PROMPT`: For generating test code
- `PAGE_ANALYSIS_PROMPT`: For analyzing web pages
- `SELF_HEALING_PROMPT`: For suggesting locator fixes
- `EDGE_CASE_PROMPT`: For identifying edge cases

These prompts can be customized in `prompts/test-generation.prompts.ts`.

## Usage Example

```typescript
// Inject the AiEngineService
constructor(private aiEngineService: AiEngineService) {}

// Generate a test
const test = await this.aiEngineService.generateTest({
  userFlow: 'User logs in and views dashboard',
  url: 'https://example.com',
  framework: 'playwright'
});

// Analyze a page
const analysis = await this.aiEngineService.analyzePage({
  url: 'https://example.com',
  domTree: domContent,
  accessibilityTree: a11yTree
});

// Get self-healing suggestions
const healing = await this.aiEngineService.suggestSelfHealing({
  brokenLocator: '#old-id',
  errorMessage: 'Element not found',
  domSnapshot: currentDom
});
```

## Best Practices

1. **API Key Security**: Never commit your OpenAI API key to version control
2. **Rate Limiting**: Implement rate limiting to avoid API quota exhaustion
3. **Caching**: Cache common responses to reduce API calls and costs
4. **Error Handling**: Always handle OpenAI API errors gracefully
5. **Locator Strategy**: Prioritize stable locators (data-testid, ARIA) over fragile ones

## Security

- All endpoints require JWT authentication via `JwtAuthGuard`
- API keys are stored securely in environment variables
- Never expose OpenAI responses directly without validation
