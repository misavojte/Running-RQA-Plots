<script lang="ts">
    import { computeCenterOfRecurrenceMass, computeConsecutiveFixationRatio, computeDeterminism, computeDeterminism2, computeDetLamDifference, computeDiagonalLineMetrics, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
	import RunningRQAPlotBarColor from "./RunningRQAPlotBarColor.svelte";
	import type { MatrixGenerator } from "../types/MatrixGenerator.ts";
	import RunningRQAPlotXAxis from "./RunningRQAPlotXAxis.svelte";
    import RunningRqaPlotLegend from "./RunningRQAPlotLegend.svelte";
	import RunningRqaPlotBarColorGradient from "./RunningRQAPlotBarColorGradient.svelte";
	import { fade } from "svelte/transition";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    type SeriesHighlightType = "determinism" | "laminarity" | "determinism2" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2" | "recurrenceRate" | "cfr" | "avgDiagonalLength" | "corm"
  
    let { fixationGroups, width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, showRisingPoints = false, aoiColors = [], series2Type = "determinism2", series3Type = "laminarity2", showColorFilling = false, plotMode = "rises", matrixGenerator = computeRecurrenceMatrix } = $props<{
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
        plotMode?: "rises" | "normalized";
        matrixGenerator?: MatrixGenerator;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived.by(() => {
        return Math.max(...fixationGroups.map((group: FixationGroup) => group.fixations.length));
    });

    const calculateTrendValue = (currentValue: number, previousValue: number, mode: "rises") => {
        if (previousValue === null || currentValue === null || previousValue === undefined || currentValue === undefined ||currentValue === 0) return 0;
        return currentValue > previousValue ? 1 : 0;
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
            case "avgDiagonalLength":
                return computeDiagonalLineMetrics(matrix).averageLength;
            case "corm":
                return computeCenterOfRecurrenceMass(matrix);
            default:
                return 0;
        }
    }

    const normalizeValues = (values: number[]) => {
        const maxValue = Math.max(...values.filter(v => v !== null));
        return values.map(v => v !== null ? (v / maxValue) * 100 : null);
    }

    // Modify groupValues calculation
    let groupValues = $derived.by(() => {

        return fixationGroups.map((group: FixationGroup) => {
            const matrices = [];
            const series1 = [];
            const series2 = [];
            const series3 = [];
            let series2original: number[] = [];
            let series3original: number[] = [];
            

            let previousSeries2 = 0;
            let previousSeries3 = 0;
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = matrixGenerator(group.fixations.slice(0, i + 1));
                matrices.push(matrix);
                const currentSeries2 = calculateValue(matrix, series2Type);
                const currentSeries3 = calculateValue(matrix, series3Type);
                series1.push(computeRecurrenceRate(matrix));
                if (plotMode === "normalized") {
                    series2.push(currentSeries2);
                    series3.push(currentSeries3);
                } else {
                    series2.push(calculateTrendValue(currentSeries2, previousSeries2, plotMode));
                    series3.push(calculateTrendValue(currentSeries3, previousSeries3, plotMode));
                }
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
    const BAR_HEIGHT = 50; // each group's bar height
    const BAR_GAP = 4; // gap between rows
    const X_AXIS_EXTRA = 30;

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

    // Add legend height calculation functions
    function calculateLegendHeight(
        width: number,
        aoiColors: Array<{ aoi: string; color: string }>,
        barHeight: number
    ): { legendHeight: number; legendConstant: number } {
        const BASE_ITEM_WIDTH = 25;
        const CHAR_WIDTH = 7;
        
        const maxLabelLength = Math.max(...aoiColors.map(item => item.aoi.length), 0);
        const estimatedItemWidth = BASE_ITEM_WIDTH + (maxLabelLength * CHAR_WIDTH);
        const ITEM_WIDTH = Math.min(estimatedItemWidth, 150);
        
        const AOI_LEGEND_MAX_WIDTH = width - 20;
        const ITEMS_PER_ROW = Math.max(Math.floor(AOI_LEGEND_MAX_WIDTH / ITEM_WIDTH), 1);
        const numRows = aoiColors.length > 0 ? Math.ceil(aoiColors.length / ITEMS_PER_ROW) : 0;
        
        const legendFixedOffset = 75;
        const AOI_LEGEND_LINE_HEIGHT = 25;
        
        const legendConstant = (numRows * AOI_LEGEND_LINE_HEIGHT) + legendFixedOffset;
        const legendHeight = barHeight + legendConstant;
        
        return { legendHeight, legendConstant };
    }

    // Compute dimensions
    function computeAutoDimensions() {
        const plotAreaHeight = (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP);
        const { legendHeight } = calculateLegendHeight(width, aoiColors, BAR_HEIGHT);
        const totalHeight = plotAreaHeight + legendHeight + X_AXIS_EXTRA;
        return { plotAreaHeight, legendHeight, totalHeight };
    }

    // Update height calculations
    const dimensions = $derived.by(() => {
        if (height === "auto") {
            return computeAutoDimensions();
        }
        // If height is fixed, adjust legend accordingly
        const { legendHeight } = calculateLegendHeight(width, aoiColors, BAR_HEIGHT);
        const plotAreaHeight = (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP);
        return {
            plotAreaHeight,
            legendHeight,
            totalHeight: typeof height === "number" ? height : plotAreaHeight + legendHeight + X_AXIS_EXTRA
        };
    });

    // Update derived values
    const plotAreaHeight = $derived.by(() => dimensions.plotAreaHeight);
    const legendHeight = $derived.by(() => dimensions.legendHeight);
    const totalHeight = $derived.by(() => dimensions.totalHeight);

    $effect(() => {
        // Create structured data objects for both series
        const series2Data = {
            metricType: series2Type,
            participants: groupValues.map((group: any) => ({
                participant: group.label,
                values: group.series2original
            }))
        };

        const series3Data = {
            metricType: series3Type,
            participants: groupValues.map((group: any) => ({
                participant: group.label,
                values: group.series3original
            }))
        };
    });
</script>

<!-- Wrap everything in a single SVG so the bars and x-axis share the same coordinate system -->
<div class="plot-container" bind:this={plotContainer}>
    <svg width={width} height={totalHeight} style="background: {backgroundColor};" onmousemove={handleMouseMove} onmouseleave={handleMouseLeave} aria-label="Running RQA Plot" role="img">
        {#key groupValues}
            <!-- Add participant labels -->
            {#each groupValues as group, index}
                <text 
                    x={labelWidth - 5}
                    y={index * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT/2}
                    text-anchor="end"
                    dominant-baseline="middle"
                    font-size="12px"
                    fill="black"
                >{group.label}</text>
                {#if plotMode === "rises" || plotMode === "risesAndSteady"}
                <RunningRQAPlotBarColor 
                    series1={group.series1} 
                    series2={group.series2} 
                    series3={group.series3}
                    width={plotWidth} 
                    height={BAR_HEIGHT} 
                    backgroundColor={backgroundColor} 
                    y={index * (BAR_HEIGHT + BAR_GAP)}
                    x={LABEL_WIDTH}
                    hideDoubleIncrease={false}
                    colorFilling={
                        showColorFilling ? group.fixations.map((f: { aoi?: string[] }) => {
                            const aoiMapping = aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === f.aoi?.[0]);
                            return aoiMapping?.color ?? 'gray';
                        }) : null
                    }
                />
                {:else if plotMode === "normalized"}
                <RunningRqaPlotBarColorGradient 
                    series1={group.series1} 
                    series2={group.series2} 
                    series3={group.series3} 
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
                {/if}
            {/each}

            <!-- Existing highlight rects -->
            {#if highlightIndex !== null && highlightRowIndex !== null}
                <rect
                    class="highlight-rect transition-all"
                    x={labelWidth + highlightIndex * (plotWidth / maxFixations)}
                    y="0"
                    width={plotWidth / maxFixations}
                    height={plotAreaHeight}
                    fill="rgba(0, 0, 0, 0.1)"
                    pointer-events="none"
                    transition:fade
                />

                <rect
                    class="highlight-rect-row transition-all"
                    x={labelWidth + highlightIndex * (plotWidth / maxFixations)}
                    y={highlightRowIndex * (BAR_HEIGHT + BAR_GAP)}
                    width={plotWidth / maxFixations}
                    height={BAR_HEIGHT}
                    fill="rgba(0, 0, 0, 0.1)"
                    pointer-events="none"
                    transition:fade
                />
            {/if}
            
            <RunningRQAPlotXAxis
                width={plotWidth} 
                height={plotAreaHeight} 
                labelWidth={LABEL_WIDTH} 
                maxFixations={maxFixations} />

            <!-- Add legend -->
            <RunningRqaPlotLegend 
                width={width} 
                y={plotAreaHeight + X_AXIS_EXTRA} 
                height={legendHeight} 
                lineColor={lineColor} 
                barHeight={BAR_HEIGHT} 
                aoiColors={aoiColors} 
            />
        {/key}
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
            transition:fade
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