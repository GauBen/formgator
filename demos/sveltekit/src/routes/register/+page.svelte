<script lang="ts">
  import { enhance } from "$app/forms";
  import { reportValidity } from "formgator/sveltekit";

  const { form } = $props();
</script>

{#if form?.success}
  <p>
    {form.message}
  </p>
{/if}

<form method="post" use:enhance={reportValidity}>
  <p>
    <label>
      Email:
      <input type="email" name="email" required />
    </label>
  </p>
  <p>
    <label>
      Password:
      <input type="password" name="password" required />
    </label>
  </p>
  <p>
    <button>Register</button>
  </p>
</form>
