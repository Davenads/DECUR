# DECUR Project Instructions

## Project Overview
DECUR (Data Exceeding Current Understanding of Reality) is a Next.js application for exploring UAP/NHI phenomena data with a component-based architecture using Tailwind CSS.

## Key Files to Reference
When working with this project, prioritize these files for context:

1. **CLAUDE.md** - Contains essential development commands and code style guidelines
2. **.claude/** folder - Contains detailed documentation:
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

## Important Project Patterns
- Pages use component state to manage which subcomponents to render
- Components are organized by domain/feature
- Styling is done with Tailwind CSS utility classes
- Use the existing pattern of functional components with hooks

When exploring code or creating new features, start by understanding related components using the `.claude` documentation to navigate the codebase efficiently.