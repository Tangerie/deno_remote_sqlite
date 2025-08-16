# IMPORTANT
- DO NOT RUN `npm`, `npx` OR `deno` COMMANDS.
- A development server is already running, DO NOT start another.
- ONLY IMPORT `RemoteDatabase` from `@tangerie/deno_remote_sqlite/client`

# Project
Create a preact app, using typescript, deno, vite and tailwindcss. It's a sqlite database viewer (allow user to browse tables), using `@tangerie/deno_remote_sqlite/client`.


## Instructions
- Do not write any css, only write inline TailwindCSS classes

## Folder Structure
- Components (.tsx) go in `src/components`
- Modules (.tx) go in `src/components` 
- Pages/Tabs (.tsx) go in `src/pages` 
- Stores (@tangerie/global-store) go in `src/stores`

### General Code Style
- Indent = 4 spaces
- Always be explicit with types

### Typescript

### Preferring Plain Objects over Classes

JavaScript classes, by their nature, are designed to encapsulate internal state and behavior. While this can be useful in some object-oriented paradigms, it often introduces unnecessary complexity and friction when working with React's component-based architecture. Here's why plain objects are preferred:

- Seamless React Integration: React components thrive on explicit props and state management. Classes' tendency to store internal state directly within instances can make prop and state propagation harder to reason about and maintain. Plain objects, on the other hand, are inherently immutable (when used thoughtfully) and can be easily passed as props, simplifying data flow and reducing unexpected side effects.

- Reduced Boilerplate and Increased Conciseness: Classes often promote the use of constructors, this binding, getters, setters, and other boilerplate that can unnecessarily bloat code. TypeScript interface and type declarations provide powerful static type checking without the runtime overhead or verbosity of class definitions. This allows for more succinct and readable code, aligning with JavaScript's strengths in functional programming.

- Enhanced Readability and Predictability: Plain objects, especially when their structure is clearly defined by TypeScript interfaces, are often easier to read and understand. Their properties are directly accessible, and there's no hidden internal state or complex inheritance chains to navigate. This predictability leads to fewer bugs and a more maintainable codebase.

- Simplified Immutability: While not strictly enforced, plain objects encourage an immutable approach to data. When you need to modify an object, you typically create a new one with the desired changes, rather than mutating the original. This pattern aligns perfectly with React's reconciliation process and helps prevent subtle bugs related to shared mutable state.

- Better Serialization and Deserialization: Plain JavaScript objects are naturally easy to serialize to JSON and deserialize back, which is a common requirement in web development (e.g., for API communication or local storage). Classes, with their methods and prototypes, can complicate this process.

### Embracing ES Module Syntax for Encapsulation

Rather than relying on Java-esque private or public class members, which can be verbose and sometimes limit flexibility, we strongly prefer leveraging ES module syntax (`import`/`export`) for encapsulating private and public APIs.

- Clearer Public API Definition: With ES modules, anything that is exported is part of the public API of that module, while anything not exported is inherently private to that module. This provides a very clear and explicit way to define what parts of your code are meant to be consumed by other modules.

- Enhanced Testability (Without Exposing Internals): By default, unexported functions or variables are not accessible from outside the module. This encourages you to test the public API of your modules, rather than their internal implementation details. If you find yourself needing to spy on or stub an unexported function for testing purposes, it's often a "code smell" indicating that the function might be a good candidate for extraction into its own separate, testable module with a well-defined public API. This promotes a more robust and maintainable testing strategy.

- Reduced Coupling: Explicitly defined module boundaries through import/export help reduce coupling between different parts of your codebase. This makes it easier to refactor, debug, and understand individual components in isolation.

### Avoiding `any` Types and Type Assertions; Preferring `unknown`

TypeScript's power lies in its ability to provide static type checking, catching potential errors before your code runs. To fully leverage this, it's crucial to avoid the `any` type and be judicious with type assertions.

- **The Dangers of `any`**: Using any effectively opts out of TypeScript's type checking for that particular variable or expression. While it might seem convenient in the short term, it introduces significant risks:
    - **Loss of Type Safety**: You lose all the benefits of type checking, making it easy to introduce runtime errors that TypeScript would otherwise have caught.
    - **Reduced Readability and Maintainability**: Code with `any` types is harder to understand and maintain, as the expected type of data is no longer explicitly defined.
    - **Masking Underlying Issues**: Often, the need for any indicates a deeper problem in the design of your code or the way you're interacting with external libraries. It's a sign that you might need to refine your types or refactor your code.

- **Preferring `unknown` over `any`**: When you absolutely cannot determine the type of a value at compile time, and you're tempted to reach for any, consider using unknown instead. unknown is a type-safe counterpart to any. While a variable of type unknown can hold any value, you must perform type narrowing (e.g., using typeof or instanceof checks, or a type assertion) before you can perform any operations on it. This forces you to handle the unknown type explicitly, preventing accidental runtime errors.

    ```ts
    function processValue(value: unknown) {
            if (typeof value === 'string') {
                // value is now safely a string
                console.log(value.toUpperCase());
            } else if (typeof value === 'number') {
                // value is now safely a number
                console.log(value * 2);
            }
            // Without narrowing, you cannot access properties or methods on 'value'
            // console.log(value.someProperty); // Error: Object is of type 'unknown'.
    }
    ```

- **Type Assertions (`as Type`) - Use with Caution**: Type assertions tell the TypeScript compiler, "Trust me, I know what I'm doing; this is definitely of this type." While there are legitimate use cases (e.g., when dealing with external libraries that don't have perfect type definitions, or when you have more information than the compiler), they should be used sparingly and with extreme caution.
    - **Bypassing Type Checking**: Like `any`, type assertions bypass TypeScript's safety checks. If your assertion is incorrect, you introduce a runtime error that TypeScript would not have warned you about.
    - **Code Smell in Testing**: A common scenario where `any` or type assertions might be tempting is when trying to test "private" implementation details (e.g., spying on or stubbing an unexported function within a module). This is a strong indication of a "code smell" in your testing strategy and potentially your code structure. Instead of trying to force access to private internals, consider whether those internal details should be refactored into a separate module with a well-defined public API. This makes them inherently testable without compromising encapsulation.

### Embracing JavaScript's Array Operators

To further enhance code cleanliness and promote safe functional programming practices, leverage JavaScript's rich set of array operators as much as possible. Methods like `.map()`, `.filter()`, `.reduce()`, `.slice()`, `.sort()`, and others are incredibly powerful for transforming and manipulating data collections in an immutable and declarative way.

Using these operators:

- Promotes Immutability: Most array operators return new arrays, leaving the original array untouched. This functional approach helps prevent unintended side effects and makes your code more predictable.
- Improves Readability: Chaining array operators often lead to more concise and expressive code than traditional for loops or imperative logic. The intent of the operation is clear at a glance.
- Facilitates Functional Programming: These operators are cornerstones of functional programming, encouraging the creation of pure functions that take inputs and produce outputs without causing side effects. This paradigm is highly beneficial for writing robust and testable code that pairs well with React.

By consistently applying these principles, we can maintain a codebase that is not only efficient and performant but also a joy to work with, both now and in the future.

### Modularisation of Preact components
- Always prefer splitting out common code into re-usable components instead of repeating yourself.
    - For example, if you wrote
    ```html
    <a
        href="/browse"
        class={`py-4 px-1 border-b-2 font-medium text-sm ${
            (url === '/' || url === '/browse')
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
        }`}
    >
        Browse Tables
    </a>
    <a
        href="/schema"
        class={`py-4 px-1 border-b-2 font-medium text-sm ${
            url === '/schema'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
        }`}
    >
        View Schemas
    </a>
    <a
        href="/sql"
        class={`py-4 px-1 border-b-2 font-medium text-sm ${
            url === '/sql'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
        }`}
    >
        Execute SQL
    </a>
    ```
    You must decompose it into a common component
    ```tsx
    // components/.../ReplaceWithAComponentName.tsx
    interface Props {
        path : string;
        title : string;
    }
    export default function ReplaceWithAComponentName({ path, title } : Props) {
        return <a
            href={path}
            class={`py-4 px-1 border-b-2 font-medium text-sm ${
                url === path
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
        >
            {title}
        </a>
    }
    ```
    Making the original
    ```tsx
    return <>
    ...
    <ReplaceWithAComponentName url="/browse" title="Browse Tables"/>
    <ReplaceWithAComponentName url="/schema" title="View Schemas"/>
    <ReplaceWithAComponentName url="/sql" title="Execute SQL"/>
    ...
    </>
    ```

### Global Store
- When creating a store, export all the resulting actions directly.
    ```ts
    const { get, actions, select, selector, set, subscribe } = store.actions;
    // Instead of 
    export { actions };

    // Do
    export const { clearDb, resetAll, resetTableData } = appStore.actions;
    ```
- When creating the actions, avoid writing just setters, instead they should encapsulate more behaviour.
    ```ts
    // Instead of
    createStore({
        ...
        actions: {
            // Database actions
            setDb: (state, db: RemoteDatabase | null) => {
                state.db = db;
            },
            clearDb: (state) => {
                if (state.db) {
                    state.db.close();
                }
                state.db = null;
            },
            setCurrentPage: (state, page: number) => {
                state.currentPage = page;
            },
            setTableData: (state, data: any[]) => {
                state.tableData = data;
            },
        }
        ...
    })

    // Do
    createStore({
        ...
        actions: {
            // Database actions
            async openDb(state) {
                state.db = new RemoteDatabase(state.url);
                await state.db.open();
            },
            closeDb(state) {
                if (state.db) {
                    state.db.close();
                }
                state.db = null;
            },
            async setCurrentPage(state, page: number) {
                state.currentPage = page;
                state.tableData = await loadDataFromPage(state.db, state.currentPage);
            },
        }
        ...
    })
    ```

# IMPORTANT
- DO NOT RUN `npm`, `npx` OR `deno` COMMANDS.
- A development server is already running, DO NOT start another.
- ONLY IMPORT `RemoteDatabase` from `@tangerie/deno_remote_sqlite/client`
- ONLY IMPORT createUseStore locally