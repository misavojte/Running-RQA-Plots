<script lang="ts">
    let { values, width = 500, height = 100, lineColor = "black", backgroundColor = "transparent", margin = 0, colorFilling = [], showRisingPoints = false, enableColorFilling = true, colorFillingOpacity = 0.15, x = 0, y = 0 } = $props<{
      values: (number | null)[]; // Updated to allow null values
      width?: number;
      height?: number;
      lineColor?: string;
      backgroundColor?: string;
      margin?: number;
      colorFilling?: string[]; // New prop for segment colors
      enableColorFilling?: boolean; // New type definition
      colorFillingOpacity?: number; // New type definition
      showRisingPoints?: boolean;
      x?: number;
      y?: number;
    }>();
  
    // Compute the X-step for spacing the values equally
    const stepX = width / values.length;
  
    // Function to map a value (0-100) to a vertical position
    const mapValueToY = (value: number): number => {
      const usableHeight = height - (2 * margin);  // Account for top and bottom margins
      return (height - margin) - (value / 100) * usableHeight; // Start from height-margin
    };
  
    // Generate the polyline points string with stepwise segments and track rise points
    let polylinePoints = $derived(() => {
        let points: string[] = [];
        let lastValidIndex = -1;
        let risePoints: Array<{x: number, y: number, angle: number}> = [];
        let lastValue: number | null = null;

        // Find last valid point to know where to place the circle
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] !== null) {
                lastValidIndex = i;
                break;
            }
        }

        // Generate points and detect rises
        for (let i = 0; i <= lastValidIndex; i++) {
            const value = values[i];
            if (value !== null) {
                const x = i * stepX;
                const nextX = (i + 1) * stepX;
                const y = mapValueToY(value);
                points.push(`${x},${y}`);
                points.push(`${nextX},${y}`);

                // Check for rise
                if (lastValue !== null && value > lastValue) {
                    risePoints.push({
                        x: x,
                        y: y,
                        angle: 0  // Changed from 90 to 0 to point upward
                    });
                }
                lastValue = value;
            }
        }
        return { points: points.join(" "), risePoints };
    });

    // Calculate the end point coordinates for the circle
    let endPoint = $derived(() => {
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] !== null) {
                return {
                    x: (i + 1) * stepX,
                    y: mapValueToY(values[i])
                };
            }
        }
        return null;
    });

    // Generate segment data for colored rectangles
    let segments = $derived(() => {
        let segmentData = [];
        
        // Generate full-height segments for each value
        for (let i = 0; i < values.length; i++) {
            if (values[i] !== null) {
                segmentData.push({
                    x: i * stepX,
                    y: margin,  // Start from top margin
                    width: stepX,
                    height: height - (2 * margin),  // Full height minus margins
                    color: colorFilling[i] || 'gray'
                });
            }
        }
        return segmentData;
    });
</script>
  
<svg x={x} y={y} width={width} height={height} style="background: {backgroundColor};" >
    <!-- Background rectangle -->
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
    
    <!-- Color-filled segments with configurable opacity -->
    {#each segments() as segment}
        <rect   
            x={segment.x}
            y={segment.y}
            width={segment.width}
            height={segment.height}
            fill={segment.color}
            opacity={colorFillingOpacity}
        />
    {/each}

    {#key polylinePoints}
    <!-- RQA Value Line -->
    <polyline points={polylinePoints().points} fill="none" stroke={lineColor} stroke-width="2" />
    
    {#if showRisingPoints}
        {#each polylinePoints().risePoints as point}
            <circle 
                cx={point.x} 
            cy={point.y} 
            r="3" 
            fill={lineColor} 
            />
        {/each}
    {/if}
    {/key}
    {#if endPoint()}
        <!-- Circle at the end of the line -->
        <rect 
            x={endPoint()!.x - 3.5} 
            y={endPoint()!.y - 1.5} 
            width="3" 
            height="3" 
            stroke={lineColor} 
            stroke-width="1.5"
            fill="white"
        />
    {/if}
</svg>
  