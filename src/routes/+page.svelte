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
        { id: 12, timestamp: 1200, aoi: ["AOI1"] },
        { id: 13, timestamp: 1300, aoi: ["AOI2"] },
        { id: 14, timestamp: 1400, aoi: ["AOI3"] },
        { id: 15, timestamp: 1500, aoi: ["AOI7"] },
        { id: 16, timestamp: 1600, aoi: ["AOI8"] },
        { id: 17, timestamp: 1700, aoi: ["AOI9"] },
        { id: 18, timestamp: 1800, aoi: ["AOI1"] },
        { id: 19, timestamp: 1900, aoi: ["AOI1"] },
        { id: 20, timestamp: 2000, aoi: ["AOI12"] },
        { id: 21, timestamp: 2100, aoi: ["AOI13"] },
        { id: 22, timestamp: 2200, aoi: ["AOI14"] },
        { id: 23, timestamp: 2300, aoi: ["AOI15"] },
        { id: 24, timestamp: 2400, aoi: ["AOI16"] },
        { id: 25, timestamp: 2500, aoi: ["AOI17"] },
        { id: 26, timestamp: 2600, aoi: ["AOI18"] },
        { id: 27, timestamp: 2700, aoi: ["AOI19"] },
        { id: 28, timestamp: 2800, aoi: ["AOI20"] },
    ];

    const arrayOfRandomFixationSetsWithLabels = [
        {label: "Participant 1", fixations: fixations.slice(0, 14).sort(() => Math.random() - 0.5)},
        {label: "Participant 2", fixations: fixations.slice(0, 20).sort(() => Math.random() - 0.5)},
        {label: "Participant 3", fixations: fixations.slice(0, 10).sort(() => Math.random() - 0.5)},
        {label: "Participant 4", fixations: fixations.slice(0, 18).sort(() => Math.random() - 0.5)},
    ];

    let metric: "recurrenceRate" | "determinism" | "determinism2" | "laminarity" | "laminarity2" | "verticalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity" | "horizontalLaminarity2" = $state("recurrenceRate");
    
    let selectedParticipantIndex: number = $state(0);

    const aoiColors = [
        { aoi: "AOI1", color: "#FF0000" },  // red
        { aoi: "AOI2", color: "#0000FF" },  // blue
        { aoi: "AOI3", color: "#00FF00" },  // green
        { aoi: "AOI4", color: "#FFD700" },  // yellow
        { aoi: "AOI5", color: "#800080" },  // purple
        { aoi: "AOI6", color: "#FFA500" },  // orange
        { aoi: "AOI7", color: "#FFC0CB" },  // pink
        { aoi: "AOI8", color: "#808080" },  // gray
        { aoi: "AOI9", color: "#A52A2A" },  // brown
        { aoi: "AOI10", color: "#000000" }, // black
        { aoi: "AOI11", color: "#FFFFFF" }, // white
        { aoi: "AOI12", color: "#696969" }, // dim gray
        { aoi: "AOI13", color: "#8B4513" }, // saddle brown
        { aoi: "AOI14", color: "#2F4F4F" }, // dark slate gray
        { aoi: "AOI15", color: "#F5F5F5" }, // white smoke
        { aoi: "AOI16", color: "#A9A9A9" }, // dark gray
        { aoi: "AOI17", color: "#D2691E" }, // chocolate
        { aoi: "AOI18", color: "#1A1A1A" }, // very dark gray
        { aoi: "AOI19", color: "#DCDCDC" }, // gainsboro
        { aoi: "AOI20", color: "#B8B8B8" }  // medium gray
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
        <select bind:value={selectedParticipantIndex} class="mb-4 bg-gray-200 p-2 rounded-md border-gray-300 border">
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
            <RunningRqaPlot metric={metric} fixationGroups={arrayOfRandomFixationSetsWithLabels} width={500} height={200} lineColor="#006FAD" showGrid={true} />
        </div>

        <div class="flex flex-col items-center justify-center border-gray-300 my-4">
            <RunningRqaPlot metric={metric} fixationGroups={arrayOfRandomFixationSetsWithLabels} width={500} height={200} lineColor="#006FAD" showGrid={true} displayType="bars" />
        </div>
    </div>
    <footer class="text-center text-sm text-gray-500 mt-8">
        <p>Created by <a href="https://vojtechovska.com" class="text-gray-500 hover:text-gray-700">Michael Vojtechovska</a> and <a href="https://muczka.com" class="text-gray-500 hover:text-gray-700">Marketa Muczka</a></p>
    </footer>
</main>