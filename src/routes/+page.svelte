<script lang="ts">
	import FocusedRqaPlot from "$lib/components/FocusedRQAPlot.svelte";


	import RecurrencePlot from "$lib/components/RecurrencePlot.svelte";
	import RunningRqaPlot from "$lib/components/RunningRQAPlot.svelte";

    const fixations = [
        { id: 1, timestamp: 100, aoi: ["AOI1"] },
        { id: 2, timestamp: 200, aoi: ["AOI2"] },
        { id: 3, timestamp: 300, aoi: ["AOI3"] },
        { id: 4, timestamp: 400, aoi: ["AOI4"] },
        { id: 5, timestamp: 500, aoi: ["AOI5"] },
        { id: 6, timestamp: 600, aoi: ["AOI6"] },
        { id: 7, timestamp: 700, aoi: ["AOI1"] },
        { id: 8, timestamp: 800, aoi: ["AOI2"] },
        { id: 9, timestamp: 900, aoi: ["AOI3"] },
        { id: 10, timestamp: 1000, aoi: ["AOI1"] },
        { id: 11, timestamp: 1100, aoi: ["AOI1"] },
        { id: 12, timestamp: 1200, aoi: ["AOI1"] },
        { id: 13, timestamp: 1300, aoi: ["AOI2"] },
        { id: 14, timestamp: 1400, aoi: ["AOI3"] },
        { id: 15, timestamp: 1500, aoi: ["AOI4"] },
        { id: 16, timestamp: 1600, aoi: ["AOI5"] },
        { id: 17, timestamp: 1700, aoi: ["AOI6"] },
        { id: 18, timestamp: 1800, aoi: ["AOI1"] },
        { id: 19, timestamp: 1900, aoi: ["AOI1"] },
        { id: 20, timestamp: 2000, aoi: ["AOI2"] },
        { id: 21, timestamp: 2100, aoi: ["AOI3"] },
        { id: 22, timestamp: 2200, aoi: ["AOI4"] },
        { id: 23, timestamp: 2300, aoi: ["AOI5"] },
        { id: 24, timestamp: 2400, aoi: ["AOI6"] },
        { id: 25, timestamp: 2500, aoi: ["AOI1"] },
        { id: 26, timestamp: 2600, aoi: ["AOI2"] },
        { id: 27, timestamp: 2700, aoi: ["AOI3"] },
        { id: 28, timestamp: 2800, aoi: ["AOI4"] },
    ];

    const arrayOfRandomFixationSetsWithLabels = [
        {label: "Participant 1", fixations: fixations.slice(0, 14).sort(() => Math.random() - 0.5)},
        {label: "Participant 2", fixations: fixations.slice(0, 20).sort(() => Math.random() - 0.5)},
        {label: "Participant 3", fixations: fixations.slice(0, 10).sort(() => Math.random() - 0.5)},
        {label: "Participant 4", fixations: fixations.slice(0, 18).sort(() => Math.random() - 0.5)},
    ];

    let metric: "recurrenceRate" | "determinism" | "determinism2" | "laminarity" | "laminarity2" | "verticalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity" | "horizontalLaminarity2" = "recurrenceRate";
    
    let selectedParticipantIndex: number = 0;
    let selectedParticipantIndex2: number = 0;

    const aoiColors = [
        { aoi: "AOI1", color: "#FF0000" },  // red
        { aoi: "AOI2", color: "#0000FF" },  // blue
        { aoi: "AOI3", color: "#00FF00" },  // green
        { aoi: "AOI4", color: "#FFD700" },  // yellow
        { aoi: "AOI5", color: "#800080" },  // purple
        { aoi: "AOI6", color: "#FFA500" },  // orange
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
        <h2 class="text-lg font-bold">Recurrence Plot</h2>
        <select bind:value={selectedParticipantIndex} class="mb-4 bg-gray-200 p-1 rounded-md border-gray-300 border text-sm">
            {#each arrayOfRandomFixationSetsWithLabels as participant, index}
                <option value={index}>{participant.label}</option>
            {/each}
        </select>
        
        <RecurrencePlot 
            fixations={arrayOfRandomFixationSetsWithLabels[selectedParticipantIndex].fixations} 
            size={500} 
            pointSize={4} 
            highlightColor="#006FAD" 
            showGrid={true} 
            aoiColors={aoiColors} 
            tooltipSnippet={tooltipSnippet} 
        />
        <br>
        </div>
        <div class="flex flex-col items-center justify-center">
            <h2 class="text-lg font-bold">RRQA Ensemble Plot</h2>
            <select bind:value={metric} class="mb-4 bg-gray-200 p-1 rounded-md border-gray-300 border text-sm">
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

        <div class="flex flex-col items-center justify-center border-gray-300 my-4">
            <RunningRqaPlot metric={metric} fixationGroups={arrayOfRandomFixationSetsWithLabels} width={500} height={200} lineColor="#006FAD" showGrid={true} aoiColors={aoiColors} />
        </div>

        <div class="flex flex-col items-center justify-center border-gray-300 my-4">
            <h2 class="text-lg font-bold">RRQA Prism Plot</h2>
            <select bind:value={selectedParticipantIndex2} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                {#each arrayOfRandomFixationSetsWithLabels as participant, index}
                    <option value={index}>{participant.label}</option>
                {/each}
            </select>
            <FocusedRqaPlot
                fixationGroup={arrayOfRandomFixationSetsWithLabels[selectedParticipantIndex2]}
                width={500}
                height={400}
                lineColor="#006FAD"
                showGrid={true}
            aoiColors={aoiColors}
        />
    </div>
    <footer class="text-center text-sm text-gray-500 mt-8">
        <p>Created by <a href="https://vojtechovska.com" class="text-gray-500 hover:text-gray-700">Michael Vojtechovska</a> and <a href="https://muczka.com" class="text-gray-500 hover:text-gray-700">Marketa Muczka</a></p>
    </footer>
</main>