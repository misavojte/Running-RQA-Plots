<script lang="ts">
	import DemoPlotFrame from "$lib/components/DemoPlotFrame.svelte";
	import FocusedRqaPlot from "$lib/components/FocusedRQAPlot.svelte";


	import RecurrencePlot from "$lib/components/RecurrencePlot.svelte";
	import RrqaPlotBarHorizon from "$lib/components/RRQAPlotBarHorizon.svelte";
	import RrqaPlotHorizon from "$lib/components/RRQAPlotHorizon.svelte";
	import RunningRqaPlot from "$lib/components/RunningRQAPlot.svelte";
	import RunningRqaPlotColor from "$lib/components/RunningRQAPlotColor.svelte";
	import type { MatrixGenerator } from "$lib/types/MatrixGenerator.js";

    import { assignRandomColorToAoi, getUniqueAois } from '$lib/utility/colorUtils.js';
    import { handleFileUpload } from '$lib/utility/csvUtils.js';
	import { computeEuclideanRecurrenceMatrix, computeRecurrenceMatrix } from "$lib/utility/recurrenceMatrix.js";
	import { computeDeterminism } from "$lib/utility/recurrenceMetrics.js";


    const fixations = [
        { id: 1, timestamp: 100, aoi: ["AOI1"], x: 100, y: 100},
        { id: 2, timestamp: 200, aoi: ["AOI2"], x: 200, y: 150},
        { id: 3, timestamp: 300, aoi: ["AOI3"], x: 300, y: 200},
        { id: 4, timestamp: 400, aoi: ["AOI4"], x: 200, y: 180},
        { id: 5, timestamp: 500, aoi: ["AOI5"], x: 250, y: 220},
        { id: 6, timestamp: 600, aoi: ["AOI6"], x: 280, y: 240},
        { id: 7, timestamp: 700, aoi: ["AOI1"], x: 110, y: 110},
        { id: 8, timestamp: 800, aoi: ["AOI2"], x: 190, y: 160},
        { id: 9, timestamp: 900, aoi: ["AOI3"], x: 310, y: 190},
        { id: 10, timestamp: 1000, aoi: ["AOI1"], x: 105, y: 105},
        { id: 11, timestamp: 1100, aoi: ["AOI1"], x: 95, y: 95},
        { id: 12, timestamp: 1200, aoi: ["AOI1"], x: 100, y: 102},
        { id: 13, timestamp: 1300, aoi: ["AOI2"], x: 205, y: 155},
        { id: 14, timestamp: 1400, aoi: ["AOI3"], x: 295, y: 205},
        { id: 15, timestamp: 1500, aoi: ["AOI4"], x: 195, y: 175},
        { id: 16, timestamp: 1600, aoi: ["AOI5"], x: 255, y: 225},
        { id: 17, timestamp: 1700, aoi: ["AOI6"], x: 285, y: 235},
        { id: 18, timestamp: 1800, aoi: ["AOI1"], x: 98, y: 98},
        { id: 19, timestamp: 1900, aoi: ["AOI1"], x: 102, y: 103},
        { id: 20, timestamp: 2000, aoi: ["AOI2"], x: 195, y: 152},
        { id: 21, timestamp: 2100, aoi: ["AOI3"], x: 305, y: 195},
        { id: 22, timestamp: 2200, aoi: ["AOI4"], x: 198, y: 178},
        { id: 23, timestamp: 2300, aoi: ["AOI5"], x: 252, y: 222},
        { id: 24, timestamp: 2400, aoi: ["AOI6"], x: 282, y: 238},
        { id: 25, timestamp: 2500, aoi: ["AOI1"], x: 97, y: 99},
        { id: 26, timestamp: 2600, aoi: ["AOI2"], x: 192, y: 153},
        { id: 27, timestamp: 2700, aoi: ["AOI3"], x: 298, y: 198},
        { id: 28, timestamp: 2800, aoi: ["AOI4"], x: 197, y: 182},
    ];

    let arrayOfRandomFixationSetsWithLabels = $state([
        {label: "Participant 1", fixations: fixations.slice(0, 14).sort(() => Math.random() - 0.5)},
        {label: "Participant 2", fixations: fixations.slice(0, 20).sort(() => Math.random() - 0.5)},
        {label: "Participant 3", fixations: fixations.slice(0, 10).sort(() => Math.random() - 0.5)},
        {label: "Participant 4", fixations: fixations.slice(0, 18).sort(() => Math.random() - 0.5)},
    ]);
    let fileInput: HTMLInputElement;
    let aoiColors = $derived.by(() => assignRandomColorToAoi(getUniqueAois(arrayOfRandomFixationSetsWithLabels)));
    let matrixGenerator: MatrixGenerator = $state(computeRecurrenceMatrix);

    const handleFiles = async () => {
        if (!fileInput.files?.length) return;
        
        try {
            const newFixationGroups = await handleFileUpload(fileInput.files);
            arrayOfRandomFixationSetsWithLabels = newFixationGroups;
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files. Please check the console for details.');
        }
    };

    let metric: "recurrenceRate" | "determinism" | "determinism2" | "laminarity" | "laminarity2" | "verticalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity" | "horizontalLaminarity2" | "avgDiagonalLength" | "corm" = $state("recurrenceRate");
    let series2Type: "determinism" | "laminarity" | "determinism2" | "laminarity2" | "verticalLaminarity" | "horizontalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity2" | "cfr" | "avgDiagonalLength" = $state("determinism");
    let series3Type: "determinism" | "laminarity" | "determinism2" | "laminarity2" | "verticalLaminarity" | "horizontalLaminarity" | "verticalLaminarity2" | "horizontalLaminarity2" | "cfr" | "avgDiagonalLength" = $state("laminarity");
    let selectedParticipantIndex: number = $state(0);
    let plotMode: "rises" | "normalized" = $state("rises");

    let calculateSeriesOfDeterminismForEachParticipant = $derived.by(() => {
        return arrayOfRandomFixationSetsWithLabels.map((group) => {
            return group.fixations.map((fixation, i) => {
                const matrix = matrixGenerator(group.fixations.slice(0, i + 1));
                return computeDeterminism(matrix);
            });
        });
    });

    $effect(() => {
        console.log(calculateSeriesOfDeterminismForEachParticipant);
    });


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
    <select bind:value={matrixGenerator} class="mb-4 bg-gray-200 p-1 rounded-md border-gray-300 border text-sm">
        <option value={computeRecurrenceMatrix}>AOI-based Recurrence</option>
        <option value={computeEuclideanRecurrenceMatrix}>Euclidean-based Recurrence</option>
    </select>
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
                    CSV format: columns for timestamp, and aoi (multiple AOIs can be separated by semicolons). Optional columns for x and y coordinates.
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
                    matrixGenerator={matrixGenerator}
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
                <option value="corm">Center of Recurrence Mass</option>
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
                        matrixGenerator={matrixGenerator}
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
                    matrixGenerator={matrixGenerator}
                />
            {/if}
        </div>
    </section>

        <DemoPlotFrame title="RRQA Prism Plot">
            <div class="flex flex-row items-center justify-center gap-4">
            <select bind:value={series2Type} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                <option value="determinism">Determinism</option>
                <option value="laminarity">Laminarity</option>
                <option value="verticalLaminarity">Vertical Laminarity</option>
                <option value="horizontalLaminarity">Horizontal Laminarity</option>
                <option value="determinism2">Determinism2</option>
                <option value="laminarity2">Laminarity2</option>
                <option value="verticalLaminarity2">Vertical Laminarity2</option>
                <option value="horizontalLaminarity2">Horizontal Laminarity2</option>
                <option value="cfr">Consecutive Fixation Ratio</option>
                <option value="avgDiagonalLength">Average Diagonal Length</option>
                <option value="corm">Center of Recurrence Mass</option>
            </select>
            <select bind:value={series3Type} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                <option value="determinism">Determinism</option>
                <option value="laminarity">Laminarity</option>
                <option value="verticalLaminarity">Vertical Laminarity</option>
                <option value="horizontalLaminarity">Horizontal Laminarity</option>
                <option value="determinism2">Determinism2</option>
                <option value="laminarity2">Laminarity2</option>
                <option value="verticalLaminarity2">Vertical Laminarity2</option>
                <option value="horizontalLaminarity2">Horizontal Laminarity2</option>
                <option value="cfr">Consecutive Fixation Ratio</option>
                <option value="avgDiagonalLength">Average Diagonal Length</option>
                <option value="corm">Center of Recurrence Mass</option>
            </select>
            <select bind:value={plotMode} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                <option value="rises">Rises</option>
                <option value="normalized">Normalized</option>
            </select>
        </div>
            <RunningRqaPlotColor fixationGroups={arrayOfRandomFixationSetsWithLabels} width={500} lineColor="#006FAD" showGrid={true} showRisingPoints={false} aoiColors={aoiColors} series2Type={series2Type} series3Type={series3Type} showColorFilling={true} plotMode={plotMode} matrixGenerator={matrixGenerator} />
            
        </DemoPlotFrame>
        <br>
        <RrqaPlotHorizon fixationGroups={arrayOfRandomFixationSetsWithLabels} width={500} backgroundColor="transparent" colorPalette="#006FAD" aoiColors={aoiColors} horizonSlices={5} seriesType={series2Type} />

    <footer class="text-center text-sm text-gray-500 mt-8">
        <p>Created by <a href="https://vojtechovska.com" class="text-gray-500 hover:text-gray-700">Michaela Vojtechovska</a> and <a href="https://muczkova.com" class="text-gray-500 hover:text-gray-700">Marketa Muczkova</a></p>
    </footer>

</main>