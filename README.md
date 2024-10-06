<div align="center">
	<img src="https://raw.githubusercontent.com/GauBen/timeline/2b93c661b3aef52f5bafe3f0265590d73a64a47f/packages/formgator/formgator.jpg" alt="Ali, the friendly alligator that guards your forms" width="200" height="200">
</div>

# formgator

A validation library for JavaScript `FormData` and `URLSearchParams` objects.

## Basic Usage

If you have a form with the following fields:

```html
<form method="post">
  <label>
    User Name:
    <input type="text" name="username" required />
  </label>
  <label>
    Birthday:
    <input type="date" name="birthday" />
  </label>
  <label>
    <input type="checkbox" name="newsletter" />
    Subscribe to newsletter
  </label>
  <button type="submit">Submit</button>
</form>
```

You can use `formgator` to validate the form data:

```ts
import * as fg from 'formgator';

// Define a form schema
const schema = fg.form({
  username: fg.text({ required: true }),
  birthday: fg.date().asDate(),
  newsletter: fg.checkbox(),
});

async function handle(request: Request) {
  // Retrieve the form data from the request
  const form = await request.formData();

  // Validate the form data
  const data = schema.parse(form);

  // data is now an object with the following shape:
  // {
  //   username: string,
  //   birthday: Date | null,
  //   newsletter: boolean,
  // }

  // If the form data is invalid, an error will be thrown
}
```

## API

You can expect formgator to expose a validator for [all possible `<input type="...">` values](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) as well as `<select>` and `<textarea>`.

These validators will produce a coherent value for each input type:

- `number()` and `range()` produce `number` values.
- `checkbox()` produces `boolean` values.
- `file()` produces a `File` object.
- Other validators produce `string` values.

All these validators take their common (and less common) HTML validation attributes as options:

- `text({ required: true, maxlength: 255 })`
- `number({ min: 10, max: 100, step: 10 })`
- `radio(["yes", "no"], { required: true })` to check against a list of possible values.
- `select(["apple", "banana", "cherry"], { multiple: true })` for `<select multiple>` elements.
- `file({ accept: [".jpg", ".jpeg"] })` for basic extension and MIME type validation.

Some validators have additional methods to transform the value into a native JavaScript object:

- `datetimeLocal()`, `date()` and `month()` have `asDate()` to return a `Date` object, and `asNumber()` to return a timestamp.
- `color()` has `asRgb()` to return a `[number, number, number]` tuple.
- `textarea()` has `trim()` to remove leading and trailing whitespace.

Validators can be chained with additional methods to transform the value:

- `transform(fn: (value: T) => U)` transforms the value using the provided function.

  ```ts
  const schema = fg.form({
    id: fg.text({ required: true, pattern: /^\d+$/ }).transform(BigInt),
  });
  // schema.parse(form) will produce an object with the shape { id: BigInt }
  ```

  A second argument can be provided to `transform` to produce a meaningful error message if the transformation fails.

- `refine(fn: (value: T) => boolean)` adds a custom validation step.

  ```ts
  const schema = fg.form({
    even: fg.number().refine((value) => value % 2 === 0),
  });
  // schema.parse(form) will throw an error if `even` is odd
  ```

  A second argument can be provided to `refine` to produce a meaningful error message if the refinement fails.

- `optional()` allows the field to be missing. This is useful when dynamically adding fields to a form. Missing and empty fields are different things, and `optional` does not allow empty fields.

  ```ts
  const schema = fg.form({
    contactChannel = fg.radio(['email', 'phone'], { required: true }),
    email: fg.email({ required: true }).optional(),
    phone: fg.tel({ required: true }).optional(),
  });
  // You should then check if at least one is properly defined
  ```

The schema produced by `fg.form()` has two methods:

- `.parse()` that returns the parsed form data or throws an error if the form data is invalid.
- `.safeParse()` that returns an object with this shape: `{ success: true, data: Output } | { success: false, error: Error }`.

## Errors

An invalid form will produce an error with the same shape as your form schema:

```ts
const schema = fg.form({
  username: fg.text({ required: true }),
  birthday: fg.date().asDate(),
  newsletter: fg.checkbox(),
});

// Using `.parse()`:
try {
  schema.parse(form);
} catch (error) {
  if (error instanceof fg.FormgatorError) {
    // error.issues is an object with this shape
    // {
    //   username?: ValidationIssue
    //   birthday?: ValidationIssue
    //   newsletter?: ValidationIssue
    // }
  }
}

// Using `.safeParse()`:
const result = schema.safeParse(form);
if (!result.success) {
  // result.error.issues is an object with this shape
  // {
  //   username?: ValidationIssue
  //   birthday?: ValidationIssue
  //   newsletter?: ValidationIssue
  // }
}
```

A `ValidationIssue` object has the following shape:

```ts
interface ValidationIssue {
  code:
    | 'type' // If the value is not of the expected type (e.g. string instead of File)
    | 'invalid' // If the value does not have the right format (e.g. invalid email)
    | 'required' // If the value is empty
    | 'minlength' // If the value is too short
    | 'maxlength' // If the value is too long
    | 'pattern' // If the value does not match the pattern
    | 'min' // If the value is too low
    | 'max' // If the value is too high
    | 'step' // If the value is not a multiple of the step
    | 'accept' // If the value does not match the accept attribute
    | 'transform' // If the `transform` callback throws an error
    | 'refine'; // If the `refine` callback returns false
  message: string;
}
```

If some fields were accepted nonetheless, the `error` object will have an `accepted` property with all the accepted fields: `error.accepted` for `.parse()` and `result.error.accepted` for `.safeParse()`. This allows you to recover from partial form data.

## Usage with SvelteKit

`formgator` exposes a SvelteKit adapter that can be used to validate form data in SvelteKit [form actions](https://kit.svelte.dev/docs/form-actions).

```ts
// +page.server.ts
import * as fg from 'formgator';
import { formgate } from 'formgator/sveltekit';

export const actions = {
  login: formgate(
    {
      email: fg.email({ required: true }),
      password: fg.password({ required: true }),
    },
    (data, event) => {
      // data.email and data.password are guaranteed to be strings
      // The form will be rejected as 400 Bad Request if they are missing or empty
      // event is the object that would be your first argument without formgator
    }
  ),
};
```

The parsed form result is added at the beginning of the arguments list to ensure ascending compatibility with SvelteKit; extending the `event` object might clash with upcoming features.

If the form data is invalid, the form action will populate the `form` property of your `+page.svelte` component. Its shape will be as follows:

```ts
export let form: {
  issues: {
    // Contains the validation issues for each field
    email?: ValidationIssue;
    password?: ValidationIssue;
  };
  accepted: {
    // Allows you to recover from partial form data
    email?: string;
    password?: string;
  };
};
```

If you have several forms on the same page, you can add a third argument to `formgate` to specify the form name: `formgate(..., { id: "login" })`. This id will be propagated to `form.id` in your page component.

## Disclaimer

This package is still in development and the API is subject to change. API will be stabilized in version 1.0.0.

## Design choices

- Why does `text()` produce `null` for an empty string?

  This allows making the difference between _empty_ and _valid_. For instance, the field `<input type="text" minlength="4">` would accept both `''` and `'1234'` but not `'123'`; an empty field is considered valid as long as the `required` attribute is not set on the input. Therefore, `text()` produces `string` when valid and `null` when empty. To receive a `string` value, either use `text({ required: true })` to prevent empty inputs, `text().transform(v => v ?? '')` to transform `null` into `''`, or `text().trim()` to transform whitespace-only strings into `''`.

- Why use both `null` and `undefined`?

  `null` is used to represent an empty field, while `undefined` is used to represent a missing field. JavaScript is a weird language with two different ways to represent the absence of a value, and we can use this to our advantage.

- Why? Just why?

  I needed a way to mirror client-side validation on a server application. Most JavaScript form validation libraries are designed to work with native JS objects, not `FormData`, so I made my own.

## License

This package is licensed under the MIT license.

The project logo was generated by AI and is in the public domain.
