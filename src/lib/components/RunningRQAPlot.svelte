<script lang="ts">
    import { computeDeterminism, computeDeterminism2, computeDetLamDifference, computeDiagonalLineMetrics, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
	import BaseRqaPlot from "./BaseRQAPlot.svelte";
    import type { MatrixGenerator } from "../types/MatrixGenerator.ts";

    interface FixationGroup {
        label: string;
        fixations: Fixation[];
    }
  
    let { fixationGroups, metric = "recurrenceRate", width = 500, height = "auto", lineColor = "black", backgroundColor = "white", gridColor = "#CCCCCC", showGrid = false, tooltipSnippet = null, showRisingPoints = false, aoiColors = [], matrixGenerator = computeRecurrenceMatrix } = $props<{
        fixationGroups: FixationGroup[];
        metric: "determinism" | "determinism2" | "recurrenceRate" | "laminarity" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2" | "detLamDifference" | "avgDiagonalLength";
        width?: number;
        height?: number | "auto";
        lineColor?: string;
        backgroundColor?: string;
        gridColor?: string;
        showGrid?: boolean;
        showRisingPoints?: boolean;
        tooltipSnippet?: Snippet<[{ x: number; y: number; value: number | null; label: string; fixationIndex: number }]> | null;
        aoiColors?: Array<{ aoi: string; color: string }>;
        matrixGenerator?: MatrixGenerator;
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
                const matrix = matrixGenerator(group.fixations.slice(0, i + 1));
                matrices.push(matrix);
                
                // Calculate the requested metric using the generated matrix
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
                } else if (metric === "detLamDifference") {
                    result.push(computeDetLamDifference(matrix));
                } else if (metric === "avgDiagonalLength") {
                    result.push(computeDiagonalLineMetrics(matrix).averageLength);
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

</script>

<BaseRqaPlot {width} {height} {lineColor} {backgroundColor} {gridColor} {showGrid} {tooltipSnippet} {showRisingPoints} {aoiColors} plotData={groupValues()} />