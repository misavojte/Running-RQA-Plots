<script lang="ts">
    let {
      series1,
      series2,
      series3,
      width = 500,
      height = 100,
      backgroundColor = "transparent",
      x = 0,
      y = 0
    } = $props<{
      series1: (number | null)[];
      series2: (number | null)[];
      series3: (number | null)[];
      width?: number;
      height?: number;
      backgroundColor?: string;
      x?: number;
      y?: number;
    }>();
  
    // Modified: If current value is 0, always return 0 (zero/decrease)
    function getTrendValue(current: number | null, previous: number | null): number {
      if (current === 0) return 0;
      if (current === null || previous === null) return 50;
      const diff = current - previous;
      if (diff > 0) return 100;  // increase
      if (diff < 0) return 0;    // decrease
      return 50;                 // steady
    }
  
    // Transform series2 and series3 into trend-based values
    let transformedSeries = $derived(() => {
      const series2Trend = series2.map((val, i) =>
        i === 0 ? (val === 0 ? 0 : 50) : getTrendValue(val, series2[i - 1])
      );
      const series3Trend = series3.map((val, i) =>
        i === 0 ? (val === 0 ? 0 : 50) : getTrendValue(val, series3[i - 1])
      );
      return {
        series2: series2Trend,
        series3: series3Trend
      };
    });
  
    // Compute horizontal spacing based on the number of data points
    const stepX = width / series1.length;
  
    // Define gradients for color interpolation
    const gradient1 = { start: '#f7fbff', end: '#3182bd' };
    const gradient2 = { start: '#fff5f0', end: '#cb181d' };
  
    // Get color based on trend value (0, 50, or 100)
    function getColorForTrend(gradient: { start: string, end: string }, trendValue: number) {
      switch (trendValue) {
        case 0:  return gradient.start;
        case 50: return interpolateColor(gradient.start, gradient.end, 0.5);
        case 100: return gradient.end;
        default: return gradient.start;
      }
    }
  
    let segments = $derived(() => {
      let segments = [];
      for (let i = 0; i < series1.length; i++) {
        if (series1[i] === null || series2[i] === null || series3[i] === null) continue;
        // Use series1 for height, transformed series2/series3 for color trends
        const rectHeight = (series1[i]! / 100) * height;
        const color1 = getColorForTrend(gradient1, transformedSeries().series2[i]);
        const color2 = getColorForTrend(gradient2, transformedSeries().series3[i]);
        const blendedColor = blendColors(color1, color2);
        segments.push({
          x: i * stepX,
          y: (height - rectHeight) / 2,
          width: stepX,
          height: rectHeight,
          color: blendedColor
        });
      }
      return segments;
    });
  
    // Interpolate between two colors
    function interpolateColor(startColor: string, endColor: string, ratio: number) {
      const start = hexToRgb(startColor);
      const end = hexToRgb(endColor);
      return `rgb(${Math.round(start.r + (end.r - start.r) * ratio)}, ${
        Math.round(start.g + (end.g - start.g) * ratio)
      }, ${Math.round(start.b + (end.b - start.b) * ratio)})`;
    }
  
    // Blend two colors by averaging their RGB values
    function blendColors(color1: string, color2: string) {
      // Convert hex to rgb if color starts with #
      const rgb1 = color1.startsWith('#') ? hexToRgbString(color1) : color1;
      const rgb2 = color2.startsWith('#') ? hexToRgbString(color2) : color2;
      
      const parsed1 = parseRgb(rgb1);
      const parsed2 = parseRgb(rgb2);
      
      const blended = {
        r: Math.round((parsed1.r + parsed2.r) / 2),
        g: Math.round((parsed1.g + parsed2.g) / 2),
        b: Math.round((parsed1.b + parsed2.b) / 2)
      };
      return `rgb(${blended.r}, ${blended.g}, ${blended.b})`;
    }
  
    // Helper function to convert hex to RGB string
    function hexToRgbString(hex: string) {
      const rgb = hexToRgb(hex);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }
  
    // Helper function to parse an rgb() string
    function parseRgb(color: string) {
      const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!matches) throw new Error('Invalid RGB color format');
      return {
        r: parseInt(matches[1]),
        g: parseInt(matches[2]),
        b: parseInt(matches[3])
      };
    }
  
    // Helper function to convert hex to RGB
    function hexToRgb(hex: string) {
      const bigint = parseInt(hex.slice(1), 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
      };
    }
  </script>
  
  <svg x={x} y={y} width={width} height={height} style="background: {backgroundColor};">
    <!-- Backdrop rectangle -->
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
  
    <!-- Render rectangles with blended colors -->
    {#each segments() as segment (segment.x)}
      <rect 
        x={segment.x}
        y={segment.y}
        width={segment.width}
        height={segment.height}
        fill={segment.color} />
    {/each}
  
    <!-- Legend -->
    <g transform="translate({width - 80}, {height - 80})">
      <rect x="0" y="0" width="20" height="20" 
            fill={blendColors(
              getColorForTrend(gradient1, 0),
              getColorForTrend(gradient2, 0)
            )} />
      <text x="25" y="15" font-size="10">Dec,Dec</text>
  
      <rect x="0" y="25" width="20" height="20" 
            fill={blendColors(
              getColorForTrend(gradient1, 100),
              getColorForTrend(gradient2, 0)
            )} />
      <text x="25" y="40" font-size="10">Inc,Dec</text>
  
      <rect x="0" y="50" width="20" height="20" 
            fill={blendColors(
              getColorForTrend(gradient1, 0),
              getColorForTrend(gradient2, 100)
            )} />
      <text x="25" y="65" font-size="10">Dec,Inc</text>
  
      <rect x="0" y="75" width="20" height="20" 
            fill={blendColors(
              getColorForTrend(gradient1, 100),
              getColorForTrend(gradient2, 100)
            )} />
      <text x="25" y="90" font-size="10">Inc,Inc</text>
    </g>
  </svg>
  