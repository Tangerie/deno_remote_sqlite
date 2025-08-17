# TypeScript React Coding Style Guide

This document outlines general coding style and conventions for TypeScript Preact projects. Following these guidelines will help maintain consistency and code quality across projects.

## Language and Framework

- **Primary Language**: TypeScript (strict mode enabled)
- **Framework**: Preact with functional components and hooks
- **Styling**: Tailwind CSS (Utility-first class-based CSS)
- **Build Tool**: Modern build tools (Deno, Parcel/Vite)

## Code Structure

### Component Organization

1. Components are defined as functional components using TypeScript
2. Each component is in its own file with a `.tsx` extension (except if it's a small specific component only for use within this file)
3. Components are exported as default exports
4. Props are defined using TypeScript interfaces
5. Complex props are defined in a separate `Props` interface at the top of the file

Example:
```tsx
interface Props {
    title: string;
    onAction?: () => void;
    isLoading?: boolean;
}

export default function MyComponent(props: Props) {
    // Component implementation
}

// OR

export default function MyComponent({ title, onAction, isLoading } : Props) {
    // Component implementation
}
```

### Project Structure

```
src/
├── components/      # Reusable components
├── pages/           # Page-level components (if applicable)
├── hooks/           # Custom hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions and helpers
├── modules/         # Non-tsx functionality
├── assets/          # Static assets
├── styles/          # Global styles (if not using utility-first CSS)
├── App.tsx          # Main application component
├── index.tsx        # Entry point
└── ...
```
- Use subfolders underneath each of these folders to group components

## TypeScript Conventions

### Type Definitions

- Use interfaces for object shapes
- Use enums for discrete values
    - Instead of first class enums, use this convention (it allows you to write either "NewAgency" or EventType.NewAgency as values of type EventType and also is directly JSON serializable/deserializable)
    ```ts
    export const EventType = {
        NewAgency: "NewAgency",
        NewAgent: "NewAgent",
        NewListing: "NewListing",
        Relisting: "Relisting",
        PriceChange: "PriceChange",
        Unlisted: "Unlisted",
        SaleSold: "SaleSold",
        RentDeposit: "RentDeposit",
        RentLeased: "RentLeased"
    } as const;
    export type EventType = typeof EventType[keyof typeof EventType];
    ```
- Use union types and type aliases when appropriate
- Define types in a dedicated `types/` directory when shared across components
- Use `interface` over `type` for object shapes unless creating a union or tuple type
- Use generics where possible

### Strict Typing

- All variables and function parameters should have explicit types
- Return types for functions should be explicitly defined when not obvious
- Avoid using `any` type unless absolutely necessary
- Use `unknown` instead of `any` when the type is truly unknown

### Optional Properties and Nullish Values

- Use optional properties (`?`) for props that may not be provided
- Handle potentially null or undefined values explicitly
- Use nullish coalescing (`??`) and optional chaining (`?.`) where appropriate

## Preact Patterns

### Hooks

- Use built-in Preact hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`) as needed
- Custom hooks should be placed in a dedicated `hooks/` directory (or a file with the name of the hook in pascalCase i.e. useTime.ts)
- Custom hook names should start with `use`
- Hooks follow standard React conventions

### Functional Components

- Use arrow functions for component definitions when appropriate
- Prefer `useMemo` for expensive calculations
- Prefer `useCallback` for callback functions passed to child components
- Keep components focused and small; compose larger UIs from smaller components

### Event Handling

- Event handlers are defined as const functions within the component
- Use proper typing for event parameters
- Use `useCallback` for event handlers passed to child components to prevent unnecessary re-renders

Example:
```tsx
import { JSX } from "preact";
const handleClick = (event : JSX.TargetedMouseEvent<HTMLButtonElement>) => {
    // Handle click
};
```

### State Management

- Local component state is managed with `useState` or `useReducer`
- Complex state transformations are done with `useReducer` when appropriate
- State is updated immutably
- Derived state is calculated with `useMemo`
- Consider context API for global state before reaching for external libraries

## Styling

### Utility-First CSS (with Tailwind CSS)

- Use utility classes directly in the `class` attribute
- Responsive design uses framework's responsive prefixes
- Class composition uses template literals with utility classes
- Do not write css unless there is no TailwindCSS alternative

Example:
```tsx
<div class="flex flex-col justify-center cursor-pointer md:flex-row">
    <div class="bg-gray-800 p-2 rounded relative">
        {/* Content */}
    </div>
</div>
```

## API Integration

### Service Layer

- Create a dedicated service layer for API calls
- Centralize API endpoints and configuration
- Use typed responses and request payloads
- Handle errors consistently

### Data Fetching

- Use `fetch` for API requests
- Handle loading states with component state
- Implement proper error handling

Example:
```tsx
interface User {
    id: number;
    name: string;
}

async function fetchUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user');
    }
    return response.json();
}
```

## Performance Considerations

- Use `useMemo` for expensive calculations
- Implement lazy loading for images and components when appropriate
- Use `useCallback` for functions passed as props to prevent unnecessary re-renders
- Implement virtualization for large lists

## Error Handling

- Implement error boundaries for catching component rendering errors
- Handle API errors with try/catch or .catch() blocks
- Display user-friendly error messages
- Log errors appropriately for debugging
- Use TypeScript discriminated unions for error states

Example:
```tsx
type LoadingState = { status: 'loading' };
type ErrorState = { status: 'error', error: string };
type SuccessState = { status: 'success', data: User };
type State = LoadingState | ErrorState | SuccessState;

const [state, setState] = useState<State>({ status: 'loading' });
```

## Code Formatting

### General Guidelines

- Use consistent indentation (4 spaces)
- Lines should not exceed a reasonable character limit (e.g., 100-120 characters)
- Use trailing commas in multi-line objects and arrays
- Use semicolons at the end of statements
- Be consistent with spacing around operators and braces
    - A single space between operators
    - No space between () or []
    - One space between { }

### Comments

- Inline comments should explain "why" rather than "what"
- Remove commented-out code before committing
- Use TODO comments sparingly and with context

## File Naming

- Component files: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- Utility files: camelCase (e.g., `apiClient.ts`, `formatUtils.ts`)
- Type definition files: PascalCase for all types

## Dependencies

- Only add dependencies that provide clear value
- Regularly audit dependencies for security vulnerabilities
- Prefer well-maintained, popular libraries
- Remove unused dependencies

This style guide should provide a solid foundation for consistent TypeScript Preact development. Adapt and extend these guidelines based on your team's specific needs and project requirements.