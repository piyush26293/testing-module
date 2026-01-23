# Frontend - Next.js 14 Application

This is the frontend application for the AI-Powered Testing Platform, built with Next.js 14 and Tailwind CSS.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities and helpers
│   ├── services/     # API services
│   ├── store/        # Zustand stores
│   └── types/        # TypeScript types
├── public/           # Static assets
└── package.json
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Build

```bash
npm run build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
