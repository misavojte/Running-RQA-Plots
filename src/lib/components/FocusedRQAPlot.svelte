<script lang="ts">
    import { computeCenterOfRecurrenceMass, computeDeterminism, computeDeterminism2, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utils/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utils/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
    import type { Snippet } from "svelte";
	import BaseRqaPlot from "./BaseRQAPlot.svelte";
    import type { MatrixGenerator } from "../types/MatrixGenerator.ts";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }

    const metrics = [
        { id: "recurrenceRate", label: "Recurrence Rate" },
        { id: "determinism", label: "Determinism" },
        { id: "laminarity", label: "Laminarity" },
        { id: "horizontalLaminarity", label: "Horizontal Laminarity" },
        { id: "verticalLaminarity", label: "Vertical Laminarity" },
        { id: "determinism2", label: "Determinism'" },
        { id: "laminarity2", label: "Laminarity'" },
        { id: "horizontalLaminarity2", label: "Horizontal Laminarity'" },
        { id: "verticalLaminarity2", label: "Vertical Laminarity'" },
        { id: "corm", label: "Center of Recurrence Mass" }

    ] as const;
  
    let { fixationGroup, width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, aoiColors = [], matrixGenerator = computeRecurrenceMatrix } = $props<{
        fixationGroup: FixationGroup;
        width?: number;
        height?: number | "auto";
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number; metric: string }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
        matrixGenerator?: MatrixGenerator;
    }>();

    // Calculate metrics for each fixation length
    let metricValues = $derived(() => {
        return metrics.map(metric => {
            const result = [];
            
            for (let i = 0; i < fixationGroup.fixations.length; i++) {
                const matrix = matrixGenerator(fixationGroup.fixations.slice(0, i + 1));
                
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
                } else if (metric.id === "determinism2") {
                    result.push(computeDeterminism2(matrix));
                } else if (metric.id === "laminarity2") {
                    result.push(computeLaminarity2(matrix));
                } else if (metric.id === "horizontalLaminarity2") {
                    result.push(computeHorizontalLaminarity2(matrix));
                } else if (metric.id === "verticalLaminarity2") {
                    result.push(computeVerticalLaminarity2(matrix));
                } else if (metric.id === "corm") {
                    result.push(computeCenterOfRecurrenceMass(matrix));
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