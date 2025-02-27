<script lang="ts">
    let {
      series1,
      series2,
      series3,
      width = 500,
      height = 100,
      backgroundColor = "transparent",
      colorPalette = [
        ["#d3d3d3", "#b75252"],
        ["#5c9cad", "#4e3d42"],
      ],
      hideDoubleIncrease = false,
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
  
    const PADDING = 6; // Configurable padding value

    function scaleHeight(value: number, totalHeight: number): number {
      if (value === 0) return 0;
      return PADDING + ((value / 100) * (totalHeight - (2 * PADDING)));
    }

    interface Point {
      x: number;
      y: number;
      height: number;
    }

    let segments = $derived.by(() => {
      let optimizedSegments = [];
      let currentGroup = null;
      let backgroundPath = '';
      
      for (let i = 0; i < series1.length; i++) {
        if (series1[i] === null || series2[i] === null || series3[i] === null) {
          if (currentGroup) {
            optimizedSegments.push(currentGroup);
            currentGroup = null;
          }
          continue;
        }
        
        const rectHeight = scaleHeight(series1[i]!, height);
        const color = effectiveColorPalette()[series2[i]][series3[i]];
        const xPos = i * stepX;
        const yPos = (height - rectHeight) / 2;
        
        // Add to background path
        backgroundPath += backgroundPath ? ' M' : 'M';
        backgroundPath += ` ${xPos - PADDING/8} ${yPos - PADDING/8}`;
        backgroundPath += ` L ${xPos + stepX + PADDING/4} ${yPos - PADDING/8}`;
        backgroundPath += ` L ${xPos + stepX + PADDING/4} ${yPos + rectHeight + PADDING/8}`;
        backgroundPath += ` L ${xPos - PADDING/8} ${yPos + rectHeight + PADDING/8}`;
        backgroundPath += ' Z';
        
        if (!currentGroup || currentGroup.color !== color) {
          if (currentGroup) {
            optimizedSegments.push(currentGroup);
          }
          currentGroup = {
            color,
            x: xPos,
            y: yPos,
            width: stepX,
            height: rectHeight,
            innerPath: '',
            points: [] as Point[]
          };
        }
        
        // Inner colored rectangle - precise positioning
        currentGroup.innerPath += currentGroup.innerPath ? ' M' : 'M';
        currentGroup.innerPath += ` ${xPos} ${yPos}`;
        currentGroup.innerPath += ` L ${xPos + stepX} ${yPos}`;
        currentGroup.innerPath += ` L ${xPos + stepX} ${yPos + rectHeight}`;
        currentGroup.innerPath += ` L ${xPos} ${yPos + rectHeight}`;
        currentGroup.innerPath += ' Z';
        
        currentGroup.points.push({ x: xPos, y: yPos, height: rectHeight });
      }
      
      if (currentGroup) {
        optimizedSegments.push(currentGroup);
      }
      
      return {
        segments: optimizedSegments,
        backgroundPath
      };
    });

    // Replace backgroundSegments with backgroundPaths
    let backgroundPaths = $derived.by(() => {
      let currentPath = null;
      let optimizedPaths = [];
      
      for (let i = 0; i < series1.length; i++) {
        if (series1[i] === null) {
          if (currentPath) {
            optimizedPaths.push(currentPath);
            currentPath = null;
          }
          continue;
        }
        
        const color = colorFilling[i] || 'gray';
        
        if (!currentPath || currentPath.color !== color) {
          if (currentPath) {
            optimizedPaths.push(currentPath);
          }
          currentPath = {
            color,
            path: `M ${i * stepX} 0`,
            opacity: colorFillingOpacity
          };
        }
        
        // Add rectangle to path
        currentPath.path += ` L ${(i + 1) * stepX} 0`;
        currentPath.path += ` L ${(i + 1) * stepX} ${height}`;
        currentPath.path += ` L ${i * stepX} ${height}`;
        currentPath.path += ' Z';
      }
      
      if (currentPath) {
        optimizedPaths.push(currentPath);
      }
      
      return optimizedPaths;
    });
  </script>
  
  <svg x={x} y={y} width={width} height={height} style="background: {backgroundColor};">
    <!-- Backdrop rectangle --> 
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} stroke="lightgray" stroke-width="1" />
  
    <!-- Background color paths -->
    {#if colorFilling}
      {#each backgroundPaths as bgPath}
        <path 
          d={bgPath.path}
          fill={bgPath.color}
          opacity={bgPath.opacity}
        />
      {/each}
    {/if}
    
    <!-- Single white background path -->
    <path d={segments.backgroundPath} fill="white" />
    
    <!-- Colored paths -->
    {#each segments.segments as segment}
      <path d={segment.innerPath} fill={segment.color} />
    {/each}
  </svg>
  