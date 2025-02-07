<script lang="ts">
    import { computeDeterminism, computeRecurrenceRate } from "../utility/recurrenceMetrics.js";
    import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarGeneric.svelte";
    import type { Fixation } from "../types/Fixation.js";
  
    let { fixations, metric = "recurrenceRate", width = 500, height = 100, lineColor = "black", backgroundColor = "white" } = $props<{
      fixations: Fixation[];
      metric: "determinism" | "recurrenceRate";
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
