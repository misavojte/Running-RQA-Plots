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
  
    // Compute horizontal spacing based on the number of data points
    const stepX = width / series1.length;

    // Define start and end colors for each gradient
    const gradient1 = {
      start: '#f7fbff',
      end: '#3182bd'
    };
    const gradient2 = {
      start: '#fff5f0',
      end: '#cb181d'
    };
  
    let segments = $derived(() => {
      let segments = [];
      for (let i = 0; i < series1.length; i++) {
        if (series1[i] === null || series2[i] === null || series3[i] === null) continue;
        const rectHeight = (series1[i]! / 100) * height;
        
        // Calculate colors using linear interpolation based on normalized values
        const color1 = interpolateColor(gradient1.start, gradient1.end, series2[i]! / 100);
        const color2 = interpolateColor(gradient2.start, gradient2.end, series3[i]! / 100);
        
        // Blend the two colors
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

    // Function to interpolate between two colors
    function interpolateColor(startColor: string, endColor: string, ratio: number) {
      const start = hexToRgb(startColor);
      const end = hexToRgb(endColor);
      
      return `rgb(${
        Math.round(start.r + (end.r - start.r) * ratio)
      }, ${
        Math.round(start.g + (end.g - start.g) * ratio)
      }, ${
        Math.round(start.b + (end.b - start.b) * ratio)
      })`;
    }

    // Function to blend two colors
    function blendColors(color1: string, color2: string) {
      // Since we're now working with rgb strings, we need to parse them
      const rgb1 = parseRgb(color1);
      const rgb2 = parseRgb(color2);
      
      const blended = {
        r: Math.round((rgb1.r + rgb2.r) / 2),
        g: Math.round((rgb1.g + rgb2.g) / 2),
        b: Math.round((rgb1.b + rgb2.b) / 2)
      };
      return `rgb(${blended.r}, ${blended.g}, ${blended.b})`;
    }

    // Helper function to parse RGB string
    function parseRgb(color: string) {
      const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!matches) throw new Error('Invalid RGB color format');
      return {
        r: parseInt(matches[1]),
        g: parseInt(matches[2]),
        b: parseInt(matches[3])
      };
    }

    // Helper function to convert hex to RGB (keep this for the initial gradient colors)
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
      <!-- Min-Min -->
      <rect x="0" y="0" width="20" height="20" 
            fill={blendColors(
              interpolateColor(gradient1.start, gradient1.end, 0),
              interpolateColor(gradient2.start, gradient2.end, 0)
            )} />
      <text x="25" y="15" font-size="10">Min,Min</text>

      <!-- Max-Min -->
      <rect x="0" y="25" width="20" height="20" 
            fill={blendColors(
              interpolateColor(gradient1.start, gradient1.end, 1),
              interpolateColor(gradient2.start, gradient2.end, 0)
            )} />
      <text x="25" y="40" font-size="10">Max,Min</text>

      <!-- Min-Max -->
      <rect x="0" y="50" width="20" height="20" 
            fill={blendColors(
              interpolateColor(gradient1.start, gradient1.end, 0),
              interpolateColor(gradient2.start, gradient2.end, 1)
            )} />
      <text x="25" y="65" font-size="10">Min,Max</text>

      <!-- Max-Max -->
      <rect x="0" y="75" width="20" height="20" 
            fill={blendColors(
              interpolateColor(gradient1.start, gradient1.end, 1),
              interpolateColor(gradient2.start, gradient2.end, 1)
            )} />
      <text x="25" y="90" font-size="10">Max,Max</text>
    </g>
  </svg>


  