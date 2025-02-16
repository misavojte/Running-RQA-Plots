<script lang="ts">
	import DemoPlotFrame from "$lib/components/DemoPlotFrame.svelte";
	import FocusedRqaPlot from "$lib/components/FocusedRQAPlot.svelte";


	import RecurrencePlot from "$lib/components/RecurrencePlot.svelte";
	import RrqaPlotHorizon from "$lib/components/RRQAPlotHorizon.svelte";
	import RunningRqaPlot from "$lib/components/RunningRQAPlot.svelte";
	import RunningRqaPlotColor from "$lib/components/RunningRQAPlotColor.svelte";
	import type { MatrixGenerator } from "$lib/types/MatrixGenerator.js";

    import { assignRandomColorToAoi, getUniqueAois } from '$lib/utils/colorUtils.js';
	import { computeRecurrenceMatrix } from "$lib/utils/recurrenceMatrix.js";
	import { computeDeterminism } from "$lib/utils/recurrenceMetrics.js";

    import DemoUpload from "$lib/components/DemoUpload.svelte";

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

    let horizonSeries1 = $state("determinism");
    let horizonSeries2 = $state("corm");

    let horizonSeriesSetup = $derived.by(() => [
        {
            metric: horizonSeries1,
            label: horizonSeries1.charAt(0).toUpperCase() + horizonSeries1.slice(1),
            colorPalette: ["#aacfe3", "#0170ad"] as [string, string]
        },
        horizonSeries2 === "null" ? null : {
            metric: horizonSeries2,
            label: horizonSeries2.charAt(0).toUpperCase() + horizonSeries2.slice(1),
            colorPalette: ["#ffcccb", "#ff0000"] as [string, string]
        }
    ]);

    let series2Setup = $derived.by(() => ({
        metric: series2Type,
        label: series2Type.charAt(0).toUpperCase() + series2Type.slice(1),
    }));

    let series3Setup = $derived.by(() => ({
        metric: series3Type,
        label: series3Type.charAt(0).toUpperCase() + series3Type.slice(1),
    }));

</script>

{#snippet tooltipSnippet(aoiLabel: string, fixationLabel: string)}


    <div class="bg-white p-2 rounded-md border-gray-300 border text-sm w-32">
        <p>{aoiLabel}</p>
        <p>{fixationLabel}</p>
    </div>
{/snippet}

<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
    <main class="p-8 max-w-screen-xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DemoPlotFrame title="RRQA visualizations for eye-tracking" level="h1">
                    <div class="flex flex-col items-center justify-center max-w-lg mx-auto gap-4">
                        <p class="text-gray-700 leading-relaxed">
                            <span class="font-medium">Recurrence</span>—the reappearance of similar states—offers deep insights into complex system dynamics.
                        </p>
                        <p class="text-gray-700 leading-relaxed">
                            <span class="font-medium">Recurrence Quantification Analysis (RQA)</span> extracts quantitative metrics from recurrence plots, revealing hidden patterns in eye-tracking data.
                        </p>
                        <p class="text-gray-700 leading-relaxed">
                            Our innovation, <span class="font-medium">Running RQA (RRQA)</span>, displays these metrics as continuous, evolving plots, enabling intuitive, direct comparisons of gaze behavior over time.
                        </p>
                    </div> 
                    <DemoUpload bind:fixationGroups={arrayOfRandomFixationSetsWithLabels} />
                </DemoPlotFrame>
                <DemoPlotFrame title="Recurrence Plot">
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
                </DemoPlotFrame>

                <DemoPlotFrame title="RRQA Worm Plot (Participants)">
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
                </DemoPlotFrame>

                <DemoPlotFrame title="RRQA Worm Plot (Single)">
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
                </DemoPlotFrame>
                <DemoPlotFrame title="RRQA Fence Plot">
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
                    <!-- <select bind:value={plotMode} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                        <option value="rises">Rises</option>
                        <option value="normalized">Normalized</option>
                    </select> -->
                </div>
                    <RunningRqaPlotColor fixationGroups={arrayOfRandomFixationSetsWithLabels} width={500} lineColor="#006FAD" showGrid={true} showRisingPoints={false} aoiColors={aoiColors} series2Type={series2Setup.metric} series3Type={series3Setup.metric} label2={series2Setup.label} label3={series3Setup.label} showColorFilling={true} plotMode={plotMode} matrixGenerator={matrixGenerator} />
                    
                </DemoPlotFrame>

                <DemoPlotFrame title="RRQA Horizon Plot">
                    <div class="flex flex-row items-center justify-center gap-4">
                        <select bind:value={horizonSeries1} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                            <option value="recurrenceRate">Recurrence Rate</option>
                            <option value="determinism">Determinism</option>
                            <option value="laminarity">Laminarity</option>
                            <option value="verticalLaminarity">Vertical Laminarity</option>
                            <option value="horizontalLaminarity">Horizontal Laminarity</option>
                            <option value="determinism2">Determinism2</option>
                            <option value="laminarity2">Laminarity2</option>
                            <option value="verticalLaminarity2">Vertical Laminarity2</option>
                            <option value="horizontalLaminarity2">Horizontal Laminarity2</option>
                            <option value="cfr">Consecutive Fixation Ratio</option>
                            <option value="corm">Center of Recurrence Mass</option>
                        </select>
                        <select bind:value={horizonSeries2} class="bg-gray-200 p-1 rounded-md border-gray-300 border mb-4 text-sm">
                            <option value=null>No second series</option>
                            <option value="recurrenceRate">Recurrence Rate</option>
                            <option value="determinism">Determinism</option>
                            <option value="laminarity">Laminarity</option>
                            <option value="verticalLaminarity">Vertical Laminarity</option>
                            <option value="horizontalLaminarity">Horizontal Laminarity</option>
                            <option value="determinism2">Determinism2</option>
                            <option value="laminarity2">Laminarity2</option>
                            <option value="verticalLaminarity2">Vertical Laminarity2</option>
                            <option value="horizontalLaminarity2">Horizontal Laminarity2</option>
                            <option value="cfr">Consecutive Fixation Ratio</option>
                            <option value="corm">Center of Recurrence Mass</option>
                        </select>
                    </div>
                <RrqaPlotHorizon 
                    fixationGroups={arrayOfRandomFixationSetsWithLabels} 
                    width={500} 
                    backgroundColor="transparent" 
                    horizonSlices={3}
                    seriesType={horizonSeriesSetup[0]}
                    series2Type={horizonSeriesSetup[1]}
                />
                </DemoPlotFrame>
            </div>
    </main>

    <footer class="text-center text-sm text-gray-500 mt-8 max-w-screen-xl mx-auto px-8 pb-8">
        <div class="py-8">
            <p>Created by 
                <a href="https://vojtechovska.com" class="text-gray-600 hover:text-blue-600 transition-colors duration-200">Michaela Vojtechovska</a> 
                and 
                <a href="https://muczkova.com" class="text-gray-600 hover:text-blue-600 transition-colors duration-200">Marketa Muczkova</a>
                in 2025 at Palacký University, Olomouc, Czechia (EU)
            </p>
            <p>
                Soon to be implemented into 
                <a href="https://gazeplotter.com" class="text-gray-600 hover:text-blue-600 transition-colors duration-200">GazePlotter</a>
            </p>
        </div>
    </footer>
</div>