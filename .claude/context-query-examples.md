# Context Query Examples for DECUR

This document provides examples of how to query the context files to understand various aspects of the DECUR application when working with Claude. The codebase has been migrated to TypeScript, so many of these examples relate to TypeScript features.

## Finding Component Dependencies

### Question: Which components depend on the Header component?

```json
// Query code-structure.json to find component dependencies
// Look for components that list "Header" in their dependencies array
// Or query for "consumedBy" to find where Header is used

// Example query (conceptual):
{
  "components": {
    "layout": {
      "children": ["Header", "Footer"] // Header is used by Layout
    }
  }
}
```

### Question: What components are used in the data.tsx page?

```json
// Query code-structure.json for pages.data.components
{
  "pages": {
    "data": {
      "components": ["DataNavigation", "EntityProfiles", "TimelineConcepts", "LotusFindings"]
    }
  }
}
```

## Tracing Data Flow

### Question: How does data flow in the Data page?

```
// Look at the data flows section in code-structure.json
{
  "dataFlows": [
    {
      "name": "categorySelection",
      "source": "data.tsx",
      "target": ["EntityProfiles", "TimelineConcepts", "LotusFindings"],
      "description": "User selects data category triggering component rendering"
    }
  ]
}

// Then check architecture-overview.md for the data flow diagram
```

### Question: What happens when a user selects a resource tab?

```
// Look at dataFlows in code-structure.json
{
  "dataFlows": [
    {
      "name": "resourceTabSelection",
      "source": "resources.tsx",
      "target": ["ResourceList", "Glossary"],
      "description": "User selects resource tab triggering component rendering"
    }
  ]
}
```

## Component Details

### Question: What are the props for the DataNavigation component?

```json
// Query component-registry.json for the DataNavigation component
{
  "components": [
    {
      "name": "DataNavigation",
      "props": {
        "activeCategory": "CategoryType - Currently active data category",
        "setActiveCategory": "Function - Callback when category is changed"
      },
      "typeInterface": "interface DataNavigationProps { activeCategory: CategoryType; setActiveCategory: (category: CategoryType) => void; } type CategoryType = 'entities' | 'timelines' | 'lotus' | 'whistleblowers';"
    }
  ]
}
```

### Question: How is the Layout component used?

```json
// First look at component-registry.json for usage examples
{
  "components": [
    {
      "name": "Layout",
      "usageExample": "// In _app.tsx\nimport Layout from '../components/Layout';\nimport type { AppProps } from 'next/app';\n\nfunction MyApp({ Component, pageProps }: AppProps) {\n  return (\n    <Layout>\n      <Component {...pageProps} />\n    </Layout>\n  );\n}",
      "typeInterface": "interface LayoutProps { children: ReactNode; title?: string; }"
    }
  ]
}

// Then check code-structure.json for where it's consumed
{
  "components": {
    "layout": {
      "consumedBy": ["_app.tsx"]
    }
  }
}
```

## Understanding Architecture Patterns

### Question: What is the overall architecture of the DECUR application?

```
// Query architecture-overview.md for system design pattern section
## System Design Pattern

DECUR follows a **Component-Based Architecture** with a focus on presentational components 
organized into logical categories. The application is primarily client-side rendered with 
Next.js acting as the framework foundation.
```

### Question: How is state managed in the application?

```
// Look at the State Management Strategy section in architecture-overview.md
## State Management Strategy

- **Local Component State**: React's useState hook is used for component-level state with TypeScript types
- **No Global State**: No Redux, Context API, or other global state management detected
- **Props Passing**: Data and callbacks passed down the component tree via typed props
- **Page-Level State**: State that affects multiple components is managed at the page level
- **Type Safety**: TypeScript ensures type safety for state and props throughout the application
```

## API Information

### Question: What API endpoints are available for entity data?

```json
// Query api-endpoints.json for entity-related APIs
{
  "apiEndpoints": [
    {
      "suggestedEndpoints": [
        {
          "route": "/api/entities",
          "method": "GET",
          "description": "Retrieve all entity profiles",
          "requestParams": {
            "query": {
              "category": "Optional - Filter by category",
              "search": "Optional - Search term"
            }
          }
        }
      ]
    }
  ]
}
```

### Question: Which components would be affected by changes to the search API?

```json
// Look for components related to search API in api-endpoints.json
{
  "apiEndpoints": [
    {
      "suggestedEndpoints": [
        {
          "route": "/api/search",
          "relatedComponents": ["SearchBar"]
        }
      ]
    }
  ]
}
```

## Identifying Impact of Changes

### Question: What would be affected by refactoring the Layout component?

```
// First check which components Layout depends on in code-structure.json
{
  "components": {
    "layout": {
      "children": ["Header", "Footer"]
    }
  }
}

// Then see what consumes Layout
{
  "components": {
    "layout": {
      "consumedBy": ["_app.tsx"]
    }
  }
}

// Also check the interface definition
{
  "components": [
    {
      "name": "Layout",
      "typeInterface": "interface LayoutProps { children: ReactNode; title?: string; }"
    }
  ]
}

// This shows that changes to Layout would affect:
// 1. The Header and Footer components it contains
// 2. The _app.tsx file that uses Layout
// 3. Any component that expects the LayoutProps interface
// 4. Potentially all pages rendered through _app.tsx
```

### Question: What components would be affected by adding authentication?

```
// Check architecture-overview.md for current authentication approach
## Authentication and Authorization

The DECUR application does not implement authentication or authorization mechanisms. 
Content is publicly accessible without login requirements.

// This indicates that adding authentication would require:
// 1. Creating new auth-related components with TypeScript interfaces
// 2. Adding authentication type definitions
// 3. Modifying Layout or _app.tsx to include typed auth state
// 4. Adding protected route handlers with proper type checking
// 5. Updating API endpoints to include authentication requirements with TypeScript types
```

## Claude-Specific Context Queries

### How to ask Claude to analyze the component hierarchy

```
"Based on the code-structure.json file, can you explain the component hierarchy of the DECUR application? Please show me how components are nested and their relationships."
```

### How to ask Claude about implementing a new feature

```
"I want to add a new feature that allows users to filter entity profiles by type. Based on the architecture-overview.md and component-registry.json files, what components would I need to modify and how would the data flow work? Please include TypeScript interfaces I should create or modify."
```

### How to ask Claude about code patterns

```
"Looking at the component-registry.json file, what patterns do you see in how components are structured and how props are passed? How should I follow these patterns when creating new TypeScript components?"
```

### How to ask Claude about TypeScript interfaces

```
"What TypeScript interfaces are defined for the EntityProfiles component? How should I extend these interfaces to add filtering capabilities while maintaining type safety?"
```

### How to ask Claude about TypeScript best practices

```
"Based on the codebase, what TypeScript patterns and best practices are being used? How can I ensure my new components follow the same conventions?"
```