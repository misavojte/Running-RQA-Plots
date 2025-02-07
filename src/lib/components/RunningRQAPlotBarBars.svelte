<script lang="ts">
    let { values, width = 500, height = 100, barColor = "black", backgroundColor = "transparent", margin = 2 } = $props<{
      values: number[]; // Array of values between 0 and 100
      width?: number; // Total width of the bar
      height?: number; // Total height of the bar
      barColor?: string; // Color of the bars
      backgroundColor?: string; // Background color
      margin?: number;  // Margin in pixels from top and bottom
    }>();
  
    // Compute the width of each bar based on the number of values
    const barWidth = $derived(() => width / values.length);
  
    // Function to map a value (0-100) to a bar height
    const mapValueToHeight = (value: number): number => {
      const usableHeight = height - (2 * margin);  // Account for top and bottom margins
      return (value / 100) * usableHeight; // Scale value to available height
    };
  
    // Generate the bars data
    const bars = $derived(() => {
        return values.map((value: number, index: number) => {
            const barHeight = mapValueToHeight(value);
            return {
                x: index * barWidth(),
                y: height - margin - barHeight, // Position from top
                width: barWidth(),
                height: barHeight
            };
        });
    });
</script>

<svg width={width} height={height} style="background: {backgroundColor};">
    <!-- Background rectangle -->
    <rect x="0" y="0" width={width} height={height} fill={backgroundColor} />
    
    <!-- Bars -->
    {#each bars() as bar}
        <rect 
            x={bar.x}
            y={bar.y}
            width={bar.width}
            height={bar.height}
            fill={barColor}
        />
    {/each}
</svg> 