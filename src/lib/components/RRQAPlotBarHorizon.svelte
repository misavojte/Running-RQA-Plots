<script lang="ts">
	import type { HorizonPlotBarVector } from "$lib/types/PlotMetric.js";

  let {
    width = 500,
    height = 100,
    backgroundColor = "transparent",
    x = 0,
    y = 0,
    // Color palettes for each series
    horizonSeries1,
    horizonSeries2 = null,
  } = $props<{
    horizonSeries1: HorizonPlotBarVector;
    horizonSeries2?: HorizonPlotBarVector | null;
    width?: number;
    height?: number;
    backgroundColor?: string;
    x?: number;
    y?: number;
  }>();

  // Compute horizontal spacing based on the number of data points.
  const stepX = width / horizonSeries1.values.length;
  const GLOBAL_MAX_SERIES_VALUE = 100;

  // Scaling function to compute bar height (for each color slice).
  // totalHeight is the drawing area for that series (half the total height if two series are present)
  function scaleHeight(
    value: number,
    totalHeight: number,
    sliceIndex: number,
    numberOfSlices: number
  ): number {
    if (value === 0) return 0;
    const sliceMaxSeriesValue = GLOBAL_MAX_SERIES_VALUE;
    const sliceMinSeriesValue = (GLOBAL_MAX_SERIES_VALUE / numberOfSlices) * sliceIndex;
    if (value < sliceMinSeriesValue || value > sliceMaxSeriesValue) return 0;
    return ((value - sliceMinSeriesValue) / (GLOBAL_MAX_SERIES_VALUE / numberOfSlices)) * totalHeight;
  }

  // Helper function to compute the optimized segments for a series.
  // - effectiveHeight is the drawing area height for the series.
  // - yOffset is the starting y-coordinate of that area.
  // - invert controls the vertical anchoring:
  //    • invert=false: bar is anchored at the bottom (yOffset + effectiveHeight - rectHeight)
  //    • invert=true: bar is anchored at the top (yOffset)
  function computeSeriesSegments(
    series: (number | null)[],
    colors: string[],
    effectiveHeight: number,
    yOffset: number,
    invert: boolean = false
  ): { color: string; innerPath: string }[][] {
    let slices: { color: string; innerPath: string }[][] = [];
    for (let sliceIndex = 0; sliceIndex < colors.length; sliceIndex++) {
      let optimizedSegments: { color: string; innerPath: string }[] = [];
      let currentGroup: { color: string; innerPath: string } | null = null;
      for (let i = 0; i < series.length; i++) {
        if (series[i] === null) {
          if (currentGroup) {
            optimizedSegments.push(currentGroup);
            currentGroup = null;
          }
          continue;
        }
        const rectHeight = scaleHeight(series[i]!, effectiveHeight, sliceIndex, colors.length);
        const color = colors[sliceIndex];
        const xPos = i * stepX;
        // For non-inverted bars (series1 in top half) we anchor at the bottom of its area.
        // For inverted bars (series2 in bottom half) we anchor at the top.
        const yPos = invert ? yOffset : yOffset + (effectiveHeight - rectHeight);
        const pathSegment = `M ${xPos} ${yPos} L ${xPos + stepX} ${yPos} L ${xPos + stepX} ${yPos + rectHeight} L ${xPos} ${yPos + rectHeight} Z`;
        if (!currentGroup || currentGroup.color !== color) {
          if (currentGroup) {
            optimizedSegments.push(currentGroup);
          }
          currentGroup = { color, innerPath: pathSegment };
        } else {
          currentGroup.innerPath += " " + pathSegment;
        }
      }
      if (currentGroup) {
        optimizedSegments.push(currentGroup);
      }
      slices.push(optimizedSegments);
    }
    return slices;
  }

  // Compute segments for series1 and, if provided, series2.
  let segments = $derived.by(() => {
    const hasSeries2 = horizonSeries2 && horizonSeries2.values.length > 0;
    let segments1, segments2 = null;

    if (hasSeries2) {
      // When two series are provided:
      // Series1 uses the top half.
      const effectiveHeight1 = height / 2;
      const yOffset1 = 0;
      segments1 = computeSeriesSegments(horizonSeries1.values, horizonSeries1.horizonSlicesColors, effectiveHeight1, yOffset1, false);
      
      // Series2 uses the bottom half and is drawn inverted.
      const effectiveHeight2 = height / 2;
      const yOffset2 = height / 2;
      segments2 = computeSeriesSegments(horizonSeries2.values, horizonSeries2.horizonSlicesColors, effectiveHeight2, yOffset2, true);
    } else {
      // If no series2, series1 takes the full height.
      segments1 = computeSeriesSegments(horizonSeries1.values, horizonSeries1.horizonSlicesColors, height, 0, false);
    }
    return { segments1, segments2 };
  });
</script>

<svg x={x} y={y} width={width} height={height} style="background: {backgroundColor};">
  <!-- Backdrop rectangle -->
  <rect 
    x="0" 
    y="0" 
    width={width} 
    height={height} 
    fill={backgroundColor} 
    stroke="lightgray" 
    stroke-width="1" 
  />
  
  <!-- Render Series 1 (Top Half if Series 2 is present, otherwise full height) -->
  {#each segments.segments1 as slice}
    {#each slice as segment}
      <path d={segment.innerPath} fill={segment.color} />
    {/each}
  {/each}
  
  <!-- Render Series 2 (Bottom Half) if provided -->
  {#if segments.segments2}
    {#each segments.segments2 as slice}
      {#each slice as segment}
        <path d={segment.innerPath} fill={segment.color} />
      {/each}
    {/each}
  {/if}
</svg>
