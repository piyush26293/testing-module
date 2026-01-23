# AI Engine API

The AI Engine API provides AI-powered features for test generation, self-healing, failure analysis, and test optimization.

## Base URL
```
/api/v1/ai
```

## Authentication
All endpoints require authentication with a valid JWT token.

## Rate Limiting
- 50 requests per 15 minutes per user
- AI generation: 10 requests per 15 minutes
- Analysis operations: 20 requests per 15 minutes

---

## Endpoints

### POST /ai/generate-test
Generate test cases from natural language descriptions using AI.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "projectId": "prj_123456789",
  "description": "Test the login flow for a user with valid credentials. The user should navigate to the login page, enter their email and password, click the login button, and be redirected to the dashboard.",
  "context": {
    "url": "https://example.com",
    "framework": "playwright",
    "browser": "chromium"
  },
  "options": {
    "generateSteps": true,
    "generateAssertions": true,
    "includeSelectors": true,
    "priority": "high"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| projectId | string | Yes | Project ID |
| description | string | Yes | Natural language test description |
| context | object | No | Additional context for generation |
| options | object | No | Generation options |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "testCase": {
      "title": "User login with valid credentials",
      "description": "Verify that a user can successfully login with valid email and password and be redirected to the dashboard",
      "priority": "high",
      "estimatedDuration": 120,
      "steps": [
        {
          "order": 1,
          "action": "Navigate to login page",
          "expected": "Login page is displayed",
          "data": {
            "url": "https://example.com/login",
            "selector": null
          }
        },
        {
          "order": 2,
          "action": "Enter email address",
          "expected": "Email field accepts input",
          "data": {
            "selector": "input[type='email']",
            "value": "test@example.com"
          }
        },
        {
          "order": 3,
          "action": "Enter password",
          "expected": "Password field accepts input",
          "data": {
            "selector": "input[type='password']",
            "value": "SecurePassword123!"
          }
        },
        {
          "order": 4,
          "action": "Click login button",
          "expected": "Form is submitted",
          "data": {
            "selector": "button[type='submit']",
            "timeout": 5000
          }
        },
        {
          "order": 5,
          "action": "Verify redirect to dashboard",
          "expected": "Dashboard page is displayed with user info",
          "data": {
            "url": "https://example.com/dashboard",
            "assertions": [
              {
                "type": "url",
                "expected": "https://example.com/dashboard"
              },
              {
                "type": "element",
                "selector": ".user-profile",
                "expected": "visible"
              }
            ]
          }
        }
      ],
      "tags": ["authentication", "login", "smoke"],
      "preconditions": "User account must exist in the system",
      "expectedResult": "User is successfully authenticated and redirected to dashboard"
    },
    "confidence": 0.92,
    "suggestions": [
      "Consider adding a test for invalid credentials",
      "Consider adding a test for password reset flow",
      "Add error handling for network failures"
    ]
  }
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "description",
        "message": "Description must be at least 20 characters long"
      }
    ]
  }
}
```

**429 Too Many Requests**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many AI generation requests. Maximum 10 per 15 minutes.",
    "retryAfter": 300
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/ai/generate-test \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "prj_123456789",
    "description": "Test the login flow for a user with valid credentials",
    "options": {
      "generateSteps": true,
      "generateAssertions": true
    }
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/ai/generate-test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectId: 'prj_123456789',
    description: 'Test the login flow for a user with valid credentials',
    options: {
      generateSteps: true,
      generateAssertions: true,
    },
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/ai/generate-test',
    json={
        'projectId': 'prj_123456789',
        'description': 'Test the login flow for a user with valid credentials',
        'options': {
            'generateSteps': True,
            'generateAssertions': True
        }
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### POST /ai/heal-locator
Use AI to suggest alternative selectors when elements cannot be found (self-healing).

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "executionId": "exec_123456789",
  "testCaseId": "tc_123456789",
  "failedSelector": "#login-button",
  "context": {
    "url": "https://example.com/login",
    "pageContent": "<html>...</html>",
    "screenshot": "base64_encoded_screenshot",
    "errorMessage": "Element not found: #login-button"
  },
  "options": {
    "maxSuggestions": 5,
    "includeXPath": true,
    "includeCss": true,
    "includeText": true
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| executionId | string | Yes | Execution ID where failure occurred |
| testCaseId | string | Yes | Test case ID |
| failedSelector | string | Yes | The selector that failed |
| context | object | Yes | Context for healing (page content, screenshot) |
| options | object | No | Healing options |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "originalSelector": "#login-button",
    "suggestions": [
      {
        "selector": "button[type='submit'][class*='login']",
        "type": "css",
        "confidence": 0.95,
        "reasoning": "Matches submit button with login class, more robust than ID",
        "priority": 1
      },
      {
        "selector": "//button[contains(text(), 'Login') or contains(text(), 'Sign In')]",
        "type": "xpath",
        "confidence": 0.90,
        "reasoning": "Text-based matching, resilient to class/ID changes",
        "priority": 2
      },
      {
        "selector": "button.btn-primary.login-btn",
        "type": "css",
        "confidence": 0.85,
        "reasoning": "Multiple class-based selector",
        "priority": 3
      },
      {
        "selector": "[data-testid='login-button']",
        "type": "css",
        "confidence": 0.92,
        "reasoning": "Test ID attribute if available",
        "priority": 4
      }
    ],
    "recommendedAction": "update",
    "autoFixAvailable": true
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "EXECUTION_NOT_FOUND",
    "message": "Execution not found"
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/ai/heal-locator \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "exec_123456789",
    "testCaseId": "tc_123456789",
    "failedSelector": "#login-button",
    "context": {
      "url": "https://example.com/login",
      "errorMessage": "Element not found: #login-button"
    }
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/ai/heal-locator', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    executionId: 'exec_123456789',
    testCaseId: 'tc_123456789',
    failedSelector: '#login-button',
    context: {
      url: 'https://example.com/login',
      errorMessage: 'Element not found: #login-button',
    },
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/ai/heal-locator',
    json={
        'executionId': 'exec_123456789',
        'testCaseId': 'tc_123456789',
        'failedSelector': '#login-button',
        'context': {
            'url': 'https://example.com/login',
            'errorMessage': 'Element not found: #login-button'
        }
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### POST /ai/analyze-failure
Analyze test failures using AI to identify root causes and suggest fixes.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "executionId": "exec_123456789",
  "testCaseId": "tc_987654321",
  "includeHistory": true,
  "includeSimilarFailures": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| executionId | string | Yes | Execution ID |
| testCaseId | string | Yes | Test case ID that failed |
| includeHistory | boolean | No | Include historical failure data (default: true) |
| includeSimilarFailures | boolean | No | Include similar failures (default: true) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "executionId": "exec_123456789",
    "testCaseId": "tc_987654321",
    "testCaseTitle": "Password reset flow",
    "failure": {
      "error": "Element not found: #reset-button",
      "step": 3,
      "timestamp": "2024-01-23T16:05:00Z",
      "screenshot": "https://api.example.com/storage/screenshots/exec_123456789/tc_987654321_1.png"
    },
    "analysis": {
      "rootCause": "Element selector changed due to recent UI update",
      "category": "selector_issue",
      "confidence": 0.88,
      "evidence": [
        "Element ID changed from #reset-button to #password-reset-btn",
        "Similar failures in 3 other tests with same selector pattern",
        "Last successful run was before deployment on 2024-01-22"
      ]
    },
    "recommendations": [
      {
        "type": "update_selector",
        "priority": "high",
        "description": "Update selector to use more stable attributes",
        "suggestion": "button[data-testid='password-reset']",
        "autoFixAvailable": true
      },
      {
        "type": "add_wait",
        "priority": "medium",
        "description": "Add explicit wait for element to be visible",
        "suggestion": "await page.waitForSelector('#reset-button', { state: 'visible' })",
        "autoFixAvailable": false
      }
    ],
    "similarFailures": [
      {
        "testCaseId": "tc_111222333",
        "testCaseTitle": "Email verification flow",
        "executionId": "exec_111222333",
        "failureDate": "2024-01-23T15:30:00Z",
        "similarity": 0.85
      }
    ],
    "history": {
      "totalFailures": 5,
      "firstFailure": "2024-01-22T18:00:00Z",
      "recentFailureRate": 100.0,
      "previouslyPassing": true
    },
    "impact": {
      "affectedTests": 3,
      "severity": "high",
      "blockedExecutions": 2
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/ai/analyze-failure \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "executionId": "exec_123456789",
    "testCaseId": "tc_987654321",
    "includeHistory": true
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/ai/analyze-failure', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    executionId: 'exec_123456789',
    testCaseId: 'tc_987654321',
    includeHistory: true,
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/ai/analyze-failure',
    json={
        'executionId': 'exec_123456789',
        'testCaseId': 'tc_987654321',
        'includeHistory': True
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

### POST /ai/suggest-improvements
Get AI-powered suggestions for improving test cases.

#### Headers
```
Authorization: Bearer <access_token>
```

#### Request Body
```json
{
  "testCaseId": "tc_123456789",
  "analysisType": "comprehensive",
  "includePerformance": true,
  "includeReliability": true,
  "includeMaintainability": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| testCaseId | string | Yes | Test case ID to analyze |
| analysisType | string | No | Analysis type (quick, comprehensive) - default: comprehensive |
| includePerformance | boolean | No | Include performance suggestions (default: true) |
| includeReliability | boolean | No | Include reliability suggestions (default: true) |
| includeMaintainability | boolean | No | Include maintainability suggestions (default: true) |

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "testCaseId": "tc_123456789",
    "testCaseTitle": "User login with valid credentials",
    "currentScore": {
      "overall": 75,
      "performance": 70,
      "reliability": 80,
      "maintainability": 75
    },
    "suggestions": [
      {
        "category": "performance",
        "priority": "high",
        "title": "Optimize selector strategy",
        "description": "Replace multiple findElement calls with more efficient selectors",
        "impact": "Could reduce execution time by ~20%",
        "currentCode": "await page.locator('#email').click();\nawait page.locator('#email').fill('test@example.com');",
        "suggestedCode": "const emailField = page.locator('#email');\nawait emailField.click();\nawait emailField.fill('test@example.com');",
        "estimatedImprovement": 15
      },
      {
        "category": "reliability",
        "priority": "high",
        "title": "Add explicit waits",
        "description": "Add wait conditions to prevent flaky failures",
        "impact": "Improve test stability",
        "currentCode": "await page.locator('#login-button').click();",
        "suggestedCode": "await page.locator('#login-button').waitFor({ state: 'visible' });\nawait page.locator('#login-button').click();",
        "estimatedImprovement": 20
      },
      {
        "category": "maintainability",
        "priority": "medium",
        "title": "Use data attributes for selectors",
        "description": "Replace fragile CSS selectors with data-testid attributes",
        "impact": "Reduce maintenance overhead",
        "currentCode": "await page.locator('button.btn.btn-primary.submit').click();",
        "suggestedCode": "await page.locator('[data-testid=\"login-submit\"]').click();",
        "estimatedImprovement": 10
      },
      {
        "category": "best-practices",
        "priority": "low",
        "title": "Add error handling",
        "description": "Add try-catch blocks for better error reporting",
        "impact": "Improve debugging experience",
        "estimatedImprovement": 5
      }
    ],
    "potentialScore": {
      "overall": 90,
      "performance": 85,
      "reliability": 95,
      "maintainability": 85
    },
    "estimatedImprovement": {
      "executionTime": "-18%",
      "reliability": "+15%",
      "maintainability": "+10%"
    }
  }
}
```

#### Code Examples

**cURL**
```bash
curl -X POST https://api.example.com/api/v1/ai/suggest-improvements \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "testCaseId": "tc_123456789",
    "analysisType": "comprehensive"
  }'
```

**JavaScript/TypeScript**
```typescript
const response = await fetch('https://api.example.com/api/v1/ai/suggest-improvements', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    testCaseId: 'tc_123456789',
    analysisType: 'comprehensive',
  }),
});

const data = await response.json();
```

**Python**
```python
import requests

response = requests.post(
    'https://api.example.com/api/v1/ai/suggest-improvements',
    json={
        'testCaseId': 'tc_123456789',
        'analysisType': 'comprehensive'
    },
    headers={'Authorization': f'Bearer {access_token}'}
)

data = response.json()
```

---

## AI Features

### Test Generation
- Natural language to test case conversion
- Automatic step generation
- Smart selector suggestions
- Context-aware assertions

### Self-Healing
- Automatic selector recovery
- Alternative locator suggestions
- Confidence scoring
- Auto-fix capability

### Failure Analysis
- Root cause identification
- Pattern recognition
- Historical analysis
- Impact assessment

### Optimization
- Performance improvements
- Reliability enhancements
- Maintainability suggestions
- Best practices recommendations

## Confidence Scoring

All AI responses include confidence scores:
- **0.90 - 1.00**: Very high confidence, safe to auto-apply
- **0.75 - 0.89**: High confidence, review recommended
- **0.60 - 0.74**: Medium confidence, manual review required
- **< 0.60**: Low confidence, use with caution

## Common Error Codes

| Code | Description |
|------|-------------|
| INVALID_DESCRIPTION | Description too short or unclear |
| GENERATION_FAILED | AI generation failed |
| EXECUTION_NOT_FOUND | Execution not found |
| TEST_CASE_NOT_FOUND | Test case not found |
| RATE_LIMIT_EXCEEDED | Too many AI requests |
| VALIDATION_ERROR | Request validation failed |
| INSUFFICIENT_CONTEXT | Not enough context for analysis |
