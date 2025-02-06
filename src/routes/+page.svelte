<script>

	import RecurrencePlot from "$lib/components/RecurrencePlot.svelte";

    const fixations = [
        { id: 1, timestamp: 100, aoi: ["AOI1"] },
        { id: 2, timestamp: 200, aoi: ["AOI2"] },
        { id: 3, timestamp: 300, aoi: ["AOI3"] },
        { id: 4, timestamp: 400, aoi: ["AOI4"] },
        { id: 5, timestamp: 500, aoi: ["AOI5"] },
        { id: 6, timestamp: 600, aoi: ["AOI6"] },
        { id: 7, timestamp: 700, aoi: ["AOI7"] },
        { id: 8, timestamp: 800, aoi: ["AOI8"] },
        { id: 9, timestamp: 900, aoi: ["AOI9"] },
        { id: 10, timestamp: 1000, aoi: ["AOI1"] },
    ];

</script>

<main class="p-8">
    <h1>Welcome to your library project</h1>
    <p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
    <p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

    <RecurrencePlot fixations={fixations} size={500} pointSize={4} highlightColor="blue" showGrid={true} />
</main>