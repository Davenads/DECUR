# DECUR TypeScript Type Definitions

This directory contains TypeScript interfaces and types used throughout the DECUR project.

## Organization

The types are organized by their domain or purpose:

- `common.ts` - Shared utility types used across the application
- `components.ts` - Types for component props
- `data.ts` - Data models and related types
- `entities.ts` - Entity-specific types
- `hooks.ts` - Type definitions for custom hooks
- `navigation.ts` - Types for navigation components
- `pages.ts` - Page-specific types

## Guidelines for Using Types

1. **Import specificity**: Import only the specific types you need
   ```typescript
   import { EntityType } from '../types/entities';
   ```

2. **Composition over inheritance**: Compose complex types from simpler ones
   ```typescript
   interface DetailedEntityProfile extends EntityProfile {
     extendedData: AdditionalData;
   }
   ```

3. **Use Generics**: For reusable component types
   ```typescript
   interface ListProps<T> {
     items: T[];
     renderItem: (item: T) => JSX.Element;
   }
   ```

4. **Avoid using `any`**: Be specific with your types to leverage TypeScript's full potential

## Type Naming Conventions

- Interfaces: PascalCase, descriptive nouns (e.g., `UserProfile`, `DataItem`)
- Types: PascalCase, often with a `Type` suffix for clarity (e.g., `CategoryType`)
- Generic type parameters: Single uppercase letter or PascalCase (e.g., `T`, `Item`)
- Prop interfaces: Component name + `Props` (e.g., `HeaderProps`)

## Adding New Types

When adding new types:

1. Choose the appropriate file based on the domain
2. Add JSDoc comments to describe complex types
3. Update this README if adding a new domain file
4. Follow the existing naming patterns