<script lang="ts">
    import { computeDeterminism, computeDetLamDifference, computeHorizontalLaminarity, computeLaminarity, computeRecurrenceRate, computeVerticalLaminarity } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
    import type { Snippet } from "svelte";
	import BaseRqaPlot from "./BaseRQAPlot.svelte";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    const metrics = [
        { id: "recurrenceRate", label: "Recurrence Rate" },
        { id: "determinism", label: "Determinism" },
        { id: "laminarity", label: "Laminarity" },
        { id: "horizontalLaminarity", label: "Horizontal Laminarity" },
        { id: "verticalLaminarity", label: "Vertical Laminarity" }

    ] as const;
  
    let { fixationGroup, width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, aoiColors = [] } = $props<{
        fixationGroup: FixationGroup;
        width?: number;
        height?: number | "auto";
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
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
                } else if (metric.id === "laminarity") {
                    result.push(computeLaminarity(matrix));
                } else if (metric.id === "horizontalLaminarity") {
                    result.push(computeHorizontalLaminarity(matrix));
                } else if (metric.id === "verticalLaminarity") {
                    result.push(computeVerticalLaminarity(matrix));
                }
            }
            
            return {
                label: metric.label,
                values: result,
                fixations: fixationGroup.fixations
            };
        });
    });
</script>

<BaseRqaPlot {width} {height} {lineColor} {backgroundColor} {gridColor} {showGrid} {tooltipSnippet} {aoiColors} plotData={metricValues()} />