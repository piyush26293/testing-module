# Documentation Images

This directory contains visual assets for the platform documentation.

## Image Placeholders

The following images should be added to complete the documentation:

### 1. architecture-diagram.png
**Description**: High-level system architecture diagram showing the complete platform structure.

**Should Include:**
- Frontend layer (Next.js application)
- API Gateway layer (NestJS)
- Backend services (Auth, Users, Projects, Test Cases, Test Suites, Executions, Reports, AI Engine, Storage)
- Database layer (PostgreSQL)
- Cache layer (Redis)
- Object storage (MinIO)
- External integrations (OpenAI API)
- Data flow arrows between components
- Communication protocols (REST, WebSocket)

**Suggested Format**: PNG with transparent background, minimum 1200x800 pixels

**Tools to Create**:
- draw.io (https://app.diagrams.net/)
- Lucidchart (https://www.lucidchart.com/)
- Excalidraw (https://excalidraw.com/)
- PlantUML (https://plantuml.com/)

**Example PlantUML Code**:
```plantuml
@startuml
!define RECTANGLE class

package "Frontend Layer" {
  [Next.js App] as frontend
}

package "API Gateway" {
  [NestJS Gateway] as gateway
}

package "Backend Services" {
  [Auth Service] as auth
  [Users Service] as users
  [Projects Service] as projects
  [Test Cases Service] as testcases
  [Test Suites Service] as testsuites
  [Executions Service] as executions
  [Reports Service] as reports
  [AI Engine] as ai
  [Storage Service] as storage
}

database "PostgreSQL" {
  [Database] as db
}

database "Redis" {
  [Cache] as cache
}

database "MinIO" {
  [Object Storage] as minio
}

cloud "External Services" {
  [OpenAI API] as openai
}

frontend --> gateway : REST API
gateway --> auth
gateway --> users
gateway --> projects
gateway --> testcases
gateway --> testsuites
gateway --> executions
gateway --> reports
gateway --> ai
gateway --> storage

auth --> db
users --> db
projects --> db
testcases --> db
testsuites --> db
executions --> db
reports --> db
storage --> minio

auth --> cache
executions --> cache

ai --> openai
@enduml
```

---

### 2. dashboard-screenshot.png
**Description**: Screenshot of the main dashboard interface showing the user interface.

**Should Include:**
- Navigation sidebar with menu items
- Top navigation bar with user profile
- Main content area showing dashboard widgets
- Test execution statistics
- Recent test runs
- Project overview
- Quick action buttons

**Suggested Format**: PNG, minimum 1920x1080 pixels (full HD)

**Capture Guidelines**:
1. Use a clean test environment with sample data
2. Ensure no sensitive information is visible
3. Show the interface in a professional state (no debug overlays)
4. Use light mode for better visibility
5. Capture in Chrome/Firefox at 100% zoom
6. Include both collapsed and expanded sidebar views

**Key Areas to Highlight**:
- Project selector dropdown
- Test execution status indicators
- Chart/graph visualizations
- Recent activity feed
- Navigation menu structure

---

### 3. workflow-diagram.png
**Description**: End-to-end workflow diagram showing the test creation, execution, and reporting process.

**Should Include:**

**Phase 1: Test Creation**
- User creates project
- User writes test case manually OR uses AI generation
- Test case is saved to database
- Test case is organized into test suites

**Phase 2: Test Execution**
- User triggers test execution
- Execution service queues the test
- Playwright launches browsers
- Test steps are executed
- Screenshots/videos are captured
- Results are stored

**Phase 3: Result Analysis**
- Execution completes
- AI analyzes failures (if any)
- Report is generated
- User views results
- User exports report

**Suggested Format**: PNG with transparent background, minimum 1400x900 pixels

**Flow Direction**: Left to right or top to bottom

**Tools to Create**:
- draw.io
- Mermaid (https://mermaid.js.org/)
- Figma (https://www.figma.com/)

**Example Mermaid Code**:
```mermaid
graph TD
    A[User Creates Project] --> B{Test Creation Method}
    B -->|Manual| C[Write Test Steps]
    B -->|AI Generation| D[Describe Test in Plain Text]
    D --> E[AI Generates Test Steps]
    C --> F[Save Test Case]
    E --> F
    F --> G[Organize into Test Suite]
    G --> H[Trigger Execution]
    H --> I[Queue Test Job]
    I --> J[Launch Browser Playwright]
    J --> K[Execute Test Steps]
    K --> L{Test Status}
    L -->|Pass| M[Capture Success Artifacts]
    L -->|Fail| N[Capture Failure Artifacts]
    M --> O[Store Results]
    N --> P[AI Failure Analysis]
    P --> O
    O --> Q[Generate Report]
    Q --> R[User Views Results]
    R --> S{Next Action}
    S -->|Export| T[Download Report]
    S -->|Rerun| H
    S -->|Fix Test| C
```

---

## How to Add Images

1. **Create the images** using the tools and guidelines above
2. **Name them exactly** as specified (architecture-diagram.png, dashboard-screenshot.png, workflow-diagram.png)
3. **Place them in this directory** (/docs/images/)
4. **Commit them to git**:
   ```bash
   git add docs/images/architecture-diagram.png
   git add docs/images/dashboard-screenshot.png
   git add docs/images/workflow-diagram.png
   git commit -m "docs: Add documentation images"
   git push
   ```

## Image Optimization

Before committing images, optimize them to reduce file size:

**Using ImageOptim (macOS):**
```bash
imageoptim docs/images/*.png
```

**Using OptiPNG (Linux/macOS):**
```bash
optipng -o7 docs/images/*.png
```

**Using TinyPNG (Web):**
Visit https://tinypng.com/ and upload your images

## Using Images in Documentation

Once images are added, reference them in documentation using:

```markdown
![Architecture Diagram](images/architecture-diagram.png)
```

or for more control:

```html
<img src="images/architecture-diagram.png" alt="Architecture Diagram" width="800"/>
```

## Image Guidelines

- **Format**: PNG preferred for diagrams, JPG for screenshots
- **Size**: Optimize for web (target < 500KB per image)
- **Resolution**: Minimum 72 DPI for web, 300 DPI for print
- **Accessibility**: Always include descriptive alt text
- **Consistency**: Use consistent colors and styling across diagrams
- **Updates**: Update images when the UI or architecture changes significantly

## Color Palette Suggestions

For consistency in diagrams, consider using:

- **Primary Blue**: #0066CC (headers, primary elements)
- **Success Green**: #28A745 (passed tests, success states)
- **Error Red**: #DC3545 (failed tests, errors)
- **Warning Yellow**: #FFC107 (warnings, pending states)
- **Neutral Gray**: #6C757D (borders, secondary text)
- **Background**: #F8F9FA (light background)
- **Dark**: #212529 (text, dark elements)

## Diagram Conventions

- Use **solid arrows** for synchronous operations
- Use **dashed arrows** for asynchronous operations
- Use **bold borders** for primary components
- Use **thin borders** for secondary components
- Group related components with **colored backgrounds**
- Add **labels** to all arrows indicating the operation/data flow

---

**Status**: Placeholder descriptions created. Images to be added.

**Last Updated**: January 2024
