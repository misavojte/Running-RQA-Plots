<script lang="ts">
    let {
      series1,
      series2,
      series3,
      width = 500,
      height = 100,
      backgroundColor = "transparent",
      colorPalette = [
        ["#d3d3d3", "#5c9cad"],
        ["#b75252", "#4e3d42"],
      ],
      hideDoubleIncrease = true,
      colorFilling = [],
      colorFillingOpacity = 0.15,
      x = 0,
      y = 0
    } = $props<{
      series1: (number | null)[];
      series2: (0 | 1 | null)[];
      series3: (0 | 1 | null)[];
      width?: number;
      height?: number;
      backgroundColor?: string;
      colorPalette?: string[][];
      hideDoubleIncrease?: boolean;
      colorFilling?: string[] | null;
      colorFillingOpacity?: number;
      x?: number;
      y?: number;
    }>();
  
    // Compute horizontal spacing based on the number of data points
    const stepX = width / series1.length;

    let effectiveColorPalette = $derived(() => {
      if (hideDoubleIncrease) {
        const copiedColorPalette = colorPalette.map((row: string[]) => [...row]);
        copiedColorPalette[1][1] = colorPalette[0][0];
        return copiedColorPalette;
      }
      return colorPalette;
    });
  
    let segments = $derived(() => {
      let segments = [];
      for (let i = 0; i < series1.length; i++) {
        if (series1[i] === null || series2[i] === null || series3[i] === null) continue;
        // Use series1 for height, transformed series2/series3 for color trends
        const rectHeight = (series1[i]! / 100) * height;
        segments.push({
          x: i * stepX,
          y: (height - rectHeight) / 2,
          width: stepX,
          height: rectHeight,
          color: effectiveColorPalette()[series2[i]][series3[i]]
        });
      }
      return segments;
    });

    // Add new derived store for background segments
    let backgroundSegments = $derived(() => {
      let segmentData = [];
      for (let i = 0; i < series1.length; i++) {
        if (series1[i] !== null) {
          segmentData.push({
            x: i * stepX,
            y: 0,
            width: stepX,
            height: height,
            color: colorFilling[i] || 'gray'
          });
        }
      }
      return segmentData;
    });
  </script>
  
  <svg x={x} y={y} width={width} height={height} style="background: {backgroundColor};">
    <!-- Backdrop rectangle -->
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
  
    <!-- Background color segments -->
    {#if colorFilling}
      {#each backgroundSegments() as segment}
        <rect 
          x={segment.x}
          y={segment.y}
          width={segment.width}
          height={segment.height}
          fill={segment.color}
          opacity={colorFillingOpacity}
        />
      {/each}
    {/if}
  
    <!-- Render rectangles with blended colors -->
    {#each segments() as segment (segment.x)}
      <rect 
        x={segment.x}
        y={segment.y}
        width={segment.width}
        height={segment.height}
        fill={segment.color} />
    {/each}
  </svg>
  