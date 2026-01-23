# Frontend - Next.js 14 Application

This is the frontend application for the AI-Powered Testing Platform, built with Next.js 14 and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in minutes
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Detailed technical documentation
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute (if available)

## 🛠 Tech Stack

- **Framework**: Next.js 14.2.35 with App Router
- **Language**: TypeScript 5.3.3
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: 
  - Zustand 4.4.7 (global state)
  - TanStack React Query 5.17.0 (server state)
- **HTTP Client**: Axios 1.6.5
- **Form Handling**: React Hook Form 7.49.3 + Zod 3.22.4
- **Charts**: Recharts 2.10.3
- **Icons**: Lucide React 0.303.0

## 📦 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── providers.tsx      # React Query provider
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components (header, sidebar)
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   └── projects/         # Project components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   ├── services/             # API services
│   ├── store/                # Zustand stores
│   └── types/                # TypeScript types
├── public/                   # Static assets
├── .env.example             # Environment variables template
└── package.json
```

## ✨ Features

### Implemented
- ✅ Authentication (Login, Register, Forgot Password)
- ✅ Dashboard with statistics and charts
- ✅ Projects management (CRUD operations)
- ✅ Responsive design with dark mode
- ✅ Type-safe API integration
- ✅ Toast notifications
- ✅ Protected routes
- ✅ Loading states

### Ready for Integration
- Test Cases management (placeholder)
- Executions viewer (placeholder)
- Reports & Analytics (placeholder)
- AI Test Generator (placeholder)
- Settings & Preferences (placeholder)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Tailwind Configuration

Customize colors, fonts, and more in `tailwind.config.ts`.

### API Integration

The app connects to the backend API specified in `NEXT_PUBLIC_API_URL`.
All API calls include JWT token authentication automatically.

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run tests (placeholder)
```

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting (recommended)
- **Build Validation**: ✅ All checks passing

## 🏗 Build Information

**Latest Build Status**: ✅ Success

- **Pages**: 12 routes compiled
- **Bundle Size**: ~87.6 KB (shared)
- **Compilation**: No errors
- **Linting**: No warnings
- **Security**: No vulnerabilities (CodeQL verified)

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern browsers with ES2017+ support

## 🔒 Security

- JWT token authentication
- Protected route guards
- XSS protection (React built-in)
- CSRF protection via token-based auth
- Regular dependency updates

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Docker
```bash
docker build -t testing-platform-frontend .
docker run -p 3000:3000 testing-platform-frontend
```

### Manual
```bash
npm run build
npm start
```

## 📊 Performance

- Static pre-rendering for all pages
- Automatic code splitting
- Image optimization ready
- React Query caching (60s default)
- Lazy loading components

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run build` to verify
4. Run `npm run lint` to check code quality
5. Submit a pull request

## 📝 API Endpoints

The frontend expects these backend endpoints:

**Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/forgot-password` - Request password reset
- `GET /auth/profile` - Get user profile

**Projects**
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

**Test Cases**
- `GET /test-cases` - List test cases
- `POST /test-cases` - Create test case
- `GET /test-cases/:id` - Get test case details
- `PATCH /test-cases/:id` - Update test case
- `DELETE /test-cases/:id` - Delete test case

**Executions**
- `GET /executions` - List executions
- `POST /executions` - Start execution
- `GET /executions/:id` - Get execution details
- `POST /executions/:id/cancel` - Cancel execution

**Reports**
- `GET /reports` - List reports
- `POST /reports` - Generate report
- `GET /reports/:id` - Get report details
- `GET /reports/:id/export/pdf` - Export to PDF
- `GET /reports/:id/export/excel` - Export to Excel

**AI Engine**
- `POST /ai/generate` - Generate test cases
- `GET /ai/self-heal/:executionId` - Get self-heal suggestions

## 🐛 Known Issues

None at this time. See [Issues](../../issues) for bug reports.

## 📄 License

MIT

## 🙋 Support

For issues and questions:
1. Check the [Quick Start Guide](QUICKSTART.md)
2. Review the [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
3. Create an issue on GitHub

---

Built with ❤️ using Next.js 14
