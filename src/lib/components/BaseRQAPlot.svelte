<script lang="ts">
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarLine.svelte";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
    import XAxis from "./RunningRQAPlotXAxis.svelte";
	import RunningRqaPlotLegend from "./RunningRQAPlotLegend.svelte";
	import { fade } from "svelte/transition";
  
    let { width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, showRisingPoints = false, tooltipSnippet = null, aoiColors = [], plotData = [], rowGap = 4 } = $props<{
        width?: number;
        height?: number | "auto";
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        showRisingPoints?: boolean;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
        plotData?: Array<{ label: string; values: (number | null)[]; fixations: Fixation[] }>;
        rowGap?: number;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived.by(() => {
        return Math.max(...plotData.map((group: { values: (number | null)[] }) => group.values.length));
    });

    // Remove the old groupValues calculation and use plotData directly
    let groupValues = $derived.by(() => plotData);

    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Estimate label width using character count (assuming average char width of 7px for 12px font)
    // Plus add some padding for safety
    const labelWidth = $derived.by(() => {
        const maxLabelLength = Math.max(...groupValues.map((group: { label: string }) => group.label.length));
        return maxLabelLength * 6;
    });

    // Add a constant for the right label width
    const RIGHT_LABEL_WIDTH = 50; // Width reserved for value labels on the right

    // Adjust the plot width to account for labels on both sides
    const plotWidth = $derived.by(() => width - labelWidth - RIGHT_LABEL_WIDTH);

    let plotContainer: HTMLDivElement;
    let tooltipData: { x: number; y: number; value: number | null; label: string; fixationIndex: number } | null = $state(null);

    // Add a constant for the x-axis label height
    const X_AXIS_HEIGHT = 30;  // Height reserved for x-axis labels

    // Replace the DOM-based highlight state with Svelte state
    let highlightIndex = $state<number | null>(null);
    let highlightRowIndex = $state<number | null>(null);

    // Add throttle state
    let lastMouseMoveTime = $state(0);
    const FRAME_TIME = 1000 / 40; // Limit to ~40fps

    // Add a component-level function for formatting the tooltip content
    function formatChange(currentValue: number, label: string, fixationIndex: number): string {
        const group = groupValues.find((g: { label: string }) => g.label === label);
        if (!group || fixationIndex <= 1) return "+0.000";
        const prevValue = group.values[fixationIndex - 2];
        if (prevValue === null) return "N/A";
        const change = currentValue - prevValue;
        return (change >= 0 ? "+" : "") + change.toFixed(3);
    }

    function handleMouseMove(event: MouseEvent) {
        const currentTime = performance.now();
        if (currentTime - lastMouseMoveTime < FRAME_TIME) {
            return;
        }
        lastMouseMoveTime = currentTime;

        const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
        const x = event.clientX - rect.left - labelWidth;
        const y = event.clientY - rect.top;
        const segmentWidth = plotWidth / maxFixations;
        const index = Math.floor(x / segmentWidth);
        const rowIndex = Math.floor(y / (barHeight + rowGap));
        
        if (x >= 0 && index >= 0 && index < maxFixations && rowIndex >= 0 && rowIndex < groupValues.length) {
            highlightIndex = index;
            highlightRowIndex = rowIndex;

            // Update tooltip data
            const group = groupValues[rowIndex];
            tooltipData = {
                x: event.clientX,  // Use clientX directly for fixed positioning
                y: event.clientY,  // Use clientY directly for fixed positioning
                value: group.values[index],
                label: group.label,
                fixationIndex: index + 1
            };
        } else {
            handleMouseLeave();
        }
    }

    function handleMouseLeave() {
        highlightIndex = null;
        highlightRowIndex = null;
        tooltipData = null;
    }

    // alternative to computeDimensions, used when height is "auto", returns the total height of the plot
    // compute with the legend as well, do not use computeDimensions when height is "auto"
    function computeAutoDimensions(
        width: number,
        plotData: Array<{ label: string; values: (number | null)[]; fixations: any[] }>,
        aoiColors: Array<{ aoi: string; color: string }>
    ) {
        const FIXED_BAR_HEIGHT = 40;
        const plotAreaHeight = (plotData.length * FIXED_BAR_HEIGHT) + ((plotData.length - 1) * rowGap);
        const legendHeight = calculateLegendHeight(width, aoiColors, FIXED_BAR_HEIGHT).legendHeight;
        const totalHeight = plotAreaHeight + legendHeight + X_AXIS_HEIGHT;

        return {
            plotAreaHeight,
            legendHeight,
            totalHeight,
            barHeight: FIXED_BAR_HEIGHT
        }
    }

    function calculateLegendHeight(
        width: number,
        aoiColors: Array<{ aoi: string; color: string }>,
        barHeight: number
    ): { legendHeight: number; legendConstant: number } {
        const BASE_ITEM_WIDTH = 25;   // Base space for the circle and padding
        const CHAR_WIDTH = 7;         // Estimated width per character
        
        // Calculate max label length
        const maxLabelLength = Math.max(...aoiColors.map(item => item.aoi.length), 0);
        const estimatedItemWidth = BASE_ITEM_WIDTH + (maxLabelLength * CHAR_WIDTH);
        const ITEM_WIDTH = Math.min(estimatedItemWidth, 150);
        
        // Calculate rows needed for legend items
        const AOI_LEGEND_MAX_WIDTH = width - 20;
        const ITEMS_PER_ROW = Math.max(Math.floor(AOI_LEGEND_MAX_WIDTH / ITEM_WIDTH), 1);
        const numRows = aoiColors.length > 0 ? Math.ceil(aoiColors.length / ITEMS_PER_ROW) : 0;
        
        const legendFixedOffset = 75;  // Base offset for legend elements
        const AOI_LEGEND_LINE_HEIGHT = 25;  // Height per legend row
        
        const legendConstant = (numRows * AOI_LEGEND_LINE_HEIGHT) + legendFixedOffset;
        const legendHeight = barHeight + legendConstant;
        
        return { legendHeight, legendConstant };
    }

    function computeDimensions(
        totalHeight: number | "auto",
        width: number,
        plotData: Array<{ label: string; values: (number | null)[]; fixations: any[] }>,
        aoiColors: Array<{ aoi: string; color: string }>
    ): { plotAreaHeight: number; legendHeight: number; barHeight: number; totalHeight: number } {

        if (totalHeight === "auto") {
            return computeAutoDimensions(width, plotData, aoiColors);
        }

        const numberOfGroups = plotData.length || 1;
        
        // Ensure minimum bar height
        const MIN_BAR_HEIGHT = 20;
        
        // First calculate initial bar height without legend consideration

        const initialBarHeight = Math.max(MIN_BAR_HEIGHT, totalHeight / (numberOfGroups + 1));

        
        // Calculate legend dimensions
        const { legendHeight, legendConstant } = calculateLegendHeight(width, aoiColors, initialBarHeight);
        
        // Recalculate bar height considering legend space
        const barHeight = Math.max(
            MIN_BAR_HEIGHT,
            (totalHeight - legendConstant) / (numberOfGroups + 1)
        );
        
        // Compute the plot area height
        const plotAreaHeight = numberOfGroups * barHeight;
        
        return { plotAreaHeight, legendHeight, barHeight, totalHeight };
    }

    // Make dimensions reactive using $derived
    const dimensions = $derived.by(() => {
        if (height === "auto") {
            return computeAutoDimensions(width, plotData, aoiColors);
        } else {
            return computeDimensions(height, width, plotData, aoiColors);
        }
    });

    // Replace individual dimension variables with derived properties
    const plotAreaHeight = $derived.by(() => dimensions.plotAreaHeight);
    const legendHeight = $derived.by(() => dimensions.legendHeight);
    const barHeight = $derived.by(() => dimensions.barHeight);
    const totalHeight = $derived.by(() => dimensions.totalHeight);

</script>


<div class="plot-container" bind:this={plotContainer}>
    <svg 
        width={width} 
        height={totalHeight}
        style="background: {backgroundColor};"
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
        aria-label="Running RQA Plot"
        role="img"

    >
        {#key groupValues}
        {#if showGrid}
            <pattern 
                id="grid-{uid}" 
                width={plotWidth} 
                height={barHeight} 
                patternUnits="userSpaceOnUse"

            >
                <path 
                    d={`M 0 ${barHeight} L ${plotWidth} ${barHeight}`}
                    fill="none" 
                    stroke={gridColor} 
                    stroke-width="1"
                    stroke-opacity="1"

                />
            </pattern>
            <rect x={labelWidth} width={plotWidth} height={height} fill={`url(#grid-${uid})`} />
        {/if}
        {#each groupValues as group, i}
            <g transform="translate(0, {i * (barHeight + rowGap)})">
                <!-- Left label -->
                <text 
                    x={labelWidth - 5}
                    y={barHeight / 2}
                    text-anchor="end"
                    dominant-baseline="middle"


                    font-size="12px"
                    fill="black"
                >{group.label}</text>

                <!-- Plot content -->
                <g transform="translate({labelWidth}, 0)">
                    <RunningRQAPlotBarGeneric 
                        values={group.values} 
                        width={plotWidth} 
                        height={barHeight}
                        backgroundColor="transparent"
                        margin={1}
                        lineColor={lineColor}
                        showRisingPoints={showRisingPoints}


                        colorFilling={group.fixations.map((f: { aoi?: string[] }) => {
                            const aoiMapping = aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === f.aoi?.[0]);
                            return aoiMapping?.color ?? 'gray';
                        })}
                    />
                </g>

                <!-- Right value label -->
                <text 
                    x={labelWidth + plotWidth + 5}
                    y={barHeight / 2}
                    text-anchor="start"
                    dominant-baseline="middle"
                    font-size="12px"
                    fill="black"


                >{(() => {
                    const lastValidValue = group.values.filter((v: number | null) => v !== null).pop();
                    return lastValidValue?.toFixed(3) ?? 'N/A';
                })()}</text>
            </g>
        {/each}
        <XAxis 
            width={plotWidth}
            height={plotAreaHeight}
            labelWidth={labelWidth}
            maxFixations={maxFixations}

        />
        <RunningRqaPlotLegend width={width} y={plotAreaHeight + X_AXIS_HEIGHT} height={legendHeight} lineColor={lineColor} barHeight={barHeight} aoiColors={aoiColors} />
        {/key}

        <!-- Add highlight rectangles using Svelte conditionals -->
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
                y={highlightRowIndex * (barHeight + rowGap)}
                width={plotWidth / maxFixations}
                height={barHeight}
                fill="rgba(0, 0, 0, 0.1)"
                pointer-events="none"
                transition:fade
            />
        {/if}
    </svg>
</div>

<!-- Portal the tooltip to body -->
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
                Value: {tooltipData.value?.toFixed(3) ?? "0"}
                {#if tooltipData.value !== null}
                    <br>
                    Change: {formatChange(tooltipData.value, tooltipData.label, tooltipData.fixationIndex)}
                {/if}
            {/if}
        </div>
    </div>
{/if}

<style>
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
        width: 100px;
    }

    .plot-container {
        position: relative;
    }

    .transition-all {
        transition: all 0.1s ease-out;
    }
</style>