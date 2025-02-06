<script lang="ts">
  import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
  import type { Fixation } from "../types/Fixation.js";

  let { fixations, size = 500, pointSize = 4, highlightColor = "blue", showGrid = false, gridColor = "#CCCCCC" } = $props<{
    fixations: Fixation[]; // Input fixations
    size?: number; // Canvas size
    pointSize?: number; // Dot size
    highlightColor?: string; // Highlight color on hover
    showGrid?: boolean; // Enable or disable grid
    gridColor?: string; // Grid line color
  }>();

  interface RecurrencePoint {
    x: number;
    y: number;
    i: number;
    j: number;
  }

  // Reactive hover state
  let hoverPoint: RecurrencePoint | null = $state(null);

  // Reactive recurrence matrix
  let recurrenceMatrix: number[][] = $state(computeRecurrenceMatrix(fixations));

  // Update recurrence matrix whenever fixations change
  $effect(() => {
    recurrenceMatrix = computeRecurrenceMatrix(fixations);
  });

  // Compute recurrence points reactively
  const points = $state((): RecurrencePoint[] => {
    const n = recurrenceMatrix.length;
    if (n === 0) return [];

    const cellSize = size / (n + 1); // Keep the cell size calculation for margins
    return recurrenceMatrix.flatMap((row: number[], i: number) =>
      row.map((value: number, j: number) => 
        value === 1 ? { 
          x: (j + 1) * cellSize, // Keep the starting margin
          y: (i + 1) * cellSize, // Keep the starting margin
          i, 
          j 
        } : null
      )
    ).filter((point: RecurrencePoint | null): point is RecurrencePoint => point !== null);
  });

  // Grid line positions (computed when showGrid is true)
  const gridLines = $state(() => {
    if (!showGrid) return [];
    const n = recurrenceMatrix.length;
    const cellSize = size / (n + 1);
    return Array.from({ length: n + 1 }, (_, i) => i * cellSize); // Back to n+2 for proper grid coverage
  });

  // Hover event handlers
  const handleHover = (point: RecurrencePoint) => {
    hoverPoint = point;
  };

  const clearHover = () => {
    hoverPoint = null;
  };
</script>

<svg 
  width={size} 
  height={size} 
  style="border: 1px solid black;"
  viewBox={`0 0 ${size} ${size}`}
>
  {#if showGrid}
    <!-- Draw vertical grid lines -->
    {#each gridLines() as x}
      <line x1={x} y1="0" x2={x} y2={size} stroke={gridColor} stroke-width="0.5" />
    {/each}

    <!-- Draw horizontal grid lines -->
    {#each gridLines() as y}
      <line x1="0" y1={y} x2={size} y2={y} stroke={gridColor} stroke-width="0.5" />
    {/each}
  {/if}

  <!-- Draw recurrence points -->
  {#each points() as point}
    <circle
      role="button"
      aria-label="Recurrence point"
      tabindex="-1"
      cx={point.x}
      cy={point.y}
      r={hoverPoint && hoverPoint.i === point.i && hoverPoint.j === point.j ? pointSize * 1.5 : pointSize}
      fill={hoverPoint && hoverPoint.i === point.i && hoverPoint.j === point.j ? highlightColor : "red"}
      onmouseover={() => handleHover(point)}
      onfocus={() => handleHover(point)}
      onmouseleave={clearHover}
      onblur={clearHover}
    />
  {/each}

  <!-- Display tooltip on hover -->
  {#if hoverPoint}
    <text x={hoverPoint.x + 10} y={hoverPoint.y - 10} font-size="12" fill="black">
      Fixation {hoverPoint.i} ↔ {hoverPoint.j}
    </text>
  {/if}
</svg>
