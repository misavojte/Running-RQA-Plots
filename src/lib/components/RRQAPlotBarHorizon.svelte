<script lang="ts">
    let {
      series1,
      width = 500,
      height = 100,
      backgroundColor = "transparent",
      x = 0,
      y = 0,
      horizonSlicesColors = ["#aacfe3", "#0170ad"]
    } = $props<{
      series1: (number | null)[];
      width?: number;
      height?: number;
      backgroundColor?: string;
      colorPalette?: string[];
      horizonSlicesColors?: string[];
      x?: number;
      y?: number;
    }>();
  
    // Compute horizontal spacing based on the number of data points
    const stepX = width / series1.length;

    function scaleHeight(value: number, totalHeight: number, sliceIndex: number, numberOfSlices: number): number {
      if (value === 0) return 0;
      const GLOBAL_MAX_SERIES_VALUE = 100;
      const sliceMaxSeriesValue = GLOBAL_MAX_SERIES_VALUE;
      const sliceMinSeriesValue = (GLOBAL_MAX_SERIES_VALUE / numberOfSlices) * sliceIndex;
      if (value < sliceMinSeriesValue || value > sliceMaxSeriesValue) return 0;
      const sliceHeight = totalHeight;
      return (value - sliceMinSeriesValue) / (GLOBAL_MAX_SERIES_VALUE / numberOfSlices) * sliceHeight;
    }

    let segments = $derived.by(() => {
      
      let optimizedSlices: {color: string, innerPath: string}[][] = [];
      for (let sliceIndex = 0; sliceIndex < horizonSlicesColors.length; sliceIndex++) {
        let optimizedSegments: {color: string, innerPath: string}[] = [];
        let currentGroup = null;
        
        for (let i = 0; i < series1.length; i++) {
            if (series1[i] === null) {
            if (currentGroup) {
                optimizedSegments.push(currentGroup);
                currentGroup = null;
            }
            continue;
            }
            
            const rectHeight = scaleHeight(series1[i]!, height, sliceIndex, horizonSlicesColors.length);
            // Blend between colorPalette[0] and colorPalette[1]
            const blendedColor = horizonSlicesColors[sliceIndex];
            
            const xPos = i * stepX;
            const yPos = height - rectHeight; // Start from bottom
            
            if (!currentGroup || currentGroup.color !== blendedColor) {
            if (currentGroup) {
                optimizedSegments.push(currentGroup);
            }
            currentGroup = {
                color: blendedColor,
                innerPath: '',
            };
            }
            
            // Inner colored rectangle
            currentGroup.innerPath += currentGroup.innerPath ? ' M' : 'M';
            currentGroup.innerPath += ` ${xPos} ${yPos}`;
            currentGroup.innerPath += ` L ${xPos + stepX} ${yPos}`;
            currentGroup.innerPath += ` L ${xPos + stepX} ${height}`;
            currentGroup.innerPath += ` L ${xPos} ${height}`;
            currentGroup.innerPath += ' Z';
      }
      
      if (currentGroup) {
        optimizedSegments.push(currentGroup);
      }
      optimizedSlices.push(optimizedSegments);
      }
      return optimizedSlices;
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
  
  <!-- Colored paths -->
  {#each segments as slice}
    {#each slice as segment}
      <path d={segment.innerPath} fill={segment.color} />
    {/each}
  {/each}
</svg> 