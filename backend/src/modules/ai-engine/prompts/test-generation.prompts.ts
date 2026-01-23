export const TEST_GENERATION_PROMPT = `
Generate comprehensive end-to-end test code for the following user flow:

User Flow: {{USER_FLOW}}
Application URL: {{URL}}
Framework: {{FRAMEWORK}}

Please generate:
1. Complete test code with proper imports and setup
2. Use best practices for the specified framework
3. Include appropriate assertions and waits
4. Add meaningful test descriptions
5. Use stable locator strategies (data-testid, aria-labels, or semantic selectors)
6. Include error handling and cleanup

Format the output as executable test code.
`;

export const PAGE_ANALYSIS_PROMPT = `
Analyze the following web page and provide insights for test automation:

URL: {{URL}}
DOM Tree: {{DOM_TREE}}
Accessibility Tree: {{A11Y_TREE}}

Please provide:
1. Key interactive elements (buttons, inputs, links, forms)
2. Recommended locator strategies for each element
3. Potential accessibility issues
4. Suggested test scenarios for this page
5. Areas that might be fragile or need special handling

Format your response with clear sections and actionable recommendations.
`;

export const SELF_HEALING_PROMPT = `
A test locator has failed and needs self-healing suggestions:

Broken Locator: {{BROKEN_LOCATOR}}
Error Message: {{ERROR_MESSAGE}}
Current DOM Snapshot: {{DOM_SNAPSHOT}}

Please analyze and suggest:
1. Why the locator might have failed
2. Alternative locator strategies (in priority order)
3. More stable locator options (data-testid, aria-label, role-based)
4. Code snippets for the new locators
5. Confidence level for each suggestion

Prioritize stable, maintainable locators over fragile ones.
`;

export const EDGE_CASE_PROMPT = `
For the following test scenario, suggest comprehensive edge cases:

Test Scenario: {{TEST_SCENARIO}}

Please suggest:
1. Boundary conditions (min/max values, empty states)
2. Error conditions (network failures, timeouts, invalid inputs)
3. State-based edge cases (logged in/out, permissions)
4. Data-related edge cases (special characters, long strings, null values)
5. Concurrency and timing issues
6. Browser-specific or device-specific scenarios

Format each edge case with:
- Title: Brief description
- Test approach: How to test it
- Expected behavior: What should happen
- Priority: High/Medium/Low
`;
