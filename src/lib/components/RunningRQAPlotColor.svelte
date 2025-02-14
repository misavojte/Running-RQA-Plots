<script lang="ts">
    import { computeDeterminism, computeDeterminism2, computeDetLamDifference, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
	import RunningRqaPlotBarColor from "./RunningRQAPlotBarColor.svelte";
	import RunningRqaPlotXAxis from "./RunningRqaPlotXAxis.svelte";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    type SeriesHighlightType = "determinism" | "laminarity" | "determinism2" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2" | "recurrenceRate"
  
    let { fixationGroups, width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, showRisingPoints = false, aoiColors = [], series2Type = "determinism2", series3Type = "laminarity2" } = $props<{
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
    }>();

    // Calculate the maximum number of fixations across all groups
    const maxFixations = $derived(() => {
        return Math.max(...fixationGroups.map((group: FixationGroup) => group.fixations.length));
    });

    const calculateTrendValue = (currentValue: number, previousValue: number) => {
        if (previousValue === null || currentValue === null) return 0;
        if (currentValue < previousValue) return 0;
        return 1;
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
            default:
                return 0;
        }
    }

    // Modify groupValues to pad shorter sequences with null values
    let groupValues = $derived(() => {
        return fixationGroups.map((group: FixationGroup) => {
            const matrices = [];
            const series1 = [];
            const series2 = [];
            const series3 = [];
            
            let previousSeries2 = 0;
            let previousSeries3 = 0;
            for (let i = 0; i < group.fixations.length; i++) {
                const matrix = computeRecurrenceMatrix(group.fixations.slice(0, i + 1));
                matrices.push(matrix);
                const currentSeries2 = calculateValue(matrix, series2Type);
                const currentSeries3 = calculateValue(matrix, series3Type);
                series1.push(computeRecurrenceRate(matrix));
                series2.push(calculateTrendValue(currentSeries2, previousSeries2));
                series3.push(calculateTrendValue(currentSeries3, previousSeries3));
                previousSeries2 = currentSeries2;
                previousSeries3 = currentSeries3;
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

    $effect(() => {
        console.log(groupValues());
    });

    // --- NEW: compute proper plot dimensions (inspired by BaseRQAPlot.svelte) ---
    const LABEL_WIDTH = 100;
    const RIGHT_LABEL_WIDTH = 50;
    const plotWidth = width - LABEL_WIDTH - RIGHT_LABEL_WIDTH;
    const BAR_HEIGHT = 100; // each group's bar height
    // Total height for all the bars
    const plotAreaHeight = $derived(() => fixationGroups.length * BAR_HEIGHT);
    // Extra space for the x-axis texts (as in BaseRQAPlot.svelte, the x-axis texts use y={height + 16})
    const X_AXIS_EXTRA = 30;
    // Overall SVG height
    const svgHeight = $derived(() => plotAreaHeight() + X_AXIS_EXTRA);
</script>

<!-- Wrap everything in a single SVG so the bars and x-axis share the same coordinate system -->
<div class="plot-container">
    <svg width={width} height={svgHeight()} style="background: {backgroundColor};">
        {#key groupValues()}
            {#each groupValues() as group, index}
                <RunningRqaPlotBarColor 
                    series1={group.series1} 
                    series2={group.series2} 
                    series3={group.series3} 
                    hideDoubleIncrease={false} 
                    width={plotWidth} 
                    height={BAR_HEIGHT} 
                    backgroundColor={backgroundColor} 
                    y={index * BAR_HEIGHT}
                    x={LABEL_WIDTH}
                />
            {/each}
        {/key}
        
        <!--
            IMPORTANT: Pass plotAreaHeight as the "height" prop, so the x-axis texts
            render starting at y = plotAreaHeight + (their offset), which mimics BaseRQAPlot.
            This avoids using any transform.
        -->
        <RunningRqaPlotXAxis 
            width={plotWidth} 
            height={plotAreaHeight()} 
            labelWidth={LABEL_WIDTH} 
            maxFixations={maxFixations()} />
    </svg>
</div> 