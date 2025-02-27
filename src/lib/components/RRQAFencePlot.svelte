<script lang="ts">
    import { computeCenterOfRecurrenceMass, computeConsecutiveFixationRatio, computeDeterminism, computeDeterminism2, computeDetLamDifference, computeDiagonalLineMetrics, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utils/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utils/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
	import RRQAFencePlotBar from "./RRQAFencePlotBarDiscrete.svelte";
	import type { MatrixGenerator } from "../types/MatrixGenerator.js";
	import RunningRQAPlotXAxis from "./GenericPlotXAxis.svelte";
	import RRQAFencePlotBarGradient from "./RRQAFencePlotBarGradient.svelte";
	import { fade } from "svelte/transition";
    import RRQAFencePlotLegend from "./RRQAFencePlotLegend.svelte";
    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    type SeriesHighlightType = "determinism" | "laminarity" | "determinism2" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2" | "recurrenceRate" | "cfr" | "avgDiagonalLength" | "corm"
  
    let { fixationGroups, width = 500, height = "auto", backgroundColor = "white", tooltipSnippet = null, aoiColors = [], series2Type = "determinism2", series3Type = "laminarity2", showColorFilling = false, plotMode = "rises", matrixGenerator = computeRecurrenceMatrix, label2, label3, minRecurrenceStructureLength = 2 } = $props<{
        fixationGroups: FixationGroup[];
        width?: number;
        height?: number | "auto";
        backgroundColor?: string;
        series2Type?: SeriesHighlightType;
        series3Type?: SeriesHighlightType;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
        showColorFilling?: boolean;
        plotMode?: "rises" | "normalized";
        matrixGenerator?: MatrixGenerator;
        label2?: string;
        label3?: string;
        minRecurrenceStructureLength?: number;
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
                return computeDeterminism(matrix, minRecurrenceStructureLength);
            case "determinism2":
                return computeDeterminism2(matrix, minRecurrenceStructureLength);
            case "laminarity":
                return computeLaminarity(matrix, minRecurrenceStructureLength);
            case "laminarity2":
                return computeLaminarity2(matrix, minRecurrenceStructureLength);
            case "horizontalLaminarity":
                return computeHorizontalLaminarity(matrix, minRecurrenceStructureLength);
            case "horizontalLaminarity2":
                return computeHorizontalLaminarity2(matrix, minRecurrenceStructureLength);
            case "verticalLaminarity":
                return computeVerticalLaminarity(matrix, minRecurrenceStructureLength);
            case "verticalLaminarity2":
                return computeVerticalLaminarity2(matrix, minRecurrenceStructureLength);
            case "cfr":
                return computeConsecutiveFixationRatio(matrix);
            case "avgDiagonalLength":
                return computeDiagonalLineMetrics(matrix, minRecurrenceStructureLength).averageLength;
            case "corm":
                return computeCenterOfRecurrenceMass(matrix);
            default:
                return 0;
        }
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

    function formatValue(value: number | null): string {
        return value ? value.toFixed(3) : "0";
    }

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
        const rowIndex = Math.floor(y / (BAR_HEIGHT + BAR_GAP));

        if (x >= 0 && index >= 0 && index < maxFixations && rowIndex >= 0 && rowIndex < groupValues.length) {
            highlightIndex = index;
            highlightRowIndex = rowIndex;
            const group = groupValues[rowIndex];
            tooltipData = {
                x: event.clientX,
                y: event.clientY,
                value1: group.series1[index],
                value2: group.series2original[index],
                value3: group.series3original[index],
                label: group.label,
                fixationIndex: index + 1
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
        const LEGEND_MARGIN = 80;
        
        const maxLabelLength = Math.max(...aoiColors.map(item => item.aoi.length), 0);
        const estimatedItemWidth = BASE_ITEM_WIDTH + (maxLabelLength * CHAR_WIDTH);
        const ITEM_WIDTH = Math.min(estimatedItemWidth, 150);
        
        const AOI_LEGEND_MAX_WIDTH = width - 20;
        const ITEMS_PER_ROW = Math.max(Math.floor(AOI_LEGEND_MAX_WIDTH / ITEM_WIDTH), 1);
        const numRows = aoiColors.length > 0 ? Math.ceil(aoiColors.length / ITEMS_PER_ROW) : 0;
        
        const legendFixedOffset = 75;
        const AOI_LEGEND_LINE_HEIGHT = 25;
        
        const legendConstant = (numRows * AOI_LEGEND_LINE_HEIGHT) + legendFixedOffset + LEGEND_MARGIN;
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
</script>

<!-- Wrap everything in a single SVG so the bars and x-axis share the same coordinate system -->
<div class="plot-container" bind:this={plotContainer}>
    <svg width={width} height={totalHeight} style="background: {backgroundColor};" 
        onmousemove={handleMouseMove} 
        onmouseleave={handleMouseLeave} 
        aria-label="Running RQA Plot" 
        role="img"
    >
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
                <RRQAFencePlotBar 
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
                <RRQAFencePlotBarGradient
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
            <RRQAFencePlotLegend 
                width={width} 
                y={plotAreaHeight + X_AXIS_EXTRA} 
                height={legendHeight}
                barHeight={BAR_HEIGHT} 
                aoiColors={aoiColors} 
                label2={label2}
                label3={label3}
            />
        {/key}
    </svg>
</div>

{#if tooltipData && tooltipData.value1 !== null}
    <div style="position: absolute; top: 0; left: 0; pointer-events: none;">
        <div 
            class="tooltip"
            style="
                transform: translate3d({tooltipData.x + 15}px, {tooltipData.y + 15}px, 0)
            "
            transition:fade
        >
            {#if tooltipSnippet}
                {@render tooltipSnippet(tooltipData)}
            {:else}
                <strong>{tooltipData.label}</strong><br>
                Fixation: {tooltipData.fixationIndex}<br>
                AOI: {highlightRowIndex !== null ? groupValues[highlightRowIndex].fixations[tooltipData.fixationIndex - 1]?.aoi?.[0] || 'None' : 'None'}<br>
                Recurrence Rate: {formatValue(tooltipData.value1)}<br>
                {label2}: {formatValue(tooltipData.value2)}<br>
                {label3}: {formatValue(tooltipData.value3)}
            {/if}
        </div>
    </div>
{/if}

<style>
    .plot-container {
        position: relative;
    }

    .tooltip {
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        padding: 4px 8px;
        border-radius: 4px;
        pointer-events: none;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        font-size: 12px;
        width: 150px;
    }
</style> 