# DECUR Project Guidelines

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build production version
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run check      # Run both lint and typecheck
```

## Code Style Guidelines
- **Component Structure**: Functional components with TypeScript and hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Group imports: React, Next.js, components, styles
- **Component Props**: Define TypeScript interfaces for all props
- **TypeScript**: Use strict type checking, avoid `any` type when possible
- **Styling**: Use Tailwind CSS with color variables from tailwind.config.js
- **Error Handling**: Try/catch for async operations, fallback UI for errors
- **File Organization**: Follow existing patterns in components directory
- **State Management**: React hooks for local state, page-level state for shared data

## TypeScript Guidelines
- Use interfaces for object shapes (props, state, etc.)
- Define explicit return types for functions
- Use React component types (FC, FunctionComponent) for components
- Use type aliases for union types and complex types
- Use generics for reusable components and functions
- Avoid using the `any` type when possible
- Make use of TypeScript's utility types (Partial, Omit, etc.)

## Project Structure
See `.claude/code-structure.json` and `.claude/architecture-overview.md` for detailed documentation.