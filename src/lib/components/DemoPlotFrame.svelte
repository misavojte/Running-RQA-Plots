<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, title } = $props<{
    children: Snippet;
    title: string;
  }>();
</script>

<section class="rounded-xl border my-10 border-gray-300 p-4 shadow-xl flex flex-col gap-4 items-center justify-center">
    <h2 class="text-lg font-bold text-center">{title}</h2>
    {@render children()}
</section>