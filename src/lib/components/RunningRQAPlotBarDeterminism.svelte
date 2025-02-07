<script lang="ts">
    import { computeDeterminism, computeDeterminism2, computeHorizontalLaminarity, computeHorizontalLaminarity2, computeLaminarity, computeLaminarity2, computeRecurrenceRate, computeVerticalLaminarity, computeVerticalLaminarity2 } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarGeneric.svelte";
    import type { Fixation } from "../types/Fixation.js";
  
    let { fixations, metric = "recurrenceRate", width = 500, height = 100, lineColor = "black", backgroundColor = "white" } = $props<{
      fixations: Fixation[];
      metric: "determinism" | "determinism2" | "recurrenceRate" | "laminarity" | "laminarity2" | "horizontalLaminarity" | "verticalLaminarity" | "horizontalLaminarity2" | "verticalLaminarity2";
      width?: number;
      height?: number;
      lineColor?: string;
      backgroundColor?: string;
    }>();
  
    // Compute values in one pass
    let values = $derived(() => {
        const matrices = [];
        const result = [];
        
        for (let i = 0; i < fixations.length; i++) {
            const matrix = computeRecurrenceMatrix(fixations.slice(0, i + 1));
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
        
        return result;
    });

    const handleHover = (event: MouseEvent) => {
        console.log(event);
    };
</script>

<svg width={width} height={height} style="background: {backgroundColor};" onmouseover={handleHover}>
    <RunningRQAPlotBarGeneric 
        values={values()} 
        width={width} 
        height={height} 
        lineColor={lineColor} 
        backgroundColor={backgroundColor} 
    />
</svg>