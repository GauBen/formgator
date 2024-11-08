<script lang="ts">
  import { enhance } from "$app/forms";
  import { tags } from "$lib";

  export let data;

  data satisfies {
    page: number;
    search: string | undefined;
  };
</script>

<form method="post" enctype="multipart/form-data" use:enhance>
  <h1>Create a new post</h1>
  <p>
    <label>
      Title
      <input type="text" name="title" required maxlength="255" />
    </label>
  </p>
  <p>
    <label>
      Publication date
      <input type="datetime-local" name="date" required />
    </label>
  </p>
  <p>
    <label>
      Tags
      <select multiple name="tags" required>
        {#each tags as tag}
          <option>{tag}</option>
        {/each}
      </select>
    </label>
  </p>
  <p style="display: grid; grid-template-columns: 1fr 1fr; align-items: center">
    <label>
      Banner image
      <input type="file" name="banner" accept="image/*" />
    </label>
    <label>
      <input type="checkbox" name="newsletter" checked />
      Send to newsletter subscribers
    </label>
  </p>
  <p>
    <textarea name="content" rows="15" required placeholder="Once upon a time..."></textarea>
  </p>
  <p style="text-align: center">
    <button type="submit">Publish!</button>
  </p>
</form>

<style>
  form {
    max-width: 40rem;
    margin-inline: auto;
  }

  [type="text"],
  [type="datetime-local"],
  [type="file"],
  textarea,
  select {
    display: block;
    width: 100%;
  }

  select {
    writing-mode: sideways-lr;
    overflow: hidden;
    font: inherit;
    line-height: 1.5;
    field-sizing: content;
    padding: 0.5em 0;

    option {
      line-height: 1.5;
      writing-mode: horizontal-tb;
      padding: 0.5em;
    }
  }

  :user-invalid {
    box-shadow: 0 0 0.5rem #f004;
  }
</style>
