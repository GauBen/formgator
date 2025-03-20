<div align="center">
	<img src="https://raw.githubusercontent.com/GauBen/formgator/refs/heads/main/formgator.jpg" alt="Ali, the friendly alligator that guards your forms" width="200" height="200">
</div>

# Formgator

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
- `url()` has `asURL()` to return a `URL` object.

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

  You can provide a value to `optional` to replace `undefined` with a default value.

The schema produced by `fg.form()` has two methods:

- `.parse()` that returns the parsed form data or throws an error if the form data is invalid.
- `.safeParse()` that returns an object with this shape: `{ success: true, data: Output } | { success: false, error: Error }`.

## Complete API

<details><summary><code>interface FormInput</code></summary>

Base interface for all form inputs.

```ts
interface FormInput<T = unknown> {
    /** Attributes given when creating the validator. */
    attributes: Record<string, string | string[] | number | boolean | RegExp | undefined>;
    /**
     * Transforms the output of the validator into another value.
     *
     * @example
     *   text().transform((value) => value.length);
     *
     * @param fn - The transformation function.
     * @param catcher - In case the transformation function throws, this function
     *   is called to generate an error message.
     */
    transform<U>(fn: (value: T) => U, catcher?: (error: unknown) => string): FormInput<U>;
    /** Adds a custom validation to the input. */
    refine<U extends T>(fn: (value: T) => value is U, message?: string | ((value: T) => string)): FormInput<U>;
    refine(fn: (value: T) => unknown, message?: string | ((value: T) => string)): FormInput<T>;
    /**
     * Makes the field optional, for inputs that may be removed or added
     * dynamically to the form.
     *
     * It returns `undefined` instead of `null` to differentiate between a missing
     * field (`undefined`) and a field with an empty value (`null`).
     *
     * You may provide a default value to be used when the field is missing.
     */
    optional(): FormInput<T | undefined>;
    optional<U>(value: U): FormInput<T | U>;
    /**
     * Transforms the value using a [Standard Schema](https://github.com/standard-schema/standard-schema)
     * compliant validator.
     *
     * Async validators are not supported.
     *
     * @example
     *   import z from 'zod';
     *   fg.text().pipe(z.string().email());
     */
    pipe<U>(schema: StandardSchemaV1<T, U>): FormInput<U>;
    /** @private @internal */
    [safeParse]: (data: ReadonlyFormData, name: string) => Result<T, ValidationIssue>;
}
```

</details>

<details><summary><code>class FormgatorError</code></summary>

An error thrown when using `form.parse()`. It has two fields: `issues` and `accepted`,
containing the issues and accepted values respectively.

Type-safety cannot be guaranteed when using exceptions. If you want type-safety, use
`form.safeParse()`.

</details>

<details><summary><code>type Issues</code></summary>

Transforms an object of form inputs into the issues object.

```ts
type Issues<T extends Record<string, FormInput> = Record<string, FormInput<unknown>>> = {
    [K in keyof T]?: ValidationIssue;
} extends infer O ? {
    [K in keyof O]: O[K];
} : never;
```

</details>

<details><summary><code>type Output</code></summary>

Transforms an object of form inputs into the success object.

```ts
type Output<T extends Record<string, FormInput> = Record<string, FormInput<unknown>>> = {
    [K in keyof T]: T[K] extends FormInput<infer U> ? U : never;
} extends infer O ? {
    [K in keyof O]: O[K];
} : never;
```

</details>

<details><summary><code>type ValidationIssue</code></summary>

All possible validation issues that can be returned by a form input.

```ts
type ValidationIssue = {
    code: "accept";
    message: string;
} | {
    code: "custom";
    message: string;
} | {
    code: "invalid";
    message: string;
} | {
    code: "max";
    max: number | string;
    message: string;
} | {
    code: "maxlength";
    maxlength: number;
    message: string;
} | {
    code: "min";
    min: number | string;
    message: string;
} | {
    code: "minlength";
    minlength: number;
    message: string;
} | {
    code: "pattern";
    pattern: RegExp;
    message: string;
} | {
    code: "refine";
    received: unknown;
    message: string;
} | {
    code: "required";
    message: string;
} | {
    code: "step";
    step: number;
    message: string;
} | {
    code: "transform";
    message: string;
} | {
    code: "type";
    message: string;
};
```

</details>

<details><summary><code>function checkbox()</code></summary>

`<input type="checkbox">` form input validator.

Supported attributes:

- `required` - Whether the input is required.

The `value` attribute is not supported, use `select({ multiple: true })`
instead if you want to handle several checkboxes with the same name but
different values.

</details>

<details><summary><code>function color()</code></summary>

`<input type="color">` form input validator.

It does not support any attributes.

The output value is a string with the format `#rrggbb`.

</details>

<details><summary><code>function custom()</code></summary>

A custom validator, transformer, whatever, for you to implement if formgator falls short on
features.

Returning a value will be considered a success, while throwing an error will be considered a
validation issue. The error message will be used as the issue message.

</details>

<details><summary><code>function date()</code></summary>

`<input type="date">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `min` - Minimum date.
- `max` - Maximum date.

The output value is a string with the format `yyyy-mm-dd`.

</details>

<details><summary><code>function datetimeLocal()</code></summary>

`<input type="datetime-local">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `min` - Minimum date.
- `max` - Maximum date.

The output value is a string with the format `yyyy-mm-ddThh:mm`.

</details>

<details><summary><code>function email()</code></summary>

`<input type="email">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.
- `pattern` - Regular expression pattern to match by each email address.
- `multiple` - Whether the input allows multiple comma-separated email
  addresses.

</details>

<details><summary><code>function file()</code></summary>

`<input type="file">` form input validator.

Supported attributes:

- `multiple` - Whether the input allows multiple files.
- `required` - Whether the input is required.
- `accept` - The accepted file types, as an array of MIME types (`image/png`),
  MIME wildcards (`image/*`), or file extensions (`.png`).

</details>

<details><summary><code>function form()</code></summary>

Creates a form validator from a record of form inputs.

The return schema has two methods: `parse` and `safeParse`:
- `parse(data: FormData)` returns the data object if valid, throws a `FormgatorError` otherwise.
- `safeParse(data: FormData)` returns an object with `success` a success boolean flag, and
  either `data` or `error` containing the parsed data or the issues respectively.

</details>

<details><summary><code>function hidden()</code></summary>

`<input type="hidden">` form input validator.

Not very useful, but included for completeness.

</details>

<details><summary><code>function image()</code></summary>

`<input type="image">` form input validator.

</details>

<details><summary><code>function month()</code></summary>

`<input type="month">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `min` - Minimum date.
- `max` - Maximum date.

The output value is a string with the format `yyyy-mm`.

</details>

<details><summary><code>function multi()</code></summary>

Validator for multiple inputs with the same name.

Supported attributes:

- `min` - Minimum number of values, defaults to 0.
- `max` - Maximum number of values, defaults to `Infinity`.

</details>

<details><summary><code>function number()</code></summary>

`<input type="number">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `min` - Minimum value.
- `max` - Maximum value.

</details>

<details><summary><code>function password()</code></summary>

`<input type="text">` form input validator.

Does not accept new lines, use `textarea()` instead.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.
- `pattern` - Regular expression pattern to match.

</details>

<details><summary><code>function radio()</code></summary>

`<input type="radio">` form input validator.

Supported attributes:

- `required` - Whether the input is required.

</details>

<details><summary><code>function range()</code></summary>

`<input type="range">` form input validator.

Supported attributes:

- `min` - Minimum value, defaults to `0`.
- `max` - Maximum value, defaults to `100`.
- `step` - Step value, defaults to `1`.

</details>

<details><summary><code>function search()</code></summary>

`<input type="text">` form input validator.

Does not accept new lines, use `textarea()` instead.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.
- `pattern` - Regular expression pattern to match.

</details>

<details><summary><code>function select()</code></summary>

`<select>` form input validator.

Supported attributes:

- `multiple` - Whether the input allows multiple selections.
- `required` - Whether the input is required.

</details>

<details><summary><code>function splat()</code></summary>

Allows you to splat attributes into Svelte HTML template.

This feature is considered experimental and may be removed in the future.

</details>

<details><summary><code>function tel()</code></summary>

`<input type="text">` form input validator.

Does not accept new lines, use `textarea()` instead.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.
- `pattern` - Regular expression pattern to match.

</details>

<details><summary><code>function text()</code></summary>

`<input type="text">` form input validator.

Does not accept new lines, use `textarea()` instead.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.
- `pattern` - Regular expression pattern to match.

</details>

<details><summary><code>function textarea()</code></summary>

`<textarea>` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.

</details>

<details><summary><code>function time()</code></summary>

`<input type="time">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `min` - Minimum date.
- `max` - Maximum date.

The output value is a string with the format `yyyy-mm-dd`.

</details>

<details><summary><code>function url()</code></summary>

`<input type="url">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `maxlength` - Maximum length of the input.
- `minlength` - Minimum length of the input.
- `pattern` - Regular expression pattern to match.

</details>

<details><summary><code>function week()</code></summary>

`<input type="week">` form input validator.

Supported attributes:

- `required` - Whether the input is required.
- `min` - Minimum date.
- `max` - Maximum date.

The output value is a string with the format `yyyy-Www` (e.g. `1999-W01`).

</details>

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

Formgator can be used in SvelteKit to validate form data and query parameters. Because formgator imports `@sveltejs/kit` internally, you need to bundle it with your application to avoid weird runtime behaviors:

- Move `formgator` from `dependencies` to `devDependencies` in your `package.json`.
- Add `ssr: { noExternal: ['formgator'] }` to the root of `vite.config.{js|ts}`.

This will ensure that formgator use the bundled version of `@sveltejs/kit` instead of an external one. This also means that formgator will be tree-shaken in your production build, and no longer imported from `node_modules` at runtime.

### Form actions

Formgator exposes a SvelteKit adapter that can be used to validate form data in SvelteKit [form actions](https://kit.svelte.dev/docs/form-actions).

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

### Page load

As formgator works on `URLSearchParams` objects and can run client-side, you can use it to validate query parameters in your SvelteKit page components.

```ts
// +page.ts
import * as fg from 'formgator';
import { loadgate } from 'formgator/sveltekit';

export const load = loadgate(
  {
    page: fg.number({ min: 1, required: true }).optional(1),
    search: fg.search().trim().optional(),
  },
  (data, event) => {
    // data has the shape { page: number, search: string | undefined }
    // event is the object that would be your first argument without formgator
    // The page will load as 400 Bad Request if the query parameters are invalid
  }
);
```

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
