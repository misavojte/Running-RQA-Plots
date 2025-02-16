<script lang="ts">
	import RrqaPlotBarHorizon from "./RRQAPlotBarHorizon.svelte";
	import type { HorizonPlotBarVector } from "$lib/types/PlotMetric.js";

    let { 
        width, 
        y, 
        height, 
        barHeight,
        horizonSeries1,
        horizonSeries2,
        label1,
        label2,
    } = $props<{
        width: number;
        y: number;
        height: number;
        barHeight: number;
        lineColor?: string;
        colorPalette?: string;
        label1: string;
        label2?: string;
        horizonSeries1: HorizonPlotBarVector;
        horizonSeries2?: HorizonPlotBarVector | null;
    }>();

    const EXAMPLE_BAR_WIDTH = 80;
    const EXAMPLE_BAR_HEIGHT = 40;
    const SMALL_BAR_WIDTH = 40;
    const SMALL_BAR_HEIGHT = 20;
    const TEXT_OFFSET = 10;
    const SPACING = 5;
    
    // Center the main example in the available width
    const centerX = width / 2;
    const barX = centerX - EXAMPLE_BAR_WIDTH / 2;
    
    // Calculate slice size
    const sliceSize = 100 / horizonSeries1.horizonSlicesColors.length;

    // Create range examples
    const rangeExamples = Array(horizonSeries1.horizonSlicesColors.length).fill(0).map((_, i) => {
        const value = sliceSize * (i + 1)
        return {
            value,
            range: `${Math.round(value - sliceSize)}-${Math.round(value)}`
        };
    });

    // Center range examples
    const totalRangeWidth = (SMALL_BAR_WIDTH + SPACING) * horizonSeries1.horizonSlicesColors.length;
    const rangeStartX = (width - totalRangeWidth) / 2;

    const fakeHorizonSeries1: HorizonPlotBarVector = $derived.by(() => ({
        values: [15, 35, 45, 80, 90, 75, 60, 40, 20, 10],
        horizonSlicesColors: horizonSeries1.horizonSlicesColors
    }));

    const fakeHorizonSeries2: HorizonPlotBarVector | null = $derived.by(() => {
        if (horizonSeries2) {
            return {
                values: [5, 10, 28, 40, 56, 70, 52, 48, 44, 38],
                horizonSlicesColors: horizonSeries2.horizonSlicesColors
            };
        }
        return null;
    });
    
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
                horizonSeries1={fakeHorizonSeries1}
                horizonSeries2={fakeHorizonSeries2}
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
        >{horizonSeries2 ? "max value 1" : "max value"}</text>
        
        {#if horizonSeries2}
            <line 
                x1={-5} 
                y1={EXAMPLE_BAR_HEIGHT/2} 
                x2={-2} 
                y2={EXAMPLE_BAR_HEIGHT/2} 
                stroke="black" 
                stroke-width="1"
            />
            <text 
                x={-8} 
                y={EXAMPLE_BAR_HEIGHT/2} 
                text-anchor="end" 
                dominant-baseline="middle" 
                font-size="10px"
            >min value 1,2</text>
            
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
            >max value 2</text>
        {:else}
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
            >min value</text>
        {/if}
    </g>

    <!-- Explanation text -->
    <text 
        x={centerX} 
        y={90} 
        font-size="12px" 
        fill="black"
        text-anchor="middle"
    >
        {horizonSeries1.horizonSlicesColors.length} slices, darker color indicates higher value
    </text>

    <text
        x={centerX}
        y={110}
        font-size="12px"
        fill="black"
        text-anchor="middle"
    >
        {horizonSeries2 ? `${label1} (1)` : label1}
    </text>


    <!-- Range examples -->
    {#each rangeExamples as example, i}
        <g transform={`translate(${rangeStartX + i * (SMALL_BAR_WIDTH + SPACING)}, 120)`}>
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
                    fill={horizonSeries1.horizonSlicesColors[i]}
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
    {#if horizonSeries2}
        <!-- Range examples -->
        {#each rangeExamples as example, i}
            <g transform={`translate(${rangeStartX + i * (SMALL_BAR_WIDTH + SPACING)}, 158)`}>
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
                    fill={horizonSeries2.horizonSlicesColors[i]}
                />
            </g>
        {/each}
        <text
            x={centerX}
            y={190}
            font-size="12px"
            fill="black"
            text-anchor="middle"
        >{label2} (2)</text>
    {/if}
</svg> 