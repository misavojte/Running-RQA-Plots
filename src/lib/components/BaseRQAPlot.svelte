<script lang="ts">
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarLine.svelte";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
    import XAxis from "./RunningRQAPlotXAxis.svelte";
	import RunningRqaPlotLegend from "./RunningRQAPlotLegend.svelte";
  
    let { width = 500, height = 100, lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, aoiColors = [], plotData = [] } = $props<{
        width?: number;
        height?: number;
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
        plotData?: Array<{ label: string; values: (number | null)[]; fixations: Fixation[] }>;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived(() => {
        return Math.max(...plotData.map((group: { values: (number | null)[] }) => group.values.length));
    });

    // Remove the old groupValues calculation and use plotData directly
    let groupValues = $derived(() => plotData);

    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Estimate label width using character count (assuming average char width of 7px for 12px font)
    // Plus add some padding for safety
    const labelWidth = $derived(() => {
        const maxLabelLength = Math.max(...groupValues().map((group: { label: string }) => group.label.length));
        return maxLabelLength * 6;
    });

    // Add a constant for the right label width
    const RIGHT_LABEL_WIDTH = 50; // Width reserved for value labels on the right

    // Adjust the plot width to account for labels on both sides
    const plotWidth = $derived(() => width - labelWidth() - RIGHT_LABEL_WIDTH);

    let plotContainer: HTMLDivElement;
    let tooltipData: { x: number; y: number; value: number | null; label: string; fixationIndex: number } | null = $state(null);

    // Add a constant for the x-axis label height
    const X_AXIS_HEIGHT = 30;  // Height reserved for x-axis labels

    function handleMouseMove(event: MouseEvent) {
        const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
        const x = event.clientX - rect.left - labelWidth();
        const y = event.clientY - rect.top;
        const segmentWidth = plotWidth() / maxFixations();
        const index = Math.floor(x / segmentWidth);
        const rowIndex = Math.floor(y / barHeight);
        
        // Remove any existing highlights
        document.querySelector('.highlight-rect')?.remove();
        document.querySelector('.highlight-rect-row')?.remove();
        
        if (x >= 0 && index >= 0 && index < maxFixations() && rowIndex >= 0 && rowIndex < groupValues().length) {
            // Create full-height highlight rectangle
            const highlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            highlight.setAttribute("x", (labelWidth() + index * segmentWidth).toString());
            highlight.setAttribute("y", "0");
            highlight.setAttribute("width", segmentWidth.toString());
            highlight.setAttribute("height", height.toString());
            highlight.setAttribute("fill", "rgba(0, 0, 0, 0.1)");
            highlight.setAttribute("pointer-events", "none");
            highlight.setAttribute("class", "highlight-rect");
            
            // Create row-specific highlight rectangle
            const rowHighlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rowHighlight.setAttribute("x", (labelWidth() + index * segmentWidth).toString());
            rowHighlight.setAttribute("y", (rowIndex * barHeight).toString());
            rowHighlight.setAttribute("width", segmentWidth.toString());
            rowHighlight.setAttribute("height", barHeight.toString());
            rowHighlight.setAttribute("fill", "rgba(0, 0, 0, 0.1)");
            rowHighlight.setAttribute("pointer-events", "none");

            rowHighlight.setAttribute("class", "highlight-rect-row");
            
            const svg = event.currentTarget as SVGSVGElement;
            svg.appendChild(highlight);
            svg.appendChild(rowHighlight);

            // Update tooltip data
            const group = groupValues()[rowIndex];
            tooltipData = {
                x: event.clientX - plotContainer.getBoundingClientRect().left,
                y: event.clientY - plotContainer.getBoundingClientRect().top,
                value: group.values[index],
                label: group.label,
                fixationIndex: index + 1  // Adding 1 to make it 1-based instead of 0-based
            };
        }
    }

    function handleMouseLeave() {
        document.querySelector('.highlight-rect')?.remove();
        document.querySelector('.highlight-rect-row')?.remove();
        tooltipData = null;
    }

    /**
   * Computes layout dimensions when the total height is fixed.
   *
   * The overall structure is:
   *   totalHeight = plotAreaHeight + legendHeight
   *
   * where:
   *   - plotAreaHeight = (number of groups) * barHeight
   *   - legendHeight = barHeight (legend bar) + fixed vertical offset
   *
   * The fixed vertical offset accounts for spacing above the AOI legend items,
   * the height for each row of AOI items, and an additional bottom margin.
   *
   * @param totalHeight - The provided overall height (plot + legend).
   * @param width - The available width used to compute AOI legend item layout.
   * @param plotData - Data for the main plot groups.
   * @param aoiColors - Array defining AOI legend items.
   * @returns An object with:
   *    - plotAreaHeight: Height allocated to the plot area.
   *    - legendHeight: Height allocated to the legend.
   *    - barHeight: Height for each individual bar (used in both plot and legend).
   */
  function computeDimensions(
    totalHeight: number,
    width: number,
    plotData: Array<{ label: string; values: (number | null)[]; fixations: any[] }>,
    aoiColors: Array<{ aoi: string; color: string }>
  ): { plotAreaHeight: number; legendHeight: number; barHeight: number } {
    // Ensure that at least one group exists to avoid division by zero.
    const numberOfGroups = plotData.length || 1;

    // === AOI Legend Calculations ===
    // These calculations determine how many legend items fit per row based on the available width.

    const BASE_ITEM_WIDTH = 25;   // Base space for the circle and padding.
    const CHAR_WIDTH = 7;         // Estimated width per character.
    let maxLabelLength = 0;
    for (const item of aoiColors) {
      maxLabelLength = Math.max(maxLabelLength, item.aoi.length);
    }
    const estimatedItemWidth = BASE_ITEM_WIDTH + (maxLabelLength * CHAR_WIDTH);
    // Cap the width to avoid excessively wide items.
    const ITEM_WIDTH = Math.min(estimatedItemWidth, 150);
    
    // Available width for legend items (with some padding).
    const AOI_LEGEND_MAX_WIDTH = width - 20;
    const ITEMS_PER_ROW = Math.max(Math.floor(AOI_LEGEND_MAX_WIDTH / ITEM_WIDTH), 1);
    const numRows = aoiColors.length > 0 ? Math.ceil(aoiColors.length / ITEMS_PER_ROW) : 0;
    
    // Increase the vertical offset to provide more space for the legend elements
    const legendFixedOffset = 65 + 10;  // Increased from 45 to 65
    
    // Add additional space per AOI row
    const AOI_LEGEND_LINE_HEIGHT = 25;  // Increased from 20 to 25 for better spacing
    
    // Calculate total legend height needed
    const legendConstant = (numRows * AOI_LEGEND_LINE_HEIGHT) + legendFixedOffset;

    // Ensure minimum bar height
    const MIN_BAR_HEIGHT = 20;
    const barHeight = Math.max(
        MIN_BAR_HEIGHT,
        (totalHeight - legendConstant) / (numberOfGroups + 1)
    );

    // Compute the plot area height based on the number of groups
    const plotAreaHeight = numberOfGroups * barHeight;
    // The legend height includes the legend bar (barHeight) plus the fixed offset
    const legendHeight = barHeight + legendConstant;

    return { plotAreaHeight, legendHeight, barHeight };
  }

  // Calculate the layout dimensions using the provided props.
  const { plotAreaHeight, legendHeight, barHeight } = computeDimensions(height, width, plotData, aoiColors);
</script>


<div class="plot-container" bind:this={plotContainer}>
    <svg 
        width={width} 
        height={height}
        style="background: {backgroundColor};"
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
        aria-label="Running RQA Plot"
        role="img"

    >
        {#key groupValues()}
        {#if showGrid}
            <pattern 
                id="grid-{uid}" 
                width={plotWidth()} 
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
            <rect x={labelWidth()} width={plotWidth()} height={height} fill={`url(#grid-${uid})`} />
        {/if}
        {#each groupValues() as group, i}
            <g transform="translate(0, {i * barHeight})">
                <!-- Left label -->
                <text 
                    x={labelWidth() - 5}
                    y={barHeight / 2}
                    text-anchor="end"
                    dominant-baseline="middle"

                    font-size="12px"
                    fill="black"
                >{group.label}</text>

                <!-- Plot content -->
                <g transform="translate({labelWidth()}, 0)">
                    <RunningRQAPlotBarGeneric 
                        values={group.values} 
                        width={plotWidth()} 
                        height={barHeight}
                        backgroundColor="transparent"
                        margin={2}
                        lineColor={lineColor}

                        colorFilling={group.fixations.map((f: { aoi?: string[] }) => {
                            const aoiMapping = aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === f.aoi?.[0]);
                            return aoiMapping?.color ?? 'gray';
                        })}
                    />
                </g>

                <!-- Right value label -->
                <text 
                    x={labelWidth() + plotWidth() + 5}
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
            width={plotWidth()}
            height={plotAreaHeight}
            labelWidth={labelWidth()}
            maxFixations={maxFixations()}
        />
        <RunningRqaPlotLegend width={width} y={plotAreaHeight + X_AXIS_HEIGHT} height={legendHeight} lineColor={lineColor} barHeight={barHeight} aoiColors={aoiColors} />
        {/key}
    </svg>


    {#snippet tooltipSnippetDefault(tooltipData: { x: number; y: number; value: number | null; label: string; fixationIndex: number })}
        <strong>{tooltipData.label}</strong><br>
        Fixation: {tooltipData.fixationIndex}<br>
        Value: {tooltipData.value ? tooltipData.value.toFixed(3) : "0"}
        {#if tooltipData.value !== null}
            <br>
            Change: {(() => {
                const group = groupValues().find((g: { label: string }) => g.label === tooltipData.label);
                if (!group || tooltipData.fixationIndex <= 1) return "+0.000";
                const prevValue = group.values[tooltipData.fixationIndex - 2];
                if (prevValue === null) return "N/A";
                const change = tooltipData.value - prevValue;
                return (change >= 0 ? "+" : "") + change.toFixed(3);
            })()}
        {/if}
    {/snippet}

    {#if tooltipData && tooltipData.value !== null}
        <div 
            class="tooltip" 
            style="
                left: {tooltipData.x + 15}px;
                top: {tooltipData.y + 15}px;
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
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        font-size: 12px;
        width: 100px;
    }
</style>