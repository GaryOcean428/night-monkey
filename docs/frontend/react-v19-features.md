# React v19 Features

React 19 introduces major improvements in performance, developer experience, and architectural capabilities.

## Core Features

### React Compiler

The React Compiler automatically optimizes components, reducing the need for manual optimizations:

```jsx
// Before React 19: Manual optimization
function ExpensiveList({ items }) {
  // Required to prevent unnecessary re-renders
  return useMemo(() => (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  ), [items]);
}

// With React 19: Automatic optimization
function ExpensiveList({ items }) {
  // No useMemo needed - compiler does it for you
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

### Server Actions

Seamless client-server state management for forms and data mutations:

```jsx
// actions.js
'use server';

export async function updateProfile(prevState, formData) {
  const name = formData.get('name');
  const bio = formData.get('bio');
  
  try {
    await updateUserInDatabase({ name, bio });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// ProfileForm.jsx
'use client';
import { useActionState, useFormStatus } from 'react';
import { updateProfile } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Profile'}
    </button>
  );
}

export function ProfileForm() {
  const [state, dispatch] = useActionState(updateProfile, { success: false });
  
  return (
    <form action={dispatch}>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">Profile updated!</p>}
      
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" required />
      </div>
      
      <div>
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" />
      </div>
      
      <SubmitButton />
    </form>
  );
}
```

### Enhanced Hooks

New hooks simplify common patterns:

#### useActionState

```jsx
const [state, dispatch, isPending] = useActionState(
  async (prevState, formData) => {
    // Process form data and return new state
    return newState;
  },
  initialState
);
```

#### useFormStatus

```jsx
function SubmitButton() {
  const { pending, data, method, action } = useFormStatus();
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Processing...' : 'Submit'}
    </button>
  );
}
```

#### useOptimistic

```jsx
const [optimisticState, addOptimistic] = useOptimistic(
  currentState,
  (state, newValue) => ({
    ...state,
    // Apply optimistic update
    items: [...state.items, newValue]
  })
);

// Usage
<button onClick={() => addOptimistic(newItem)}>
  Add Item
</button>
```

### Simplified Ref Handling

Functional components can now accept refs directly:

```jsx
// Before React 19
const TextInput = React.forwardRef((props, ref) => (
  <input {...props} ref={ref} />
));

// React 19
function TextInput({ ref, ...props }) {
  return <input {...props} ref={ref} />;
}
```

### Asset Loading Optimization

New APIs for preloading resources:

```jsx
import { preload, preinit } from 'react';

function ProductPage() {
  useEffect(() => {
    // Preload critical resources
    preload('/product-image.jpg', { as: 'image' });
    preinit('https://api.example.com', { as: 'fetch' });
  }, []);
  
  return <ProductDetails />;
}
```

## Performance Improvements

### Automatic Batching

React 19 automatically batches all state updates for better performance:

```jsx
// In React 18: Two separate renders
setTimeout(() => {
  setCount(c => c + 1);  // Causes a render
  setFlag(f => !f);      // Causes another render
}, 1000);

// In React 19: Single render for both updates
```

### Hydration Enhancements

Improved error handling and recovery during hydration:

```jsx
// Better hydration mismatch debugging
// React 19 provides detailed error messages:
/*
Hydration mismatch:
- Server: <div className="user">Logged in</div>
- Client: <div className="user">Please log in</div>

Possible causes:
1. Time-based rendering differences
2. Client/server data inconsistency
*/
```

## Integration with Server Components

React 19 offers native support for Server Components:

```jsx
// ServerComponent.server.js
export default function ServerComponent() {
  // This component executes on the server
  const data = fetchDataDirectlyFromDatabase();
  
  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}

// ClientComponent.client.js
'use client';

import { useState } from 'react';
import ServerComponent from './ServerComponent.server';

export default function ClientComponent() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsVisible(!isVisible)}>Toggle</button>
      {isVisible && <ServerComponent />}
    </div>
  );
}
```

## Custom Elements Support

Improved interoperability with Web Components:

```jsx
function App() {
  return (
    <div>
      {/* Props passed as HTML attributes or DOM properties based on type */}
      <custom-slider
        min={0}
        max={100}
        value={50}
        onChange={(e) => console.log(e.detail)}
      />
    </div>
  );
}
```

## Best Practices

### Migration Strategy

1. Update dependencies:
   ```bash
   npm install react@19 react-dom@19
   ```

2. Run codemod for ref changes:
   ```bash
   npx react-codemod update-ref-prop
   ```

3. Audit and remove unnecessary optimizations:
   - Remove redundant `useMemo` and `useCallback` hooks
   - Let the compiler optimize components automatically

### Form Handling

Optimal pattern for form submissions:

```jsx
// action.js
'use server';
export async function submitForm(prevState, formData) {
  // Process form data
  return newState;
}

// Form.jsx
'use client';
import { useActionState, useFormStatus } from 'react';
import { submitForm } from './action';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Submitting...' : 'Submit'}</button>;
}

export function Form() {
  const [state, dispatch] = useActionState(submitForm, initialState);
  
  return (
    <form action={dispatch}>
      {/* Form fields */}
      <SubmitButton />
    </form>
  );
}
```

### Resource Loading

Priority-based resource management:

```jsx
function App() {
  useLayoutEffect(() => {
    // Critical resources
    preload('/main.css', { as: 'style' });
    preload('/hero-image.jpg', { as: 'image' });
    
    // Secondary resources
    preinit('/analytics.js', { as: 'script' });
  }, []);
  
  return <MainContent />;
}
```

### Component Architecture

Design components with React 19's features in mind:

1. Default to Server Components when no interactivity is needed
2. Minimize client-side JavaScript with fine-grained Client Components
3. Use the new hooks for forms and optimistic updates
4. Leverage automatic optimizations from the compiler
5. Design around the new ref handling for simpler component hierarchies