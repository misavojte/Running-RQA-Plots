<script lang="ts">
    import { computeCenterOfRecurrenceMass, computeConsecutiveFixationRatio, computeDeterminism, computeDeterminism2, computeDetLamDifference, computeDiagonalLineMetrics, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utils/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utils/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
    import type { Snippet } from "svelte";
    import RrqaPlotBarHorizon from "./RRQAHorizonPlotBar.svelte";
    import type { MatrixGenerator } from "../types/MatrixGenerator.js";
    import RunningRQAPlotXAxis from "./GenericPlotXAxis.svelte";
    import { fade } from "svelte/transition";
    import RRQAPlotHorizonLegend from "./RRQAHorizonPlotLegend.svelte";
    import { createColorGradient } from "../utils/colorUtils.js";
    import type { HorizonPlotSeriesSetup, HorizonPlotBarVector } from "../types/PlotMetric.js";

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
        showGrid = false, 
        tooltipSnippet = null, 
        seriesType = {metric: "determinism", label: "Determinism", colorPalette: ["#aacfe3", "#0170ad"]},
        series2Type = {metric: "corm", label: "Center of Recurrence Mass", colorPalette: ["#ffcccb", "#ff0000"]},
        matrixGenerator = computeRecurrenceMatrix,
        horizonSlices = 3,
        lineColor = "black",
        minRecurrenceStructureLength = 2
    } = $props<{
        fixationGroups: FixationGroup[];
        width?: number;
        height?: number | "auto";
        backgroundColor?: string;
        colorPalette?: string[];
        colorPalette2?: string[];
        showGrid?: boolean;
        seriesType?: HorizonPlotSeriesSetup;
        series2Type?: HorizonPlotSeriesSetup | null;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        matrixGenerator?: MatrixGenerator;
        horizonSlices?: number;
        lineColor?: string;
        minRecurrenceStructureLength?: number;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived.by(() => {
        return Math.max(...fixationGroups.map((group: FixationGroup) => group.fixations.length));
    });

    const calculateValue = (matrix: number[][], type: SeriesHighlightType) => {
        switch (type) {
            case "recurrenceRate":
                return computeRecurrenceRate(matrix);
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
            const series = [];
            const series2 = [];
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = matrixGenerator(group.fixations.slice(0, i + 1));
                series.push(calculateValue(matrix, seriesType.metric));
                if (series2Type) {
                    series2.push(calculateValue(matrix, series2Type.metric));
                }
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
        value2: number | null;
        label: string;
        fixationIndex: number;
    } | null = $state(null);

    let highlightIndex = $state<number | null>(null);
    let highlightRowIndex = $state<number | null>(null);

    // Mouse interaction handling
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
                value: group.series[index],
                value2: series2Type ? group.series2[index] : null,
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
    function calculateLegendHeight(barHeight: number, hasSeries2: boolean): { legendHeight: number; legendConstant: number } {
        // Constants from RRQAPlotHorizonLegend
        const EXAMPLE_BAR_HEIGHT = 40;
        const SMALL_BAR_HEIGHT = 20;
        const TEXT_OFFSET = 12;
        
        // Calculate total height needed
        let totalHeight = 0;
        
        // Main example section (includes the example bar and spacing)
        totalHeight += 25 + EXAMPLE_BAR_HEIGHT;  // 25px is the initial y-offset
        
        // Explanation text section
        totalHeight += 20;  // Space between example and first text
        totalHeight += 20;  // Space for "n slices" text
        totalHeight += 10;  // Space before series1 label
        totalHeight += 10;  // Space after series1 label
        
        // Range examples section
        totalHeight += SMALL_BAR_HEIGHT + TEXT_OFFSET;  // First range examples with labels
        
        // Add height for second series if present
        if (hasSeries2) {
            totalHeight += 38;  // Space between series + SMALL_BAR_HEIGHT for series 2
            totalHeight += 32;  // Space for series2 label and padding
        }
        
        const legendConstant = totalHeight;
        
        return { 
            legendHeight: totalHeight,
            legendConstant: legendConstant
        };
    }

    // Compute dimensions
    function computeAutoDimensions() {
        const plotAreaHeight = (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP);
        const { legendHeight } = calculateLegendHeight(BAR_HEIGHT, !!series2Type);
        const totalHeight = plotAreaHeight + legendHeight + X_AXIS_EXTRA;
        return { plotAreaHeight, legendHeight, totalHeight };
    }

    const dimensions = $derived.by(() => {
        if (height === "auto") {
            return computeAutoDimensions();
        }
        const { legendHeight } = calculateLegendHeight(BAR_HEIGHT, !!series2Type);
        const plotAreaHeight = (fixationGroups.length * BAR_HEIGHT) + ((fixationGroups.length - 1) * BAR_GAP);
        return {
            plotAreaHeight,
            legendHeight,
            totalHeight: typeof height === "number" ? height : plotAreaHeight + legendHeight + X_AXIS_EXTRA
        };
    });

    $effect(() => {
        console.log(groupValues);
    });
    const plotAreaHeight = $derived.by(() => dimensions.plotAreaHeight);
    const legendHeight = $derived.by(() => dimensions.legendHeight);
    const totalHeight = $derived.by(() => dimensions.totalHeight);
    const series1Palette = $derived.by(() => createColorGradient(seriesType.colorPalette[0], seriesType.colorPalette[1], horizonSlices, 'rgb'));
    const series2Palette = $derived.by(() => createColorGradient(series2Type.colorPalette[0], series2Type.colorPalette[1], horizonSlices, 'rgb'));
    const horizonSeries1: HorizonPlotBarVector[] = $derived.by(() => (
        groupValues.map((group: any) => {
            return {
                values: group.series,
                horizonSlicesColors: series1Palette
            }
        })
    ));
    const horizonSeries2: HorizonPlotBarVector[] | null = $derived.by(() => {
        if (series2Type) {
            return groupValues.map((group: any) => {
                return {
                    values: group.series2,
                    horizonSlicesColors: series2Palette
                }
            })
        }
        return null;
    });
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
                    width={plotWidth} 
                    height={BAR_HEIGHT} 
                    backgroundColor={backgroundColor}
                    y={index * (BAR_HEIGHT + BAR_GAP)}
                    x={LABEL_WIDTH}
                    horizonSeries1={horizonSeries1[index]}
                    horizonSeries2={horizonSeries2 ? horizonSeries2[index] : null}
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
                horizonSeries1={horizonSeries1[0]}
                horizonSeries2={horizonSeries2 ? horizonSeries2[0] : null}
                label1={seriesType.label}
                label2={series2Type ? series2Type.label : null}
            />
        {/key}
    </svg>
</div>

{#if tooltipData && tooltipData.value !== null}
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
                AOI: {highlightRowIndex !== null ? groupValues[highlightRowIndex].fixations[tooltipData.fixationIndex - 1]?.aoi || 'None' : 'None'}<br>
                {seriesType.label}: {formatValue(tooltipData.value)}
                {#if series2Type && tooltipData.value2 !== null}
                    <br>
                    {series2Type.label}: {formatValue(tooltipData.value2)}
                {/if}
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