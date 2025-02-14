<script lang="ts">
	import FocusedRqaPlot from "$lib/components/FocusedRQAPlot.svelte";


	import RecurrencePlot from "$lib/components/RecurrencePlot.svelte";
	import RunningRqaPlot from "$lib/components/RunningRQAPlot.svelte";

    import { assignRandomColorToAoi, getUniqueAois } from '$lib/utility/colorUtils.js';
    import { handleFileUpload } from '$lib/utility/csvUtils.js';


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

    let arrayOfRandomFixationSetsWithLabels = $state([
        {label: "Participant 1", fixations: fixations.slice(0, 14).sort(() => Math.random() - 0.5)},
        {label: "Participant 2", fixations: fixations.slice(0, 20).sort(() => Math.random() - 0.5)},
        {label: "Participant 3", fixations: fixations.slice(0, 10).sort(() => Math.random() - 0.5)},
        {label: "Participant 4", fixations: fixations.slice(0, 18).sort(() => Math.random() - 0.5)},
    ]);
    let fileInput: HTMLInputElement;
    let aoiColors = $state(assignRandomColorToAoi(getUniqueAois(arrayOfRandomFixationSetsWithLabels)));
    

    const handleFiles = async () => {
        if (!fileInput.files?.length) return;
        
        try {
            const newFixationGroups = await handleFileUpload(fileInput.files);
            arrayOfRandomFixationSetsWithLabels = newFixationGroups;
            aoiColors = assignRandomColorToAoi(getUniqueAois(newFixationGroups));
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files. Please check the console for details.');
        }
    };

    let metric: "recurrenceRate" | "determinism" | "determinism2" | "laminarity" | "laminarity2" | "verticalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity" | "horizontalLaminarity2" = $state("recurrenceRate");
    
    let selectedParticipantIndex: number = $state(0);
</script>

{#snippet tooltipSnippet(aoiLabel: string, fixationLabel: string)}


    <div class="bg-white p-2 rounded-md border-gray-300 border text-sm w-32">
        <p>{aoiLabel}</p>
        <p>{fixationLabel}</p>
    </div>
{/snippet}

<main class="p-8 max-w-screen-md mx-auto">
    <section class="mb-10">
    <h1 class="text-3xl max-w-lg mx-auto font-bold text-center mb-4">Running RQA visualizations<br>for eye-tracking research</h1>
    <div class="flex flex-col items-center justify-center max-w-lg mx-auto gap-2">
        <p>Recurrence—the reappearance of similar states—offers deep insights into complex system dynamics.</p>
        <p>Recurrence Quantification Analysis (RQA) extracts quantitative metrics from recurrence plots, revealing hidden patterns in eye-tracking data.</p>
        <p>Our innovation, Running RQA (RRQA), displays these metrics as continuous, evolving plots, enabling intuitive, direct comparisons of gaze behavior over time.</p>
      </div>      
    <div class="flex flex-col items-center justify-center">
            <div class="my-4 rounded border-gray-300 border p-4 max-w-lg">
                <label class="block mb-2 text-sm font-medium text-gray-900">
                    Upload CSV files (one per participant)
                    <input
                        bind:this={fileInput}
                        type="file"
                        accept=".csv"
                        multiple
                        onchange={handleFiles}
                        class="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-gray-200 file:text-gray-700
                            hover:file:bg-gray-300
                            cursor-pointer mt-2"
                    />
                </label>
                <p class="mt-1 text-sm text-gray-500">
                    CSV format: columns for timestamp, and aoi (multiple AOIs can be separated by semicolons)
                </p>
            </div>
        </div>
    </section>

    <section class="mb-10">
        <h2 class="text-lg font-bold text-center">Recurrence Plot</h2>
        <div class="flex flex-col items-center justify-center">
            {#if arrayOfRandomFixationSetsWithLabels.length > 0}
                <select bind:value={selectedParticipantIndex} class="mb-4 bg-gray-200 p-1 rounded-md border-gray-300 border text-sm">
                    {#each arrayOfRandomFixationSetsWithLabels as participant, index}
                        <option value={index}>{participant.label}</option>
                    {/each}
                </select>
                
                <RecurrencePlot 
                    fixations={arrayOfRandomFixationSetsWithLabels[selectedParticipantIndex]?.fixations ?? []} 
                    height={500} 
                    width={500}
                    pointSize={4} 
                    highlightColor="#006FAD" 
                    showGrid={true} 
                    aoiColors={aoiColors} 
                    tooltipSnippet={tooltipSnippet} 
                />
            {/if}
        </div>
    </section>

    <section class="mb-10">
        <h2 class="text-lg font-bold text-center">RRQA Ensemble Plot</h2>
        <div class="flex flex-col items-center justify-center">
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
                <option value="detLamDifference">Determinism - Laminarity</option>
            </select>

            <div class="flex flex-col items-center justify-center border-gray-300 my-4">
                {#if arrayOfRandomFixationSetsWithLabels.length > 0}
                    <RunningRqaPlot 
                        metric={metric} 
                        fixationGroups={arrayOfRandomFixationSetsWithLabels} 
                        width={500} 
                        lineColor="#006FAD" 
                        showGrid={true}
                        showRisingPoints={false}
                        aoiColors={aoiColors} 
                    />
                {/if}
            </div>
        </div>
    </section>

    <section class="mb-10">
        <h2 class="text-lg font-bold text-center">RRQA Prism Plot</h2>
        <div class="flex flex-col items-center justify-center">
            {#if arrayOfRandomFixationSetsWithLabels.length > 0}
                <select bind:value={selectedParticipantIndex} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                    {#each arrayOfRandomFixationSetsWithLabels as participant, index}
                        <option value={index}>{participant.label}</option>
                    {/each}
                </select>
                <FocusedRqaPlot
                    fixationGroup={arrayOfRandomFixationSetsWithLabels[selectedParticipantIndex]}
                    width={500}
                    lineColor="#006FAD"
                    showGrid={true}
                    aoiColors={aoiColors}
                />
            {/if}
        </div>
    </section>

    <footer class="text-center text-sm text-gray-500 mt-8">
        <p>Created by <a href="https://vojtechovska.com" class="text-gray-500 hover:text-gray-700">Michaela Vojtechovska</a> and <a href="https://muczkova.com" class="text-gray-500 hover:text-gray-700">Marketa Muczkova</a></p>
    </footer>

</main>