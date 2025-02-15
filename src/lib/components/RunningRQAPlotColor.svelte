<script lang="ts">
    import { computeConsecutiveFixationRatio, computeDeterminism, computeDeterminism2, computeDetLamDifference, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
	import RunningRqaPlotBarColor from "./RunningRQAPlotBarColor.svelte";
	import RunningRqaPlotXAxis from "./RunningRqaPlotXAxis.svelte";
	import type { MatrixGenerator } from "../types/MatrixGenerator.ts";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    type SeriesHighlightType = "determinism" | "laminarity" | "determinism2" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2" | "recurrenceRate" | "cfr"
  
    let { fixationGroups, width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, showRisingPoints = false, aoiColors = [], series2Type = "determinism2", series3Type = "laminarity2", showColorFilling = false, matrixGenerator = computeRecurrenceMatrix } = $props<{
        fixationGroups: FixationGroup[];
        width?: number;
        height?: number | "auto";
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        showRisingPoints?: boolean;
        series2Type?: SeriesHighlightType;
        series3Type?: SeriesHighlightType;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
        showColorFilling?: boolean;
        matrixGenerator?: MatrixGenerator;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived.by(() => {
        return Math.max(...fixationGroups.map((group: FixationGroup) => group.fixations.length));
    });

    const calculateTrendValue = (currentValue: number, previousValue: number) => {
        if (previousValue === null || currentValue === null || currentValue <= previousValue) return 0;
        return 1;
    }

    const calculateValue = (matrix: number[][], type: SeriesHighlightType) => {
        switch (type) {
            case "determinism":
                return computeDeterminism(matrix);
            case "determinism2":
                return computeDeterminism2(matrix);
            case "laminarity":
                return computeLaminarity(matrix);
            case "laminarity2":
                return computeLaminarity2(matrix);
            case "horizontalLaminarity":
                return computeHorizontalLaminarity(matrix);
            case "horizontalLaminarity2":
                return computeHorizontalLaminarity2(matrix);
            case "verticalLaminarity":
                return computeVerticalLaminarity(matrix);
            case "verticalLaminarity2":
                return computeVerticalLaminarity2(matrix);
            case "cfr":
                return computeConsecutiveFixationRatio(matrix);
            default:
                return 0;
        }
    }

    // Modify groupValues to pad shorter sequences with null values
    let groupValues = $derived.by(() => {
        return fixationGroups.map((group: FixationGroup) => {
            const matrices = [];
            const series1 = [];
            const series2 = [];
            const series3 = [];
            const series2original = [];
            const series3original = [];
            

            let previousSeries2 = 0;
            let previousSeries3 = 0;
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = matrixGenerator(group.fixations.slice(0, i + 1));
                matrices.push(matrix);
                const currentSeries2 = calculateValue(matrix, series2Type);
                const currentSeries3 = calculateValue(matrix, series3Type);
                series1.push(computeRecurrenceRate(matrix));
                series2.push(calculateTrendValue(currentSeries2, previousSeries2));
                series3.push(calculateTrendValue(currentSeries3, previousSeries3));
                series2original.push(currentSeries2);
                series3original.push(currentSeries3);
                previousSeries2 = currentSeries2;
                previousSeries3 = currentSeries3;
            }
                
            // Pad with null values if this group has fewer fixations
            while (series1.length < maxFixations) {
                series1.push(null);
                series2.push(null);
                series3.push(null);
            }
            
            return {
                label: group.label,
                series1: series1,
                series2: series2,
                series2original: series2original,
                series3: series3,
                series3original: series3original,
                fixations: group.fixations
            };
        });
    });

    // --- NEW: compute proper plot dimensions (inspired by BaseRQAPlot.svelte) ---
    const LABEL_WIDTH = 100;
    const labelWidth = $derived.by(() => LABEL_WIDTH);
    const RIGHT_LABEL_WIDTH = 50;
    const plotWidth = width - LABEL_WIDTH - RIGHT_LABEL_WIDTH;
    const BAR_HEIGHT = 100; // each group's bar height
    const BAR_GAP = 4; // gap between rows
    const plotAreaHeight = $derived(() => (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP));
    // Extra space for the x-axis texts (as in BaseRQAPlot.svelte, the x-axis texts use y={height + 16})
    const X_AXIS_EXTRA = 30;
    // Overall SVG height
    const svgHeight = $derived(() => plotAreaHeight() + X_AXIS_EXTRA);

    // --- TOOLTIP STATE & HANDLERS ---
    let plotContainer: HTMLDivElement;
    let tooltipData: {
        x: number;
        y: number;
        value1: number | null;
        value2: number | null;
        value3: number | null;
        label: string;
        fixationIndex: number;
    } | null = $state(null);

    let highlightIndex = $state<number | null>(null);
    let highlightRowIndex = $state<number | null>(null);

    // Add throttle state
    let lastMouseMoveTime = $state(0);
    const FRAME_TIME = 1000 / 40;
    let segmentWidth = $derived.by(() => plotWidth / maxFixations);

    function handleMouseMove(event: MouseEvent) {
        const currentTime = performance.now();
        if (currentTime - lastMouseMoveTime < FRAME_TIME) {
            return;
        }
        lastMouseMoveTime = currentTime;

        const svg = event.currentTarget as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        const x = event.clientX - rect.left - LABEL_WIDTH;
        const y = event.clientY - rect.top;
        const index = Math.floor(x / segmentWidth);
        const rowIndex = Math.floor(y / BAR_HEIGHT);
        const postionX = index * segmentWidth + LABEL_WIDTH;
        const postionY = rowIndex * (BAR_HEIGHT + BAR_GAP);

        if (x >= 0 && index >= 0 && index < maxFixations && rowIndex >= 0 && rowIndex < groupValues.length) {
            highlightIndex = index;
			highlightRowIndex = rowIndex;
            const group = groupValues[rowIndex];
            tooltipData = {
                x: postionX + segmentWidth + 7,
                y: postionY,
                value1: group.series1[index],
                value2: group.series2original[index],
                value3: group.series3original[index],
                label: group.label,
                fixationIndex: index + 1  // Adding 1 to make it 1-based instead of 0-based
            };
        } else {
            handleMouseLeave();
        }
    }

    function handleMouseLeave() {
        tooltipData = null;
        highlightIndex = null;
        highlightRowIndex = null;
    }
</script>

<!-- Wrap everything in a single SVG so the bars and x-axis share the same coordinate system -->
<div class="plot-container" bind:this={plotContainer}>
    <svg width={width} height={svgHeight()} style="background: {backgroundColor};" onmousemove={handleMouseMove} onmouseleave={handleMouseLeave} aria-label="Running RQA Plot" role="img">
        {#key groupValues}
            {#each groupValues as group, index}
                <RunningRqaPlotBarColor 
                    series1={group.series1} 
                    series2={group.series2} 
                    series3={group.series3} 
                    hideDoubleIncrease={false} 
                    width={plotWidth} 
                    height={BAR_HEIGHT} 
                    backgroundColor={backgroundColor} 
                    y={index * (BAR_HEIGHT + BAR_GAP)}
                    x={LABEL_WIDTH}
                    colorFilling={
                        showColorFilling ? group.fixations.map((f: { aoi?: string[] }) => {
                            const aoiMapping = aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === f.aoi?.[0]);
                            return aoiMapping?.color ?? 'gray';
                        }) : null
                    }
                />
            {/each}
        {/key}
        
        <!-- Moved the highlight rects here to overlay on top of the bars -->
        {#if highlightIndex !== null && highlightRowIndex !== null}
            <rect
                class="highlight-rect transition-all"
                x={labelWidth + highlightIndex * (plotWidth / maxFixations)}
                y="0"
                width={plotWidth / maxFixations}
                height={plotAreaHeight()}
                fill="rgba(0, 0, 0, 0.1)"
                pointer-events="none" />

            <rect
                class="highlight-rect-row transition-all"
                x={labelWidth + highlightIndex * (plotWidth / maxFixations)}
                y={highlightRowIndex * (BAR_HEIGHT + BAR_GAP)}
                width={plotWidth / maxFixations}
                height={BAR_HEIGHT}
                fill="rgba(0, 0, 0, 0.1)"
                pointer-events="none" />
        {/if}
        
        <RunningRqaPlotXAxis 
            width={plotWidth} 
            height={plotAreaHeight()} 
            labelWidth={LABEL_WIDTH} 
            maxFixations={maxFixations} />
    </svg>

    <!-- Default tooltip snippet (you can override via the tooltipSnippet prop) -->
    {#snippet tooltipSnippetDefault(tooltipData: { x: number; y: number; value1: number | null; value2: number | null; value3: number | null; label: string; fixationIndex: number })}
        <strong>{tooltipData.label}</strong><br>
        Fixation: {tooltipData.fixationIndex}<br>
        Value: {tooltipData.value1 ? tooltipData.value1.toFixed(3) : "0"}<br>
        Value 2: {tooltipData.value2 ? tooltipData.value2.toFixed(3) : "0"}<br>
        Value 3: {tooltipData.value3 ? tooltipData.value3.toFixed(3) : "0"}
    {/snippet}

    {#if tooltipData && tooltipData.value1 !== null}
        <div
            class="tooltip transition-all"
            style="
                left: {tooltipData.x}px;
                top: {tooltipData.y}px;
            "
        >
            {#if tooltipSnippet}
                {@render tooltipSnippet(tooltipData)}
            {:else}
                {@render tooltipSnippetDefault(tooltipData)}
            {/if}
        </div>
    {/if}
</div>

<style>
    .plot-container {
        position: relative;
    }

    .tooltip {
        position: absolute;
        background: white;
        border: 1px solid #ccc;
        padding: 4px 8px;
        border-radius: 4px;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        font-size: 12px;
        width: 100px;
    }
</style> 