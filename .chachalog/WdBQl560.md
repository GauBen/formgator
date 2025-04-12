---
# Describe desired version bumps
formgator: patch
---

Add support for custom error messages. (#22)

```js
// Composable, user-friendly username schema
const username = fg.text(
  { minlength: 3, pattern: /^\w+$/ },
  {
    // Can be a function or a string
    minlength: ({ minlength }) => `Username must be at least ${minlength} characters long`,
    pattern: "Username can only contain letters, numbers, and underscores",
  }
);
```
