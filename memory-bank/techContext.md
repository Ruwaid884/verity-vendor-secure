# Technical Context: Verity Vendor Secure

## Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern React with hooks and concurrent features
- **TypeScript 5.5.3**: Full type safety throughout the application
- **Vite 5.4.1**: Fast development server and build tool

### UI & Styling
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Primitive components for complex UI patterns
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **Tailwind Animate**: Animation utilities
- **next-themes**: Theme switching support (dark/light mode)

### Data & State Management
- **TanStack Query 5.56.2**: Server state management and caching
- **React Hook Form 7.53.0**: Performant form handling
- **Zod 3.23.8**: Runtime type validation

### Backend & Database
- **Supabase 2.50.0**: Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **Authentication**: Built-in Supabase Auth
- **Database**: PostgreSQL via Supabase

### Routing & Navigation
- **React Router DOM 6.26.2**: Client-side routing

### Development Tools
- **ESLint**: Code linting with TypeScript support  
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Vite**: Development server with HMR
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Development Environment Setup

### Prerequisites
1. **Node.js** (v18 or higher recommended)
   - Install via [nvm](https://github.com/nvm-sh/nvm) for version management
   - `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
   - `nvm install --lts && nvm use --lts`

2. **Package Manager Options**:
   - **npm** (comes with Node.js)
   - **Bun** (faster alternative - `curl -fsSL https://bun.sh/install | bash`)

### Project Setup Commands
```bash
# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or  
bun run dev

# Build for production
npm run build
# or
bun run build
```

## Current Setup Issues
- Node.js not installed on system
- Package dependencies not installed
- Missing environment variables for Supabase
- Linter errors due to missing dependencies

## File Structure
```
src/
├── components/     # shadcn/ui components
├── contexts/       # React contexts (AuthContext)
├── hooks/          # Custom React hooks
├── integrations/   # External service integrations
├── lib/            # Utility functions
├── pages/          # Route components
├── App.tsx         # Main app component
├── main.tsx        # React entry point
└── index.css       # Global styles
```

## Configuration Files
- `vite.config.ts`: Vite configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `eslint.config.js`: ESLint configuration
- `components.json`: shadcn/ui configuration 