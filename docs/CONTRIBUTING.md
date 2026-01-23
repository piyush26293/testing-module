# Contributing to AI-Powered Testing Platform

Thank you for your interest in contributing to the AI-Powered Testing Platform! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@testing-platform.com.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- Git 2.0 or higher

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/testing-module.git
   cd testing-module
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/piyush26293/testing-module.git
   ```

### Stay in Sync

Keep your fork up to date with the upstream repository:
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## How to Contribute

### Ways to Contribute

There are many ways to contribute to this project:

- 🐛 **Report bugs** - Found a bug? Let us know!
- 💡 **Suggest features** - Have an idea? We'd love to hear it!
- 📝 **Improve documentation** - Help others understand the project better
- 🔧 **Fix issues** - Browse open issues and submit fixes
- ✨ **Add features** - Implement new functionality
- 🧪 **Write tests** - Improve test coverage
- 🎨 **Improve UI/UX** - Enhance the user interface
- 🌍 **Translate** - Help make the project accessible in more languages

### Finding Something to Work On

1. **Check the [Issues](https://github.com/piyush26293/testing-module/issues)** page
2. Look for issues labeled:
   - `good first issue` - Great for newcomers
   - `help wanted` - We need help with these
   - `bug` - Something isn't working
   - `enhancement` - New feature or request
3. Comment on the issue to let others know you're working on it
4. If you want to work on something not listed, create an issue first to discuss

## Development Setup

### Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**:
   ```bash
   # Option 1: Using Docker (recommended)
   docker-compose up -d
   
   # Option 2: Local development
   docker-compose up -d postgres redis minio
   npm run dev:backend  # Terminal 1
   npm run dev:frontend # Terminal 2
   ```

4. **Run migrations and seed data**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

### Project Structure

```
testing-module/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # Users module
│   │   ├── projects/       # Projects module
│   │   ├── test-cases/     # Test cases module
│   │   ├── executions/     # Test execution module
│   │   ├── reports/        # Reports module
│   │   ├── ai-engine/      # AI integration module
│   │   ├── storage/        # File storage module
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry point
│   ├── test/               # Tests
│   ├── migrations/         # Database migrations
│   └── package.json
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities and helpers
│   │   └── types/         # TypeScript types
│   └── package.json
├── database/              # Database scripts
├── docs/                  # Documentation
├── docker-compose.yml     # Docker composition
└── package.json          # Root package.json
```

### Development Tools

#### Backend Development

```bash
# Run in development mode with hot reload
npm run dev:backend

# Run tests
cd backend
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

#### Frontend Development

```bash
# Run in development mode
npm run dev:frontend

# Run tests
cd frontend
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
```

## Coding Standards

### General Principles

- Write clean, readable, and maintainable code
- Follow SOLID principles
- Keep functions small and focused
- Use meaningful variable and function names
- Comment complex logic, not obvious code
- Write self-documenting code when possible

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad: Avoid 'any' type
function calculateTotal(items: any): any {
  return items.reduce((sum: any, item: any) => sum + item.price, 0);
}

// ✅ Good: Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  name: string;
}

// ✅ Good: Use enums for constants
enum UserRole {
  ADMIN = 'admin',
  QA_LEAD = 'qa_lead',
  QA_ENGINEER = 'qa_engineer',
}

// ✅ Good: Use async/await
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### NestJS Best Practices

```typescript
// ✅ Good: Use dependency injection
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}
}

// ✅ Good: Use DTOs for validation
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

// ✅ Good: Use proper error handling
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.userService.findOne(id);
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

// ✅ Good: Use interceptors for cross-cutting concerns
@UseInterceptors(LoggingInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {}
```

### React Best Practices

```typescript
// ✅ Good: Use functional components with hooks
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner />;
  if (!user) return <NotFound />;
  
  return <div>{user.name}</div>;
}

// ✅ Good: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good: Use custom hooks for reusable logic
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  return { user, loading };
}
```

### Code Formatting

We use Prettier for code formatting. Configuration is in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

Run formatter:
```bash
npm run format
```

### Linting

We use ESLint for code linting. Configuration is in `.eslintrc.js`:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Changes to build system or dependencies
- **ci**: Changes to CI configuration
- **chore**: Other changes that don't modify src or test files

### Examples

```bash
# Feature
feat(auth): add OAuth2 authentication support

# Bug fix
fix(api): resolve race condition in test execution

# Documentation
docs(readme): update installation instructions

# Breaking change
feat(api)!: change test execution API endpoint

BREAKING CHANGE: The /api/execute endpoint has been moved to /api/test-cases/:id/execute
```

### Scope

The scope should be the name of the module affected:
- auth
- users
- projects
- test-cases
- executions
- reports
- ai-engine
- storage
- frontend
- docs

### Subject

- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No period (.) at the end
- Limit to 50 characters

### Body

- Use imperative, present tense
- Include motivation for the change
- Contrast with previous behavior
- Wrap at 72 characters

### Footer

- Reference issues: `Fixes #123`, `Closes #456`
- Note breaking changes: `BREAKING CHANGE: description`

## Pull Request Process

### Before Submitting

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following the coding standards

3. **Write or update tests** for your changes

4. **Run the test suite**:
   ```bash
   npm test
   ```

5. **Ensure code quality**:
   ```bash
   npm run lint
   npm run format
   ```

6. **Commit your changes** using conventional commits

7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Creating the Pull Request

1. Go to the [repository](https://github.com/piyush26293/testing-module) on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)

## Related Issues
Fixes #(issue number)
```

### PR Guidelines

- **Keep PRs focused** - One feature or fix per PR
- **Keep PRs small** - Easier to review and merge
- **Update documentation** - Document new features
- **Add tests** - Maintain or improve test coverage
- **Resolve conflicts** - Rebase if needed
- **Be responsive** - Address review comments promptly

## Code Review Guidelines

### For Reviewers

- **Be respectful and constructive**
- **Focus on the code, not the person**
- **Explain why**, not just what
- **Suggest alternatives** when possible
- **Approve when ready**, don't nitpick
- **Use GitHub review features** (comments, suggestions)

### Review Checklist

- [ ] Code follows project standards
- [ ] Changes are properly tested
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is acceptable
- [ ] Breaking changes are documented
- [ ] Commit messages follow conventions

### For Authors

- **Be open to feedback**
- **Don't take it personally**
- **Ask questions** if unclear
- **Make requested changes** or explain why not
- **Update the PR** based on feedback
- **Thank reviewers** for their time

## Testing Guidelines

### Test Structure

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      const user = { id: '1', email: 'test@example.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(user as User);

      const result = await service.findOne('1');

      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### Test Coverage

- Aim for at least 80% code coverage
- Test edge cases and error paths
- Test happy paths
- Mock external dependencies
- Use meaningful test descriptions

### Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Documentation

### Code Documentation

```typescript
/**
 * Creates a new user in the system
 * 
 * @param createUserDto - The user data to create
 * @returns The created user object
 * @throws BadRequestException if email already exists
 * @throws InternalServerErrorException if database operation fails
 * 
 * @example
 * ```typescript
 * const user = await userService.create({
 *   email: 'user@example.com',
 *   password: 'securePassword123',
 *   name: 'John Doe'
 * });
 * ```
 */
async create(createUserDto: CreateUserDto): Promise<User> {
  // Implementation
}
```

### README Updates

When adding features, update relevant README sections:
- Features list
- Installation instructions
- Usage examples
- API documentation

### API Documentation

Update Swagger/OpenAPI annotations:

```typescript
@ApiOperation({ summary: 'Create a new user' })
@ApiResponse({ status: 201, description: 'User created successfully', type: User })
@ApiResponse({ status: 400, description: 'Invalid input' })
@ApiResponse({ status: 409, description: 'Email already exists' })
@Post()
async create(@Body() createUserDto: CreateUserDto) {
  return this.userService.create(createUserDto);
}
```

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Clear title** - Summarize the issue
- **Description** - Detailed description of the bug
- **Steps to reproduce** - How to recreate the issue
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - OS, Node version, browser, etc.
- **Screenshots** - If applicable
- **Logs** - Relevant error messages

### Feature Requests

Use the feature request template and include:

- **Clear title** - Summarize the feature
- **Problem** - What problem does it solve?
- **Solution** - Your proposed solution
- **Alternatives** - Alternative solutions considered
- **Additional context** - Screenshots, mockups, etc.

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority
- `status: blocked` - Blocked by other issues
- `status: in progress` - Currently being worked on

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and discussions
- **Pull Requests** - Code contributions
- **Email** - contribute@testing-platform.com

### Getting Help

- Check the [documentation](README.md)
- Search [existing issues](https://github.com/piyush26293/testing-module/issues)
- Ask in [discussions](https://github.com/piyush26293/testing-module/discussions)
- Read the [troubleshooting guide](TROUBLESHOOTING.md)

### Recognition

Contributors will be:
- Listed in the CONTRIBUTORS file
- Mentioned in release notes
- Given credit in documentation
- Invited to join the contributors team

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions about contributing, please:
1. Check this guide first
2. Search existing issues and discussions
3. Create a new discussion if needed
4. Email contribute@testing-platform.com

---

**Thank you for contributing to the AI-Powered Testing Platform!** 🎉

Your contributions help make this project better for everyone.
