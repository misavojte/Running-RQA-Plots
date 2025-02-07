<script lang="ts">
    import { computeDeterminism, computeDeterminism2, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarGeneric.svelte";
    import type { Fixation } from "../types/Fixation.js";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }
  
    let { fixationGroups, metric = "recurrenceRate", width = 500, height = 100, lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false } = $props<{
        fixationGroups: FixationGroup[];
        metric: "determinism" | "determinism2" | "recurrenceRate" | "laminarity" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2";
        width?: number;
        height?: number;
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
    }>();

    // Compute values for each group
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
            
            return {
                label: group.label,
                values: result
            };
        });
    });

    // Calculate individual bar heights based on number of groups
    const barHeight = $derived(() => height / fixationGroups.length);

    const uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

</script>

<svg width={width} height={height} style="background: {backgroundColor};">
    {#if showGrid}
        <pattern 
            id="grid-{uid}" 
            width={width} 
            height={barHeight()} 
            patternUnits="userSpaceOnUse"
    >
            <path 
                d={`M 0 ${barHeight()} L ${width} ${barHeight()}`}
                fill="none" 
                stroke={gridColor} 
                stroke-width="1"
                stroke-opacity="1"
            />
        </pattern>
        <rect width={width} height={height} fill={`url(#grid-${uid})`} />
    {/if}
    {#each groupValues() as group, i}
        <g transform="translate(0, {i * barHeight()})">
            <RunningRQAPlotBarGeneric 
                values={group.values} 
                width={width} 
                height={barHeight()} 
                lineColor={lineColor} 
                backgroundColor="transparent"
            />
        </g>
    {/each}
</svg>