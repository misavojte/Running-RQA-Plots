<script lang="ts">
    import RunningRQAPlotBarGeneric from "./RunningRQAPlotBarLine.svelte";

    let { width, y, height, barHeight, lineColor="black", aoiColors = [], aoiColorsOpacity = 0.2, showRisingPoints = false } = $props<{
        width: number;
        y: number;
        height: number;
        barHeight: number;
        lineColor?: string;
        aoiColors?: Array<{ aoi: string; color: string }>;
        aoiColorsOpacity?: number;
        showRisingPoints?: boolean;
    }>();

    const BAR_WIDTH = 50;
    const LEFT_LABEL_MIN_HEIGHT = 42;
    const RIGHT_LABEL_MIN_HEIGHT = LEFT_LABEL_MIN_HEIGHT;
    let barX = $derived.by(() => width / 2 - BAR_WIDTH / 2);
    
    // Calculate positions for the diagonal line
    let lineStartX = $derived.by(() => barX + BAR_WIDTH / 3);  // First segment boundary
    let lineStartY = $derived.by(() => barHeight * 0.7);
    let lineLength = $derived.by(() => barHeight * 0.3 + 10);
    let lineEndX = $derived.by(() => lineStartX - lineLength - 10);  // Move left
    let line2X = $derived.by(() => lineStartX + BAR_WIDTH / 6);
    let line2StartY = $derived.by(() => barHeight * 0.85);
    let line2Length = $derived.by(() => barHeight * 0.15 + 10);
    let line2EndY = $derived.by(() => line2StartY + line2Length);
    let line3StartX = $derived.by(() => barX + BAR_WIDTH);
    let line3Y = $derived.by(() => barHeight * 0.78);
    let line3EndX = $derived.by(() => line3StartX + 10);

    // Add new constants for AOI legend
    const AOI_LEGEND_START_Y = $derived.by(() => line2EndY + 28);
    const AOI_LEGEND_CIRCLE_RADIUS = 4;
    const AOI_LEGEND_TEXT_OFFSET = 10;
    const AOI_LEGEND_LINE_HEIGHT = 20;
    const AOI_LEGEND_MAX_WIDTH = width - 20;
    const CHAR_WIDTH = 7;  // Estimated width per character in pixels
    const BASE_ITEM_WIDTH = 25;  // Width needed for circle and padding

    // Calculate dynamic item width based on longest AOI name
    let ITEM_WIDTH = $derived.by(() => {
        const maxLabelLength = Math.max(...aoiColors.map((item: { aoi: string; color: string }) => item.aoi.length));
        const estimatedWidth = BASE_ITEM_WIDTH + (maxLabelLength * CHAR_WIDTH);
        return Math.min(estimatedWidth, 150);  // Cap at 150px
    });

    const ITEMS_PER_ROW = $derived.by(() => Math.floor(AOI_LEGEND_MAX_WIDTH / ITEM_WIDTH));

    // Calculate positions for AOI legend items
    let aoiLegendItems = $derived.by(() => {
        const itemWidth = ITEM_WIDTH;
        const totalWidth = Math.min(aoiColors.length, ITEMS_PER_ROW) * itemWidth;
        const startX = width / 2 - totalWidth / 2;
        
        return aoiColors.map((item: { aoi: string; color: string }, index: number) => {
            const row = Math.floor(index / ITEMS_PER_ROW);
            const col = index % ITEMS_PER_ROW;
            
            return {
                ...item,
                x: startX + (col * itemWidth),
                y: AOI_LEGEND_START_Y + (row * AOI_LEGEND_LINE_HEIGHT)
            };
        });
    });
</script>

<svg x={0} y={y} width={width} height={height} viewBox={`0 -20 ${width} ${height}`}>
    <RunningRQAPlotBarGeneric 
        values={[0, 30, 20]} 
        width={BAR_WIDTH}
        height={barHeight}
        backgroundColor="transparent"
        margin={1}
        lineColor={lineColor}
        x={barX}
        y={0}
        colorFilling={["red", "red", "red"]}
    />
    {#if showRisingPoints}
    <line
        x1={lineStartX}
        y1={lineStartY}
        x2={lineEndX}
        y2={lineStartY}
        stroke="black"
        stroke-dasharray="3 3"
        stroke-width="1"
    />
    <text 
        x={lineEndX - 2} 
        y={barHeight - 42}
        text-anchor="end"
        dominant-baseline="hanging"
        font-size="10px"
        fill="black"
    >
        <tspan x={lineEndX - 2} dy="0">shows</tspan>
        <tspan x={lineEndX - 2} dy="14">metric</tspan>
            <tspan x={lineEndX - 2} dy="14">increase</tspan>
        </text>
    {/if}
    <line
        x1={line2X}
        y1={line2StartY}
        x2={line2X}
        y2={line2EndY}
        stroke="black"
        stroke-dasharray="3 3"
        stroke-width="1"
    />
    <text 
        x={line2X} 
        y={line2EndY + 12}
        text-anchor="middle"
        dominant-baseline="top"
        font-size="10px"
        fill="black"
    >
        AOI of underlying fixation:
    </text>
    <line
        x1={line3StartX}
        y1={line3Y}
        x2={line3EndX}
        y2={line3Y}
        stroke="black"
        stroke-dasharray="3 3"
        stroke-width="1"
    />
    <polyline
        points={`
            ${barX + BAR_WIDTH + 10},1  
            ${barX + BAR_WIDTH + 15},1
            ${barX + BAR_WIDTH + 10},1
            ${barX + BAR_WIDTH + 10},${barHeight - 1}
            ${barX + BAR_WIDTH + 15},${barHeight - 1}
        `}
        fill="none"
        stroke="black"
        stroke-width="1"
    />
    <text 
        x={barX + BAR_WIDTH + 18}
        y={1}
        text-anchor="start"
        dominant-baseline="middle"
        font-size="10px"
        fill="black"
    >100</text>
    <text 
        x={barX + BAR_WIDTH + 18}
        y={barHeight - 1}
        text-anchor="start"
        dominant-baseline="middle"
        font-size="10px"
        fill="black"
    >0</text>
    <text 
        x={line3StartX + 45} 
        y={barHeight - RIGHT_LABEL_MIN_HEIGHT}
        text-anchor="start"
        dominant-baseline="hanging"
        font-size="10px"
        fill="black"
    >
        <tspan x={line3StartX + 45} dy="0">running value</tspan>
        <tspan x={line3StartX + 45} dy="14">range 0-100</tspan>
        <tspan x={line3StartX + 45} dy="14">ends at result value</tspan>
    </text>

    {#each aoiLegendItems as item}
        <g>
            <circle 
                cx={item.x}
                cy={item.y}
                r={AOI_LEGEND_CIRCLE_RADIUS}
                fill={item.color}
                fill-opacity={aoiColorsOpacity}
            />
            <text
                x={item.x + AOI_LEGEND_TEXT_OFFSET}
                y={item.y}
                text-anchor="start"
                dominant-baseline="middle"
                font-size="10px"
                fill="black"
            >
                {item.aoi}
            </text>
        </g>
    {/each}
</svg> 