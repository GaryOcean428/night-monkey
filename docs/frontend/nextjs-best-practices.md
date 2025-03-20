# Next.js Best Practices

This guide outlines the best practices for Next.js 14/15 development, focusing on performance, architecture, and modern patterns.

## Core Features

### App Router

The App Router (default since Next.js 13) provides:

- File-based routing with nested layouts
- Shared UI across routes
- Automatic code splitting
- Parallel route rendering

```jsx
// app/layout.js - Root layout
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>Common Header</header>
        {children}
        <footer>Common Footer</footer>
      </body>
    </html>
  );
}
```

### Server Components

Server Components render on the server, reducing client-side JavaScript:

```jsx
// app/page.js - Server Component (default)
export default async function Page() {
  // Data fetching happens on the server
  const data = await fetch('https://api.example.com/data');
  const items = await data.json();
  
  return (
    <div>
      <h1>Items</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Modern Data Fetching

Next.js 14/15 replaces older patterns with direct `fetch` calls:

```jsx
// Old approach (pages directory)
export async function getStaticProps() {
  const res = await fetch('https://...');
  const data = await res.json();
  return { props: { data } };
}

// New approach (App Router)
export default async function Page() {
  const data = await fetch('https://...', { 
    cache: 'force-cache' // Static at build time
  });
  return <MyComponent data={data} />;
}
```

### Caching Strategies

Next.js 15 offers granular caching controls:

```jsx
// Static data (cached indefinitely)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
});

// Revalidated at specific intervals
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Seconds
});

// Dynamic data (no caching)
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
});
```

In Next.js 15, configure cache staleness globally:

```js
// next.config.js
module.exports = {
  experimental: {
    staleTimes: {
      dynamic: 30,  // seconds
      static: 180   // seconds
    }
  }
}
```

## Performance Optimization

### Partial Prerendering (PPR)

Available in Next.js 15, PPR combines static and dynamic content:

```jsx
// Enable PPR
export const experimental_ppr = true;

export default function Page() {
  return (
    <div>
      <StaticPart /> {/* Prerendered HTML */}
      <Suspense fallback={<Loading />}>
        <DynamicPart /> {/* Loaded after initial render */}
      </Suspense>
    </div>
  );
}
```

### Image Optimization

Use the built-in Image component for optimal loading:

```jsx
import Image from 'next/image';

export default function ProductImage() {
  return (
    <Image
      src="/product.jpg"
      width={500}
      height={300}
      placeholder="blur"
      priority={true}
      alt="Product Image"
    />
  );
}
```

### Code Splitting

Implement dynamic imports for optimal bundle sizes:

```jsx
import dynamic from 'next/dynamic';

// Only loaded when needed
const DynamicChart = dynamic(() => import('../components/Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false // Skip SSR for client-only components
});

export default function Dashboard() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <DynamicChart data={chartData} />
    </div>
  );
}
```

## Data Mutations

### Server Actions

Server Actions handle form submissions and data mutations:

```jsx
// app/actions.js
'use server'

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  await db.posts.create({ title, content });
  
  // Revalidate the posts cache
  revalidatePath('/posts');
}

// app/page.js
import { createPost } from './actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Type Safety

Enhanced TypeScript support:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Type-checked configuration
};

export default config;
```

## Best Practices

1. **Route Organization:**
   - Group related routes in folders
   - Use private folders (_components) for shared UI
   - Implement route groups for logical separation

2. **Component Architecture:**
   - Default to Server Components
   - Use Client Components only when needed (interactivity)
   - Leverage Suspense boundaries for loading states

3. **Data Fetching:**
   - Fetch data on the server when possible
   - Implement parallel data fetching with Promise.all
   - Use appropriate caching strategies per endpoint

4. **State Management:**
   - Use React Context for shared state
   - Implement Server Actions for mutations
   - Avoid unnecessary client-side state

5. **Error Handling:**
   - Create error.js files for route error boundaries
   - Implement not-found.js for 404 pages
   - Use loading.js for Suspense fallbacks

6. **Deployment:**
   - Enable ISR for dynamic content that changes infrequently
   - Configure caching headers appropriately
   - Use Edge runtime for latency-sensitive routes

## Migration Path

When upgrading to Next.js 15:

1. Update dependencies
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```

2. Run codemods for automatic migration
   ```bash
   npx @next/codemod@latest upgrade latest
   ```

3. Update TypeScript configuration as needed
   ```bash
   npx @next/codemod@latest remove-getstatprops
   ```

4. Test thoroughly with both development and production builds