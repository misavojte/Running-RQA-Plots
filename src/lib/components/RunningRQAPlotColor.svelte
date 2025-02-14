<script lang="ts">
    import { computeDeterminism, computeDeterminism2, computeDetLamDifference, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
	import RunningRqaPlotBarColor from "./RunningRQAPlotBarColor.svelte";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }
  
    let { fixationGroups, width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, showRisingPoints = false, aoiColors = [] } = $props<{
        fixationGroups: FixationGroup[];
        width?: number;
        height?: number | "auto";
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        showRisingPoints?: boolean;
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
            const series1 = [];
            const series2 = [];
            const series3 = [];
            
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = computeRecurrenceMatrix(group.fixations.slice(0, i + 1));
                matrices.push(matrix);

                series1.push(computeRecurrenceRate(matrix));
                series2.push(computeDeterminism(matrix));
                series3.push(computeLaminarity(matrix));
            }
                
            
            // Pad with null values if this group has fewer fixations
            while (series1.length < maxFixations()) {
                series1.push(null);
                series2.push(null);
                series3.push(null);
            }
            
            return {
                label: group.label,
                series1: series1,
                series2: series2,
                series3: series3,
                fixations: group.fixations
            };
        });
    });

</script>

{#key groupValues()}
    {#each groupValues() as group, index}
        <RunningRqaPlotBarColor series1={group.series1} series2={group.series2} series3={group.series3} width={width} height={100} {backgroundColor} y={index * 100} />
    {/each}
{/key}