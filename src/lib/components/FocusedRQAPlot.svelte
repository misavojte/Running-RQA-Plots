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

    const metrics = [
        { id: "recurrenceRate", label: "Recurrence Rate" },
        { id: "determinism", label: "Determinism" },
        { id: "determinism2", label: "Determinism 2" },
        { id: "laminarity", label: "Laminarity" },
        { id: "laminarity2", label: "Laminarity 2" },
        { id: "horizontalLaminarity", label: "Horizontal Laminarity" },
        { id: "horizontalLaminarity2", label: "Horizontal Laminarity 2" },
        { id: "verticalLaminarity", label: "Vertical Laminarity" },
        { id: "verticalLaminarity2", label: "Vertical Laminarity 2" }
    ] as const;
  
    let { fixationGroup, width = 500, height = 400, lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, displayType = "line", tooltipSnippet = null, aoiColors = [] } = $props<{
        fixationGroup: FixationGroup;
        width?: number;
        height?: number;
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        displayType?: "line" | "bars";
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number; metric: string }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
    }>();

    // Calculate individual bar heights based on number of metrics
    const barHeight = $derived(() => height / metrics.length);

    // Calculate metrics for each fixation length
    let metricValues = $derived(() => {
        return metrics.map(metric => {
            const result = [];
            
            for (let i = 0; i < fixationGroup.fixations.length; i++) {
                const matrix = computeRecurrenceMatrix(fixationGroup.fixations.slice(0, i + 1));
                
                // Calculate the requested metric
                if (metric.id === "recurrenceRate") {
                    result.push(computeRecurrenceRate(matrix));
                } else if (metric.id === "determinism") {
                    result.push(computeDeterminism(matrix));
                } else if (metric.id === "determinism2") {
                    result.push(computeDeterminism2(matrix));
                } else if (metric.id === "laminarity") {
                    result.push(computeLaminarity(matrix));
                } else if (metric.id === "laminarity2") {
                    result.push(computeLaminarity2(matrix));
                } else if (metric.id === "horizontalLaminarity") {
                    result.push(computeHorizontalLaminarity(matrix));
                } else if (metric.id === "verticalLaminarity") {
                    result.push(computeVerticalLaminarity(matrix));
                } else if (metric.id === "horizontalLaminarity2") {
                    result.push(computeHorizontalLaminarity2(matrix));
                } else if (metric.id === "verticalLaminarity2") {
                    result.push(computeVerticalLaminarity2(matrix));
                }
            }
            
            return {
                label: metric.label,
                values: result
            };
        });
    });

    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Estimate label width using character count
    const labelWidth = $derived(() => {
        const maxLabelLength = Math.max(...metricValues().map(metric => metric.label.length));
        return maxLabelLength * 6;
    });

    // Adjust the plot width to account for labels
    const plotWidth = $derived(() => width - labelWidth());

    let plotContainer: HTMLDivElement;
    let tooltipData: { x: number; y: number; value: number | null; label: string; fixationIndex: number; metric: string } | null = $state(null);

    function handleMouseMove(event: MouseEvent) {
        const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
        const x = event.clientX - rect.left - labelWidth();
        const y = event.clientY - rect.top;
        const segmentWidth = plotWidth() / fixationGroup.fixations.length;
        const index = Math.floor(x / segmentWidth);
        const rowIndex = Math.floor(y / barHeight());
        
        // Remove any existing highlights
        document.querySelector('.highlight-rect')?.remove();
        document.querySelector('.highlight-rect-row')?.remove();
        
        if (x >= 0 && index >= 0 && index < fixationGroup.fixations.length && rowIndex >= 0 && rowIndex < metricValues().length) {
            // Create highlights and update tooltip similar to RunningRQAPlot
            const highlight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            highlight.setAttribute("x", (labelWidth() + index * segmentWidth).toString());
            highlight.setAttribute("y", "0");
            highlight.setAttribute("width", segmentWidth.toString());
            highlight.setAttribute("height", height.toString());
            highlight.setAttribute("fill", "rgba(0, 0, 0, 0.1)");
            highlight.setAttribute("pointer-events", "none");
            highlight.setAttribute("class", "highlight-rect");
            
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

            const metric = metricValues()[rowIndex];
            tooltipData = {
                x: event.clientX - plotContainer.getBoundingClientRect().left,
                y: event.clientY - plotContainer.getBoundingClientRect().top,
                value: metric.values[index],
                label: fixationGroup.label,
                metric: metric.label,
                fixationIndex: index + 1
            };
        }
    }

    $effect(() => {
        // Clear highlights whenever fixation group changes
        handleMouseLeave();
        // Access fixationGroup to create the dependency
        fixationGroup;
    });

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
        aria-label="Focused RQA Plot"
        role="img"
    >   
    {#key fixationGroup}
        {#if showGrid}
            <pattern 
                id="grid-{uid}" 
                width={plotWidth()} 
                height={barHeight()} 
                patternUnits="userSpaceOnUse"
                x={labelWidth()}
            >
                <path 
                    d={`M 0 ${barHeight()} L ${plotWidth()} ${barHeight()}`}
                    fill="none" 
                    stroke={gridColor} 
                    stroke-width="1"
                    stroke-opacity="1"
                />
            </pattern>
            <rect 
                x={labelWidth()} 
                y="0"
                width={plotWidth()} 
                height={height} 
                fill={`url(#grid-${uid})`} 
                pointer-events="none"
            />
        {/if}

        {#each metricValues() as metric, i}
            <g transform="translate(0, {i * barHeight()})">
                <text 
                    x={labelWidth() - 5}
                    y={barHeight() / 2}
                    text-anchor="end"
                    dominant-baseline="middle"
                    font-size="12px"
                    fill="black"
                >{metric.label}</text>
                <g transform="translate({labelWidth()}, 0)">
                    {#if displayType === "line"}
                        <RunningRQAPlotBarGeneric 
                            values={metric.values} 
                            width={plotWidth()} 
                            height={barHeight()}
                            backgroundColor="transparent"
                            margin={2}
                            lineColor={lineColor}
                            colorFilling={fixationGroup.fixations.map((f: { aoi?: string[] }) => {
                                const aoiMapping = aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === f.aoi?.[0]);
                                return aoiMapping?.color ?? 'gray';
                            })}
                        />
                    {:else}
                        <RunningRQAPlotBarBars
                            values={metric.values} 
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
        {/key}
    </svg>

    {#snippet tooltipSnippetDefault(tooltipData: { x: number; y: number; value: number | null; label: string; metric: string; fixationIndex: number })}
        <strong>{tooltipData.label}</strong><br>
        <strong>{tooltipData.metric}</strong><br>
        Fixation: {tooltipData.fixationIndex}<br>
        Value: {tooltipData.value ? tooltipData.value.toFixed(3) : "N/A"}
        {#if tooltipData.value !== null}
            <br>
            Change: {(() => {
                const metricData = metricValues().find((m) => m.label === tooltipData.metric);
                if (!metricData || tooltipData.fixationIndex <= 1) return "+0.000";
                const prevValue = metricData.values[tooltipData.fixationIndex - 2];
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
        width: 150px;
    }
</style> 