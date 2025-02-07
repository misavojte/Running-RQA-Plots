<script lang="ts">

	import RecurrencePlot from "$lib/components/RecurrencePlot.svelte";
	import RunningRqaPlot from "$lib/components/RunningRQAPlot.svelte";

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
        { id: 11, timestamp: 1100, aoi: ["AOI1"] },
        { id: 1, timestamp: 100, aoi: ["AOI1"] },
        { id: 2, timestamp: 200, aoi: ["AOI2"] },
        { id: 3, timestamp: 300, aoi: ["AOI3"] },
        { id: 7, timestamp: 700, aoi: ["AOI7"] },
        { id: 8, timestamp: 800, aoi: ["AOI8"] },
        { id: 9, timestamp: 900, aoi: ["AOI9"] },
        { id: 10, timestamp: 1000, aoi: ["AOI1"] },
        { id: 11, timestamp: 1100, aoi: ["AOI1"] },
        { id: 12, timestamp: 1200, aoi: ["AOI12"] },
        { id: 13, timestamp: 1300, aoi: ["AOI13"] },
        { id: 14, timestamp: 1400, aoi: ["AOI14"] },
        { id: 15, timestamp: 1500, aoi: ["AOI15"] },
        { id: 16, timestamp: 1600, aoi: ["AOI16"] },
        { id: 17, timestamp: 1700, aoi: ["AOI17"] },
        { id: 18, timestamp: 1800, aoi: ["AOI18"] },
        { id: 19, timestamp: 1900, aoi: ["AOI19"] },
        { id: 20, timestamp: 2000, aoi: ["AOI20"] },
    ];

    const fixationsShorter = fixations.slice(0, 14).sort(() => Math.random() - 0.5);
    const fixationsBigger = fixations.slice(0, 20).sort(() => Math.random() - 0.5);

    let metric: "recurrenceRate" | "determinism" | "determinism2" | "laminarity" | "laminarity2" | "verticalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity" | "horizontalLaminarity2" = $state("recurrenceRate");

    const aoiColors = [
        { aoi: "AOI1", color: "red" },
        { aoi: "AOI2", color: "blue" },
        { aoi: "AOI3", color: "green" },
        { aoi: "AOI4", color: "yellow" },
        { aoi: "AOI5", color: "purple" },
        { aoi: "AOI6", color: "orange" },
        { aoi: "AOI7", color: "pink" },
        { aoi: "AOI8", color: "gray" },
        { aoi: "AOI9", color: "brown" },
        { aoi: "AOI10", color: "black" },
        { aoi: "AOI11", color: "white" },
        { aoi: "AOI12", color: "gray" },
        { aoi: "AOI13", color: "brown" },
        { aoi: "AOI14", color: "black" },
        { aoi: "AOI15", color: "white" },
        { aoi: "AOI16", color: "gray" },
        { aoi: "AOI17", color: "brown" },
        { aoi: "AOI18", color: "black" },
        { aoi: "AOI19", color: "white" },
        { aoi: "AOI20", color: "gray" },
    ];

</script>

{#snippet tooltipSnippet(aoiLabel: string, fixationLabel: string)}
    <div class="bg-white p-2 rounded-md border-gray-300 border text-sm w-32">
        <p>{aoiLabel}</p>
        <p>{fixationLabel}</p>
    </div>
{/snippet}

<main class="p-8 max-w-screen-md mx-auto">
    <h1 class="text-2xl font-bold">Running RQA visualizations for eye-tracking research</h1>
    <p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
    <p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
    <br>
    <div class="flex flex-col items-center justify-center">
        <RecurrencePlot fixations={fixationsBigger} size={500} pointSize={4} highlightColor="#006FAD" showGrid={true} aoiColors={aoiColors} tooltipSnippet={tooltipSnippet} />
        <br>
        </div>
        <div class="flex flex-col items-center justify-center">
    <select bind:value={metric} class="bg-gray-200 p-2 rounded-md border-gray-300 border">
        <option value="recurrenceRate">Recurrence Rate</option>
        <option value="determinism">Determinism</option>
        <option value="determinism2">Determinism2</option>
        <option value="laminarity">Laminarity</option>
        <option value="laminarity2">Laminarity2</option>
        <option value="verticalLaminarity">Vertical Laminarity</option>
        <option value="verticalLaminarity2">Vertical Laminarity2</option>
        <option value="horizontalLaminarity">Horizontal Laminarity</option>
        <option value="horizontalLaminarity2">Horizontal Laminarity2</option>
        </select>

        <div class="flex flex-col items-center justify-center border-gray-300">
            <RunningRqaPlot metric={metric} fixationGroups={[
                {label: "14 fixations", fixations: fixationsShorter},
                {label: "Bigger fixations", fixations: fixationsBigger},
            ]} width={500} height={70} lineColor="#006FAD" showGrid={true} />
        </div>

        <div class="flex flex-col items-center justify-center border-gray-300 my-4">
            <RunningRqaPlot metric={metric} fixationGroups={[
                {label: "14 fixations", fixations: fixationsShorter},
                {label: "Bigger fixations", fixations: fixationsBigger},
            ]} width={500} height={70} lineColor="#006FAD" showGrid={true} displayType="bars" />
        </div>
    </div>
</main>