<script lang="ts">
    import { computeCenterOfRecurrenceMass, computeConsecutiveFixationRatio, computeDeterminism, computeDeterminism2, computeDetLamDifference, computeDiagonalLineMetrics, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utils/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utils/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
    import type { Snippet } from "svelte";
    import RrqaPlotBarHorizon from "./RRQAPlotBarHorizon.svelte";
    import type { MatrixGenerator } from "../types/MatrixGenerator.ts";
    import RunningRQAPlotXAxis from "./RunningRQAPlotXAxis.svelte";
    import { fade } from "svelte/transition";
    import RRQAPlotHorizonLegend from "./RRQAPlotHorizonLegend.svelte";
    import { createColorGradient } from "../utils/colorUtils.ts";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    type SeriesHighlightType = "determinism" | "laminarity" | "determinism2" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2" | "recurrenceRate" | "cfr" | "avgDiagonalLength" | "corm"
  
    let { 
        fixationGroups, 
        width = 500, 
        height = "auto", 
        backgroundColor = "white", 
        colorPalette = ["#aacfe3", "#0170ad"],
        colorPalette2 = ["#ffcccb", "#ff0000"],
        showGrid = false, 
        tooltipSnippet = null, 
        seriesType = "determinism",
        series2Type = "corm",
        matrixGenerator = computeRecurrenceMatrix,
        horizonSlices = 3,
        lineColor = "black"
    } = $props<{
        fixationGroups: FixationGroup[];
        width?: number;
        height?: number | "auto";
        backgroundColor?: string;
        colorPalette?: string[];
        colorPalette2?: string[];
        showGrid?: boolean;
        seriesType?: SeriesHighlightType;
        series2Type?: SeriesHighlightType;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        matrixGenerator?: MatrixGenerator;
        horizonSlices?: number;
        lineColor?: string;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived.by(() => {
        return Math.max(...fixationGroups.map((group: FixationGroup) => group.fixations.length));
    });

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

    // Modify groupValues calculation
    let groupValues = $derived.by(() => {
        return fixationGroups.map((group: FixationGroup) => {
            const series = [];
            const series2 = [];
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = matrixGenerator(group.fixations.slice(0, i + 1));
                series.push(calculateValue(matrix, seriesType));
                series2.push(calculateValue(matrix, series2Type));
            }
                
            // Pad with null values if this group has fewer fixations
            while (series.length < maxFixations) {
                series.push(null);
            }
            
            return {
                label: group.label,
                series: series,
                series2: series2,
                fixations: group.fixations
            };
        });
    });

    // Dimensions
    const LABEL_WIDTH = 100;
    const labelWidth = $derived.by(() => LABEL_WIDTH);
    const RIGHT_LABEL_WIDTH = 50;
    const plotWidth = width - LABEL_WIDTH - RIGHT_LABEL_WIDTH;
    const BAR_HEIGHT = 50;
    const BAR_GAP = 4;
    const X_AXIS_EXTRA = 30;

    // Tooltip and highlight state
    let plotContainer: HTMLDivElement;
    let tooltipData: {
        x: number;
        y: number;
        value: number | null;
        label: string;
        fixationIndex: number;
    } | null = $state(null);

    let highlightIndex = $state<number | null>(null);
    let highlightRowIndex = $state<number | null>(null);

    // Mouse interaction handling
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
        const rowIndex = Math.floor(y / (BAR_HEIGHT + BAR_GAP));
        const postionX = index * segmentWidth + LABEL_WIDTH;
        const postionY = rowIndex * (BAR_HEIGHT + BAR_GAP);

        if (x >= 0 && index >= 0 && index < maxFixations && rowIndex >= 0 && rowIndex < groupValues.length) {
            highlightIndex = index;
            highlightRowIndex = rowIndex;
            const group = groupValues[rowIndex];
            tooltipData = {
                x: postionX + segmentWidth + 7,
                y: postionY,
                value: group.series[index],
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

    // Legend height calculation
    function calculateLegendHeight(barHeight: number): { legendHeight: number; legendConstant: number } {
        // Constants from RRQAPlotHorizonLegend
        const SMALL_BAR_HEIGHT = 20;
        const RANGE_EXAMPLES_Y = 100;
        const TEXT_OFFSET = 12;
        
        // Total height needed is the range examples position + bar height + text offset
        const legendConstant = RANGE_EXAMPLES_Y + SMALL_BAR_HEIGHT + TEXT_OFFSET;
        const legendHeight = barHeight + legendConstant;
        
        return { legendHeight, legendConstant };
    }

    // Compute dimensions
    function computeAutoDimensions() {
        const plotAreaHeight = (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP);
        const { legendHeight } = calculateLegendHeight(BAR_HEIGHT);
        const totalHeight = plotAreaHeight + legendHeight + X_AXIS_EXTRA;
        return { plotAreaHeight, legendHeight, totalHeight };
    }

    const dimensions = $derived.by(() => {
        if (height === "auto") {
            return computeAutoDimensions();
        }
        const { legendHeight } = calculateLegendHeight(BAR_HEIGHT);
        const plotAreaHeight = (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP);
        return {
            plotAreaHeight,
            legendHeight,
            totalHeight: typeof height === "number" ? height : plotAreaHeight + legendHeight + X_AXIS_EXTRA
        };
    });

    const plotAreaHeight = $derived.by(() => dimensions.plotAreaHeight);
    const legendHeight = $derived.by(() => dimensions.legendHeight);
    const totalHeight = $derived.by(() => dimensions.totalHeight);
    const horizonSlicesColors = $derived.by(() => createColorGradient(colorPalette[0], colorPalette[1], horizonSlices, 'rgb'));
    const horizonSlicesColors2 = $derived.by(() => createColorGradient(colorPalette2[0], colorPalette2[1], horizonSlices, 'rgb'));
</script>

<div class="plot-container" bind:this={plotContainer}>
    <svg 
        width={width} 
        height={totalHeight} 
        style="background: {backgroundColor};" 
        onmousemove={handleMouseMove} 
        onmouseleave={handleMouseLeave}
        aria-label="Running RQA Horizon Plot" 
        role="img"
    >
        {#key groupValues}
            {#each groupValues as group, index}
                <text 
                    x={labelWidth - 5}
                    y={index * (BAR_HEIGHT + BAR_GAP) + BAR_HEIGHT/2}
                    text-anchor="end"
                    dominant-baseline="middle"
                    font-size="12px"
                    fill="black"
                >{group.label}</text>
                
                <RrqaPlotBarHorizon 
                    series1={group.series}
                    series2={group.series2}
                    width={plotWidth} 
                    height={BAR_HEIGHT} 
                    backgroundColor={backgroundColor}
                    y={index * (BAR_HEIGHT + BAR_GAP)}
                    x={LABEL_WIDTH}
                    horizonSlicesColors={horizonSlicesColors}
                    horizonSlicesColors2={horizonSlicesColors2}
                />
            {/each}

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
                maxFixations={maxFixations} 
            />

            <RRQAPlotHorizonLegend 
                width={width} 
                y={plotAreaHeight + X_AXIS_EXTRA} 
                height={legendHeight} 
                barHeight={BAR_HEIGHT}
                lineColor={lineColor}
                colorPalette={colorPalette}
                horizonSlicesColors={horizonSlicesColors}
                horizonSlicesColors2={horizonSlicesColors2}
            />
        {/key}
    </svg>

    {#if tooltipData && tooltipData.value !== null}
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
                <strong>{tooltipData.label}</strong><br>
                Fixation: {tooltipData.fixationIndex}<br>
                Value: {tooltipData.value.toFixed(3)}
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