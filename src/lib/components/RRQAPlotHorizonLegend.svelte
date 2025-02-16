<script lang="ts">
	import RrqaPlotBarHorizon from "./RRQAPlotBarHorizon.svelte";

    let { 
        width, 
        y, 
        height, 
        barHeight,
        horizonSlicesColors = ["#aacfe3", "#0170ad"]
    } = $props<{
        width: number;
        y: number;
        height: number;
        barHeight: number;
        lineColor?: string;
        colorPalette?: string;
        horizonSlicesColors?: string[];
    }>();

    const EXAMPLE_BAR_WIDTH = 80;
    const EXAMPLE_BAR_HEIGHT = 40;
    const SMALL_BAR_WIDTH = 40;
    const SMALL_BAR_HEIGHT = 20;
    const TEXT_OFFSET = 10;
    const SPACING = 15;
    
    // Center the main example in the available width
    const centerX = width / 2;
    const barX = centerX - EXAMPLE_BAR_WIDTH / 2;
    
    // Calculate slice size
    const sliceSize = 100 / horizonSlicesColors.length;

    // Create range examples
    const rangeExamples = Array(horizonSlicesColors.length).fill(0).map((_, i) => {
        const value = sliceSize * (i + 1);
        const activeSlices = i + 1;
        return {
            value,
            slices: Array(activeSlices).fill(0).map((_, j) => ({
                opacity: (1 / horizonSlicesColors.length - 0.001) * (j + 1)
            })),
            range: `${Math.round(value - sliceSize)}-${Math.round(value)}`
        };
    });

    // Center range examples
    const totalRangeWidth = (SMALL_BAR_WIDTH + SPACING) * horizonSlicesColors.length;
    const rangeStartX = (width - totalRangeWidth) / 2;
</script>

<svg x={0} y={y} width={width} height={height}>
    <!-- Main example showing all bands -->
    <g transform={`translate(${barX}, 25)`}>
        <!-- Background rectangle -->
        <rect 
            width={EXAMPLE_BAR_WIDTH} 
            height={EXAMPLE_BAR_HEIGHT} 
            fill="white" 
            stroke="lightgray"
        />
        
        <!-- Horizon bands -->
        
            <RrqaPlotBarHorizon
                width={EXAMPLE_BAR_WIDTH}
                height={EXAMPLE_BAR_HEIGHT}
                series1={[15, 35, 45, 80, 90, 75, 60, 40, 20, 10]}
                horizonSlicesColors={horizonSlicesColors}
            />

        <!-- Value indicators -->
        <line 
            x1={-5} 
            y1={0} 
            x2={-2} 
            y2={0} 
            stroke="black" 
            stroke-width="1"
        />
        <text 
            x={-8} 
            y={0} 
            text-anchor="end" 
            dominant-baseline="middle" 
            font-size="10px"
        >max value of the slice</text>
        
        <line 
            x1={-5} 
            y1={EXAMPLE_BAR_HEIGHT} 
            x2={-2} 
            y2={EXAMPLE_BAR_HEIGHT} 
            stroke="black" 
            stroke-width="1"
        />
        <text 
            x={-8} 
            y={EXAMPLE_BAR_HEIGHT} 
            text-anchor="end" 
            dominant-baseline="middle" 
            font-size="10px"
        >min value of the slice</text>
    </g>

    <!-- Explanation text -->
    <text 
        x={centerX} 
        y={90} 
        font-size="12px" 
        fill="black"
        text-anchor="middle"
    >
        {horizonSlicesColors.length} bands, darker color indicates higher value:
    </text>

    <!-- Range examples -->
    {#each rangeExamples as example, i}
        <g transform={`translate(${rangeStartX + i * (SMALL_BAR_WIDTH + SPACING)}, 100)`}>
            <!-- Background rectangle -->
            <rect 
                width={SMALL_BAR_WIDTH} 
                height={SMALL_BAR_HEIGHT} 
                fill="white" 
                stroke="lightgray"
            />
            
                <rect 
                    width={SMALL_BAR_WIDTH} 
                    height={SMALL_BAR_HEIGHT} 
                    fill={horizonSlicesColors[i]}
                    opacity={example.slices[i].opacity}
                />

            <!-- Range text -->
            <text 
                x={SMALL_BAR_WIDTH/2} 
                y={SMALL_BAR_HEIGHT + 12} 
                text-anchor="middle" 
                font-size="10px" 
                fill="black"
            >
                {example.range}
            </text>
        </g>
    {/each}
</svg> 