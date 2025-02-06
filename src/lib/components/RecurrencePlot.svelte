<script lang="ts">
  import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
  import type { Fixation } from "../types/Fixation.js";

  // SVG layout constants
  const Y_AXIS_WIDTH = 40;       // Total width reserved for y-axis label
  const X_AXIS_HEIGHT = 40;      // Total height reserved for x-axis label
  const LABEL_OFFSET = 40;       // Distance of axis labels from plot

  let { 
    fixations, 
    size = 500, 
    pointSize = 4, 
    highlightColor = "blue", 
    showGrid = false, 
    gridColor = "#CCCCCC",
    xLabel = "Fixation i",
    yLabel = "Fixation j",
    labelStep = 5  // New prop for controlling label frequency
  } = $props<{
    fixations: Fixation[];
    size?: number;
    pointSize?: number;
    highlightColor?: string;
    showGrid?: boolean;
    gridColor?: string;
    xLabel?: string;
    yLabel?: string;
    labelStep?: number;
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

    const cellSize = size / (n + 1);
    return recurrenceMatrix.flatMap((row: number[], i: number) =>
      row.map((value: number, j: number) => 
        value === 1 ? { 
          x: (j + 1) * cellSize,
          y: size - (i + 1) * cellSize, // Invert the y-coordinate
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

  // Add new computed state for axis labels
  const axisLabels = $state(() => {
    const n = recurrenceMatrix.length;
    if (n === 0) return [];
    // Start from 1 * labelStep to skip zero (will be added separately)
    return Array.from({ length: Math.floor(n / labelStep) }, (_, i) => (i + 1) * labelStep)
      .filter(val => val <= n);
  });

  // Hover event handlers
  const handleHover = (point: RecurrencePoint) => {
    hoverPoint = point;
  };

  const clearHover = () => {
    hoverPoint = null;
  };
</script>

<div style="position: relative;">
  <svg 
    width={size + Y_AXIS_WIDTH}
    height={size + X_AXIS_HEIGHT}
    style="background: transparent;"
    viewBox={`-${Y_AXIS_WIDTH} -${X_AXIS_HEIGHT} ${size + 2 * Y_AXIS_WIDTH} ${size + 2 * X_AXIS_HEIGHT}`}
  >
    <rect
      x="0"
      y="0"
      width={size}
      height={size}
      fill="none"
      stroke="black"
      stroke-width="1"
    />

    <!-- Y-axis label -->
    <text
      x={-LABEL_OFFSET}
      y={size / 2}
      text-anchor="middle"
      transform={`rotate(-90 -${LABEL_OFFSET} ${size / 2}) translate(0, 15)`}
    >
      {yLabel}
    </text>

    <!-- X-axis label -->
    <text
      x={size / 2}
      y={size + LABEL_OFFSET}
      text-anchor="middle"
    >
      {xLabel}
    </text>

    <!-- Translate the main plot content to accommodate labels -->
    <g transform="translate(0, 0)">
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

      <!-- Y-axis labels -->
      {#each axisLabels() as label}
        <text
          x="-6"
          y={size - (label * (size / (recurrenceMatrix.length + 1)))}
          text-anchor="end"
          dominant-baseline="middle"
          font-size="12"
        >
          {label}
        </text>
      {/each}

      <!-- X-axis labels -->
      {#each axisLabels() as label}
        <text
          x={label * (size / (recurrenceMatrix.length + 1))}
          y={size + 16}
          text-anchor="middle"
          font-size="12"
        >
          {label}
        </text>
      {/each}

      <!-- Single origin label (0) -->
      <text
        x="-6"
        y={size + 16}
        text-anchor="middle"
        font-size="12"
      >
        0
      </text>
    </g>
  </svg>
</div>
