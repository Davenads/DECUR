# DECUR Project Guidelines

## Project Overview
DECUR (Data Exceeding Current Understanding of Reality) is a Next.js application for exploring UAP/NHI phenomena data with a component-based architecture using Tailwind CSS. The platform focuses on cataloging and analyzing unconventional scientific data, particularly Dan Burisch's research, while maintaining scientific rigor and methodological transparency.

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build production version
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run check      # Run both lint and typecheck
```

## Key Files to Reference
When working with this project, prioritize these files for context:

1. **CLAUDE.md** - Essential development commands and code style guidelines
2. **.claude/** folder - Detailed documentation:
   - `code-structure.json` - Component relationships and data flows
   - `architecture-overview.md` - System design documentation
   - `component-registry.json` - Component details and usage examples
   - `context-query-examples.md` - Examples for querying context

## Efficient Search Strategies

### For Code Implementation Questions
- First search components in the relevant subdirectory (`components/data/` or `components/resources/`)
- Reference `component-registry.json` for component props and usage examples
- Check `code-structure.json` for component relationships

### For Architecture Questions
- Refer to `architecture-overview.md` for system design patterns
- Consult `code-structure.json` for data flow information

### For Style Questions
- Look at `tailwind.config.js` for theme configuration
- Follow style guidelines in CLAUDE.md

## Project Structure
```
components/         - React components
  data/            - Data visualization components
  resources/       - Resource and glossary components
pages/             - Next.js pages
public/            - Static assets
styles/            - CSS styles
.claude/           - Claude AI context files
ytdl/              - YouTube transcript processing utilities
```

## Domain-Specific Context
This platform organizes research into several key areas:
- **Extraterrestrial Entities**: P-45s, P-52s, and Orions documentation
- **Timeline Mechanics**: Timeline 1 vs Timeline 2 theory, Looking Glass technology
- **Project Lotus**: Ganesh particles, Shiva portals, cellular transformation research
- **Medical Research**: J-Rod neuropathology, genetic modifications, xenograft studies
- **Historical Incidents**: Majestic-12 involvement, key events and locations

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

## Important Project Patterns
- Pages use component state to manage which subcomponents to render
- Components are organized by domain/feature
- Styling is done with Tailwind CSS utility classes
- Use the existing pattern of functional components with hooks
- Focus on organizing well-documented research aspects with clear visualization
- Start with static diagrams before implementing interactive tools

## Platform Architecture Priorities
1. **Home**: Clean landing page with mission statement and navigation
2. **Data**: Core focus with streamlined categories and visualization
3. **Resources**: Curated materials, transcripts, and glossary
4. **About/Contact**: Simple contact form and project information

When exploring code or creating new features, start by understanding related components using the `.claude` documentation to navigate the codebase efficiently.