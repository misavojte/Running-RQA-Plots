<script lang="ts">
    let { values, width = 500, height = 100, lineColor = "black", backgroundColor = "transparent", margin = 0 } = $props<{
      values: (number | null)[]; // Updated to allow null values
      width?: number;
      height?: number;
      lineColor?: string;
      backgroundColor?: string;
      margin?: number;
    }>();
  
    // Compute the X-step for spacing the values equally
    const stepX = width / values.length;
  
    // Function to map a value (0-100) to a vertical position
    const mapValueToY = (value: number): number => {
      const usableHeight = height - (2 * margin);  // Account for top and bottom margins
      return (height - margin) - (value / 100) * usableHeight; // Start from height-margin
    };
  
    // Generate the polyline points string with stepwise segments
    // if there are values 25 and 26, and the width of one segment is 100, the polyline points should be:
    // 0,25 100,25 100,26 200,26
    let polylinePoints = $derived(() => {
        let points: string[] = [];
        let lastValidIndex = -1;

        // Find last valid point to know where to place the circle
        for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] !== null) {
                lastValidIndex = i;
                break;
            }
        }

        // Generate points only for non-null values
        for (let i = 0; i <= lastValidIndex; i++) {
            const value = values[i];
            if (value !== null) {
                const x = i * stepX;
                const nextX = (i + 1) * stepX;
                const y = mapValueToY(value);
                points.push(`${x},${y}`);
                points.push(`${nextX},${y}`);
            }
        }
        return points.join(" ");
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
</script>
  
<svg width={width} height={height} style="background: {backgroundColor};">
    <!-- Background rectangle -->
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
    {#key polylinePoints}
    <!-- RQA Value Line -->
    <polyline points={polylinePoints()} fill="none" stroke={lineColor} stroke-width="1" />
    {/key}
    {#if endPoint() !== null}
        <!-- Circle at the end of the line -->
        <circle cx={endPoint().x - 2} cy={endPoint().y} r="2" fill={lineColor} />
    {/if}
</svg>
  