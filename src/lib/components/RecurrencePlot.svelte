<script lang="ts">
  import { computeRecurrenceMatrix } from "../utility/recurrenceMatrix.js";
  import type { Fixation } from "../types/Fixation.js";
	import type { Snippet } from "svelte";
  import RecurrencePlotLegend from "./RecurrencePlotLegend.svelte";
  import type { MatrixGenerator } from "../types/MatrixGenerator.ts";

  // SVG layout constants
  const MARGIN = 45;            // Equal margin on both sides
  const X_AXIS_HEIGHT = 40;     // Total height reserved for x-axis label
  const LABEL_OFFSET = 32;      // Distance of axis labels from plot
  const LEGEND_HEIGHT = 40;     // Base height for one row of legend items

  let { 
    fixations, 
    height = 600, 
    width = 500,
    pointSize = 4, 
    highlightColor = "#006FAD",
    showGrid = false, 
    gridColor = "#CCCCCC",
    xLabel = "Fixation i",
    yLabel = "Fixation j",
    labelStep = 5,  // Controls both labels and main grid
    showMainGrid = true,  // New prop for showing main grid lines
    aoiColors = [],  // Changed to array of objects
    tooltipSnippet = [],
    matrixGenerator = computeRecurrenceMatrix
  } = $props<{
    fixations: Fixation[];
    height?: number;
    width?: number;
    pointSize?: number;
    highlightColor?: string;
    showGrid?: boolean;
    gridColor?: string;
    xLabel?: string;
    yLabel?: string;

    labelStep?: number;
    showMainGrid?: boolean;
    aoiColors?: Array<{ aoi: string; color: string }>;  // New type for AOI colors
    tooltipSnippet?: Snippet<[aoi: string, fixationLabel: string]>;
    matrixGenerator?: MatrixGenerator;
  }>();

  interface RecurrencePoint {
    x: number;
    y: number;
    i: number;
    j: number;
    color: string;
  }

  // Reactive hover state
  let hoverPoint: RecurrencePoint | null = $state(null);

  // Reactive recurrence matrix
  let recurrenceMatrix: number[][] = $state(matrixGenerator(fixations));

  // Update recurrence matrix whenever fixations change
  $effect(() => {
    recurrenceMatrix = matrixGenerator(fixations);
  });

  // Compute the actual plot size based on available space
  const plotSize = $derived.by(() => {
    const availableWidth = width - (2 * MARGIN);  // Equal margins on both sides
    const availableHeight = height - X_AXIS_HEIGHT - LEGEND_HEIGHT;
    return Math.min(availableWidth, availableHeight);
  });

  // Compute the centering offsets using plotSize value directly
  const xOffset = $derived.by(() => MARGIN + (width - 2 * MARGIN - plotSize) / 2);
  const yOffset = $derived.by(() => (height - X_AXIS_HEIGHT - LEGEND_HEIGHT - plotSize) / 2);

  // Update points calculation to use plotSize value directly
  const points = $derived.by(() => {
    const n = recurrenceMatrix.length;
    if (n === 0) return [];

    const cellSize = plotSize / (n + 1);
    return recurrenceMatrix.flatMap((row: number[], i: number) =>
      row.map((value: number, j: number) => {
        if (value !== 1) return null;
        
        const currentAoi = fixations[i]?.aoi;
        const colorMapping = currentAoi ? aoiColors.find((ac: { aoi: string; color: string }) => ac.aoi === currentAoi[0]) : null;
        const pointColor = colorMapping?.color ?? '#000000';
        
        return { 
          x: xOffset + (j + 1) * cellSize,
          y: yOffset + plotSize - (i + 1) * cellSize,
          i, 
          j,
          color: pointColor
        };
      })
    ).filter((point: RecurrencePoint | null): point is RecurrencePoint => point !== null);
  });

  // Add new computed state for axis labels
  const axisLabels = $derived.by(() => {
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

  let hoverCircle: SVGElement | null = $state(null);

  let plotContainer: HTMLDivElement | null = $state(null);
</script>

<div class="plot-container" bind:this={plotContainer}>
        {#if hoverPoint && hoverCircle && plotContainer}
        <div 
          class="tooltip" 
          style="
            top: {hoverCircle.getBoundingClientRect().top - plotContainer.getBoundingClientRect().top + 15}px;
            left: {hoverCircle.getBoundingClientRect().left - plotContainer.getBoundingClientRect().left + 15}px;
          "
        >
          {@render tooltipSnippet(fixations[hoverPoint.i]?.aoi, `Fixation ${hoverPoint.i + 1} ↔ ${hoverPoint.j + 1}`)}
        </div>
        {/if}
        <svg 
          {width}
          {height}
          style="background: transparent;"
          viewBox="0 0 {width} {height}"
        >
          <defs>
            {#if showGrid}
              <pattern 
                id="grid" 
                width={plotSize / (recurrenceMatrix.length + 1)} 
                height={plotSize / (recurrenceMatrix.length + 1)} 
                patternUnits="userSpaceOnUse"
                patternTransform="translate({xOffset} {yOffset})"
              >
                <path 
                  d={`M ${plotSize / (recurrenceMatrix.length + 1)} 0 L 0 0 0 ${plotSize / (recurrenceMatrix.length + 1)}`}
                  fill="none" 
                  stroke={gridColor} 
                  stroke-width="1"
                  stroke-opacity="1"
                />
              </pattern>
            {/if}
            {#if showMainGrid}
              <pattern 
                id="mainGrid" 
                width={plotSize * labelStep / (recurrenceMatrix.length + 1)} 
                height={plotSize * labelStep / (recurrenceMatrix.length + 1)} 
                patternUnits="userSpaceOnUse"
                patternTransform="translate({xOffset} {yOffset})"
              >
                <path 
                  d={`M ${plotSize * labelStep / (recurrenceMatrix.length + 1)} 0 L 0 0 0 ${plotSize * labelStep / (recurrenceMatrix.length + 1)}`}
                  fill="none" 
                  stroke={gridColor} 
                  stroke-width="2"
                />
              </pattern>
            {/if}
          </defs>

          <!-- Main plot rectangle -->
          <rect
            x={xOffset}
            y={yOffset}
            width={plotSize}
            height={plotSize}
            fill="none"
            stroke="black"
            stroke-width="1"
          />

          <!-- Y-axis label -->
          <text
            x={xOffset - LABEL_OFFSET}
            y={yOffset + plotSize / 2}
            text-anchor="middle"
            font-size="12"
            transform={`rotate(-90 ${xOffset - LABEL_OFFSET} ${yOffset + plotSize / 2}) translate(0, ${LABEL_OFFSET/3})`}
          >
            {yLabel}
          </text>


          <!-- X-axis label -->
          <text
            x={xOffset + plotSize / 2}
            y={yOffset + plotSize + LABEL_OFFSET}
            text-anchor="middle"
            font-size="12"
          >
            {xLabel}
          </text>

          <!-- Grid layers -->
          <rect
            x={xOffset}
            y={yOffset}
            width={plotSize}
            height={plotSize}
            fill="url(#grid)"
          />
          {#if showMainGrid}
            <rect
              x={xOffset}
              y={yOffset}
              width={plotSize}
              height={plotSize}
              fill="url(#mainGrid)"
            />
          {/if}

          <!-- Draw recurrence points -->
          {#each points as point}
            <!-- Hover outline circle -->
            {#if hoverPoint && hoverPoint.i === point.i && hoverPoint.j === point.j}
              <circle
                bind:this={hoverCircle}
                cx={point.x}
                cy={point.y}
                r={pointSize + 3}
                fill="none"
                stroke={highlightColor}
                stroke-width="2"
              />
            {/if}
            <!-- Main point circle -->
            <circle
              role="button"
              aria-label="Recurrence point"
              tabindex="-1"
              cx={point.x}
              cy={point.y}
              r={pointSize}
              fill={point.color}
              onmouseover={() => handleHover(point)}
              onfocus={() => handleHover(point)}
              onmouseleave={clearHover}
              onblur={clearHover}
            />
          {/each}

          <!-- Axis labels -->
          {#each axisLabels as label}
            <text
              x={xOffset - 6}
              y={yOffset + plotSize - (label * (plotSize / (recurrenceMatrix.length + 1)))}
              text-anchor="end"
              dominant-baseline="middle"
              font-size="12"
            >
              {label}
            </text>
            <text
              x={xOffset + label * (plotSize / (recurrenceMatrix.length + 1))}
              y={yOffset + plotSize + 16}
              text-anchor="middle"
              font-size="12"
            >
              {label}
            </text>
          {/each}

          <!-- Origin label -->
          <text
            x={xOffset - 6}
            y={yOffset + plotSize + 16}
            text-anchor="middle"
            font-size="12"
          >
            0
          </text>

          <!-- Legend -->
          <RecurrencePlotLegend
            width={width}
            aoiColors={aoiColors}
            aoiColorsOpacity={1}
            height={LEGEND_HEIGHT}
            y={yOffset + plotSize + 40}
          />
        </svg>


      </div>

<style>
  .plot-container {
    position: relative;
  }
  
  .tooltip {
    position: absolute;
    z-index: 10;
    pointer-events: none;
  }
</style>
