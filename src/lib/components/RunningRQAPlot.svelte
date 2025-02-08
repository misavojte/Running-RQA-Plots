<script lang="ts">
    import { computeDeterminism, computeDeterminism2, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarLine.svelte";
    import RunningRQAPlotBarBars from "./RunningRQAPlotBarBars.svelte";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }
  
    let { fixationGroups, metric = "recurrenceRate", width = 500, height = 100, lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, displayType = "line", tooltipSnippet = null, aoiColors = [] } = $props<{
        fixationGroups: FixationGroup[];
        metric: "determinism" | "determinism2" | "recurrenceRate" | "laminarity" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2";
        width?: number;
        height?: number;
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        displayType?: "line" | "bars";
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived(() => {
        return Math.max(...fixationGroups.map((group: FixationGroup) => group.fixations.length));
    });

    // Modify groupValues to pad shorter sequences with null values
    let groupValues = $derived(() => {
        return fixationGroups.map((group: FixationGroup) => {
            const matrices = [];
            const result = [];
            
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = computeRecurrenceMatrix(group.fixations.slice(0, i + 1));
                matrices.push(matrix);
                
                // Calculate the requested metric directly
                if (metric === "recurrenceRate") {
                    result.push(computeRecurrenceRate(matrix));
                } else if (metric === "determinism") {
                    result.push(computeDeterminism(matrix));
                } else if (metric === "determinism2") {
                    result.push(computeDeterminism2(matrix));
                } else if (metric === "laminarity") {
                    result.push(computeLaminarity(matrix));
                } else if (metric === "laminarity2") {
                    result.push(computeLaminarity2(matrix));
                } else if (metric === "horizontalLaminarity") {
                    result.push(computeHorizontalLaminarity(matrix));
                } else if (metric === "verticalLaminarity") {
                    result.push(computeVerticalLaminarity(matrix));
                } else if (metric === "horizontalLaminarity2") {
                    result.push(computeHorizontalLaminarity2(matrix));
                } else if (metric === "verticalLaminarity2") {
                    result.push(computeVerticalLaminarity2(matrix));
                }
            }
            
            // Pad with null values if this group has fewer fixations
            while (result.length < maxFixations()) {
                result.push(null);
            }
            
            return {
                label: group.label,
                values: result,
                fixations: group.fixations
            };
        });
    });

    // Calculate individual bar heights based on number of groups
    const barHeight = $derived(() => height / fixationGroups.length);

    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Estimate label width using character count (assuming average char width of 7px for 12px font)
    // Plus add some padding for safety
    const labelWidth = $derived(() => {
        const maxLabelLength = Math.max(...groupValues().map((group: FixationGroup) => group.label.length));
        return maxLabelLength * 6;
    });

    // Adjust the plot width to account for labels
    const plotWidth = $derived(() => width - labelWidth());

    let plotContainer: HTMLDivElement;
    let tooltipData: { x: number; y: number; value: number | null; label: string; fixationIndex: number } | null = $state(null);

    function handleMouseMove(event: MouseEvent) {
        const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
        const x = event.clientX - rect.left - labelWidth();
        const y = event.clientY - rect.top;
        const segmentWidth = plotWidth() / maxFixations();
        const index = Math.floor(x / segmentWidth);
        const rowIndex = Math.floor(y / barHeight());
        
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
            rowHighlight.setAttribute("y", (rowIndex * barHeight()).toString());
            rowHighlight.setAttribute("width", segmentWidth.toString());
            rowHighlight.setAttribute("height", barHeight().toString());
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
        {#if showGrid}
            <pattern 
                id="grid-{uid}" 
                width={plotWidth()} 
                height={barHeight()} 
                patternUnits="userSpaceOnUse"
            >
                <path 
                    d={`M 0 ${barHeight()} L ${plotWidth()} ${barHeight()}`}
                    fill="none" 
                    stroke={gridColor} 
                    stroke-width="1"
                    stroke-opacity="1"
                />
            </pattern>
            <rect x={labelWidth()} width={plotWidth()} height={height} fill={`url(#grid-${uid})`} />
        {/if}
        {#each groupValues() as group, i}
            <g transform="translate(0, {i * barHeight()})">
                <text 
                    x={labelWidth() - 5}
                    y={barHeight() / 2}
                    text-anchor="end"
                    dominant-baseline="middle"
                    font-size="12px"
                    fill="black"
                >{group.label}</text>
                <g transform="translate({labelWidth()}, 0)">
                    {#if displayType === "line"}
                        <RunningRQAPlotBarGeneric 
                            values={group.values} 
                            width={plotWidth()} 
                            height={barHeight()}
                            backgroundColor="transparent"
                            margin={2}
                            lineColor={lineColor}
                            colorFilling={group.fixations.map((f: { aoi?: string[] }) => {
                                const aoiMapping = aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === f.aoi?.[0]);
                                return aoiMapping?.color ?? 'gray';  // Map to actual hex colors
                            })}
                        />
                    {:else}
                        <RunningRQAPlotBarBars
                            values={group.values} 
                            width={plotWidth()} 
                            height={barHeight()} 
                            barColor={lineColor} 
                            backgroundColor="transparent"
                            margin={1}
                        />
                    {/if}
                </g>
            </g>
        {/each}
    </svg>

    {#snippet tooltipSnippetDefault(tooltipData: { x: number; y: number; value: number | null; label: string; fixationIndex: number })}
        <strong>{tooltipData.label}</strong><br>
        Fixation: {tooltipData.fixationIndex}<br>
        Value: {tooltipData.value ? tooltipData.value.toFixed(3) : "N/A"}
        {#if tooltipData.value !== null}
            <br>
            Change: {(() => {
                const group = groupValues().find((g: FixationGroup) => g.label === tooltipData.label);
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