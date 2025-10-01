---
title: Getting Started with React Hooks
date: 2025-01-15
author: Christina
tags: [react, javascript, web-development]
---

# Getting Started with React Hooks

React Hooks revolutionized how we write React components. This guide will help you understand and effectively use hooks in your projects.

> **Note**: This is an example blog post demonstrating how to use images in blog content. To see images appear, add actual image files to `files/Blog-Images/` and reference them using the syntax shown below.

## Why Hooks?

Before hooks, we had to use class components for state management. Hooks allow us to:

- Use state in functional components
- Share stateful logic between components
- Organize code by feature, not lifecycle

## Basic Hooks

### useState

The `useState` hook lets you add state to functional components:

```javascript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### useEffect

The `useEffect` hook handles side effects in your components:

```javascript
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
const [user, setUser] = useState(null);

useEffect(() => {
fetch(\`/api/users/\${userId}\`)
.then(res => res.json())
.then(data => setUser(data));
}, [userId]); // Re-run when userId changes

return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

## Advanced Hooks

### useContext

Share data without prop drilling:

```javascript
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

### useReducer

For complex state logic:

```javascript
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </>
  );
}
```

## Custom Hooks

Create your own hooks to extract reusable logic:

```javascript
import { useState, useEffect } from "react";

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

// Usage
function MyComponent() {
  const width = useWindowWidth();
  return <div>Window width: {width}px</div>;
}
```

## Best Practices

1. **Only call hooks at the top level** - Don't call them inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Either functional components or custom hooks
3. **Name custom hooks with "use" prefix** - This helps identify them as hooks
4. **Keep effects focused** - One effect per concern makes code easier to understand
5. **Specify dependencies correctly** - Include all values from component scope that change over time

## Common Mistakes to Avoid

### Missing Dependencies

```javascript
// ❌ Bad: missing dependency
useEffect(() => {
  console.log(count);
}, []); // count is not in dependency array

// ✅ Good: all dependencies included
useEffect(() => {
  console.log(count);
}, [count]);
```

### Infinite Loops

```javascript
// ❌ Bad: creates infinite loop
const [data, setData] = useState([]);
useEffect(() => {
  setData([...data, newItem]); // data changes, triggers effect again
}, [data]);

// ✅ Good: use functional update
useEffect(() => {
  setData((prevData) => [...prevData, newItem]);
}, [newItem]);
```

## Including Images in Blog Posts

You can easily add images to your blog posts using standard Markdown syntax or custom bracket notation:

### Standard Markdown Syntax (Recommended)

```markdown
![React Hooks Diagram](react-hooks-diagram.png)
```

### Custom Bracket Syntax

```markdown
[[react-component-lifecycle.jpg]]
```

**Example**: If you had an image file at `files/Blog-Images/example-diagram.png`, you could reference it like this:

![Example Diagram](example-diagram.png)

Or using brackets: [[example-diagram.png]]

> **To make this work**: Add your actual image files to the `files/Blog-Images/` directory, then reference them by filename in your markdown.

## Conclusion

React Hooks provide a powerful way to add state and side effects to functional components. By following best practices and understanding how hooks work, you can write cleaner, more maintainable React code.

Happy coding! 🚀
