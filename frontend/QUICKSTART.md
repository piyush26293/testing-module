# Quick Start Guide - Frontend

This guide will help you get the frontend application up and running in minutes.

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure API URL:**
   Edit `.env.local` and set your backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

### Development Features
- Hot reload on file changes
- Fast Refresh for React components
- Detailed error messages
- Source maps for debugging

## Building for Production

1. **Create optimized production build:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

The production build:
- Minifies JavaScript and CSS
- Optimizes images
- Pre-renders static pages
- Generates optimized bundles

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (placeholder)

## Project Structure Overview

```
frontend/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities
│   ├── services/        # API services
│   ├── store/           # State management
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json         # Dependencies
```

## Key Features

### 🔐 Authentication
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Password Reset: http://localhost:3000/forgot-password

### 📊 Dashboard
- Overview: http://localhost:3000/dashboard
- Projects: http://localhost:3000/dashboard/projects
- Test Cases: http://localhost:3000/dashboard/test-cases
- Executions: http://localhost:3000/dashboard/executions
- Reports: http://localhost:3000/dashboard/reports
- AI Generator: http://localhost:3000/dashboard/ai-generator
- Settings: http://localhost:3000/dashboard/settings

## Common Issues

### Port 3000 Already in Use
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Development Tips

### Hot Reload Not Working?
- Check if files are saved
- Restart dev server
- Clear browser cache

### Dark Mode
Toggle dark mode using the moon/sun icon in the header.

### Responsive Design
Test responsive design using browser DevTools:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px+

## API Integration

The frontend expects the backend API at the URL specified in `.env.local`.

### API Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /test-cases` - List test cases
- `GET /executions` - List executions
- `GET /reports` - List reports

Make sure your backend is running before using the frontend.

## Testing

### Manual Testing Checklist
- [ ] Login page loads
- [ ] Registration works
- [ ] Dashboard displays
- [ ] Projects can be created
- [ ] Navigation works
- [ ] Dark mode toggles
- [ ] Responsive on mobile

### Browser Testing
Recommended browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Troubleshooting

### Build Fails
1. Check Node.js version: `node -v` (should be 18+)
2. Clear cache: `rm -rf .next`
3. Reinstall: `npm install`
4. Try build: `npm run build`

### API Not Connecting
1. Check `.env.local` has correct API URL
2. Verify backend is running
3. Check browser console for errors
4. Verify CORS settings on backend

### Styles Not Loading
1. Check Tailwind is configured
2. Clear browser cache
3. Restart dev server

## Next Steps

1. **Connect to Backend**: Ensure backend API is running
2. **Test Features**: Try creating projects and test cases
3. **Customize**: Modify colors in `tailwind.config.ts`
4. **Extend**: Add new features as needed

## Support

- Check `IMPLEMENTATION_SUMMARY.md` for detailed documentation
- Review `README.md` for project overview
- Check Next.js docs: https://nextjs.org/docs

## Security Notes

⚠️ **Important for Production:**
- Use HTTPS for API communication
- Enable CORS properly on backend
- Consider httpOnly cookies instead of localStorage for tokens
- Implement rate limiting
- Add CAPTCHA for login/registration

## Performance Tips

- Use Next.js Image component for images
- Implement lazy loading for large lists
- Enable caching in React Query
- Optimize bundle size with tree shaking

Enjoy building with the AI Testing Platform! 🚀
