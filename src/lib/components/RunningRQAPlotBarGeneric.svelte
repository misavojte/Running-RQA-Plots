<script lang="ts">
    let { values, width = 500, height = 100, lineColor = "black", backgroundColor = "transparent", margin = 2 } = $props<{
      values: number[]; // Array of values between 0 and 100
      width?: number; // Total width of the bar
      height?: number; // Total height of the bar
      lineColor?: string; // Color of the RQA line
      backgroundColor?: string; // Background color
      margin?: number;  // Margin in pixels from top and bottom
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
        values.forEach((value: number, index: number) => {
            const x = index * stepX;
            const nextX = (index + 1) * stepX;
            const y = mapValueToY(value);
            points.push(`${x},${y}`);
            points.push(`${nextX},${y}`);
        });
        return points.join(" ");
    });
  </script>
  
  <svg width={width} height={height} style="background: {backgroundColor};">
    <!-- Background rectangle -->
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
    {#key polylinePoints}
    <!-- RQA Value Line -->
    <polyline points={polylinePoints()} fill="none" stroke={lineColor} stroke-width="1" />
    {/key}
  </svg>
  