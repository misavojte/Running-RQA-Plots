<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children, title, level = 'h2' } = $props<{
    children: Snippet;
    title: string;
    level?: 'h1' | 'h2';
  }>();

  const headerClass = "text-2xl font-semibold text-gray-700/90 tracking-wider relative px-8 py-4 text-center w-full after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-2/3 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-blue-400/60 after:to-transparent after:opacity-70 after:transition-all after:duration-300";
</script>

<section class="rounded-xl border bg-white border-gray-200/80 p-4 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col gap-8 items-center justify-start">
    {#if level === 'h1'}
        <h1 class={headerClass}>{@html title}</h1>
    {:else}
        <h2 class={headerClass}>{@html title}</h2>
    {/if}
    <div class="w-full overflow-x-auto px-2 sm:px-4">
        <div class="min-w-fit mx-auto">
            {@render children()}
        </div>
    </div>
</section>