<script lang="ts">
	import RunningRqaPlotBarColor from "./RunningRQAPlotBarColor.svelte";

    let { width, y, height, barHeight, aoiColors = [], aoiColorsOpacity = 0.2, colorPalette = [["#d3d3d3", "#5c9cad"], ["#b75252", "#4e3d42"]], label1 = "Recurrence Rate", label2 = "Determinism", label3 = "Laminarity" } = $props<{
        width: number;
        y: number;
        height: number;
        barHeight: number;
        aoiColors?: Array<{ aoi: string; color: string }>;
        aoiColorsOpacity?: number;
        colorPalette?: string[][];
        label1?: string;
        label2?: string;
        label3?: string;
    }>();

    const BAR_WIDTH = 50;
    const LEFT_LABEL_MIN_HEIGHT = 42;
    const RIGHT_LABEL_MIN_HEIGHT = LEFT_LABEL_MIN_HEIGHT;
    let barX = $derived.by(() => width / 2 - BAR_WIDTH / 2);
    
    // Calculate positions for the diagonal line
    let lineStartX = $derived.by(() => barX + BAR_WIDTH / 8);  // First segment boundary
    let lineStartY = $derived.by(() => barHeight * 0.5 );
    let lineLength = $derived.by(() => BAR_WIDTH / 4);
    let lineEndX = $derived.by(() => lineStartX - lineLength - 10);  // Move left
    let line2X = $derived.by(() => barX + BAR_WIDTH / 2);
    let line2StartY = $derived.by(() => barHeight * 0.95);
    let line2Length = $derived.by(() => barHeight * 0.05 + 10);
    let line2EndY = $derived.by(() => line2StartY + line2Length);
    let line3StartX = $derived.by(() => barX + BAR_WIDTH);
    let line3Y = $derived.by(() => barHeight * 0.5);
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

    const colorFilling = $derived.by(() => {
       if (aoiColors.length > 0) {
        return [aoiColors[0].color, aoiColors[0].color, aoiColors[0].color, aoiColors[0].color];
       }
       return ["gray", "gray", "gray", "gray"];
    });

    // Add base position for diamond pattern
    const DIAMOND_BASE_Y = -70;  // Original top position
    const DIAMOND_SPACING = 11.25;  // Distance between diamond centers
</script>

<svg x={0} y={y} width={width} height={height} viewBox={`0 -100 ${width} ${height}`}>
    <!-- Diamond pattern with absolute coordinates -->
    <g>
        <!-- Top diamond -->
        <path d={`M ${barX + BAR_WIDTH/2 + 2.8125} ${DIAMOND_BASE_Y}
                  L ${barX + BAR_WIDTH/2 + 14.0625} ${DIAMOND_BASE_Y + DIAMOND_SPACING}
                  L ${barX + BAR_WIDTH/2 + 2.8125} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 2}
                  L ${barX + BAR_WIDTH/2 - 8.4375} ${DIAMOND_BASE_Y + DIAMOND_SPACING} Z`} 
              fill={colorPalette[1][1]}/>
        <!-- Left diamond -->
        <path d={`M ${barX + BAR_WIDTH/2 - 8.4375} ${DIAMOND_BASE_Y + DIAMOND_SPACING}
                  L ${barX + BAR_WIDTH/2 + 2.8125} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 2}
                  L ${barX + BAR_WIDTH/2 - 8.4375} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 3}
                  L ${barX + BAR_WIDTH/2 - 19.6875} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 2} Z`} 
              fill={colorPalette[1][0]}/>
        <!-- Right diamond -->
        <path d={`M ${barX + BAR_WIDTH/2 + 14.0625} ${DIAMOND_BASE_Y + DIAMOND_SPACING}
                  L ${barX + BAR_WIDTH/2 + 25.3125} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 2}
                  L ${barX + BAR_WIDTH/2 + 14.0625} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 3}
                  L ${barX + BAR_WIDTH/2 + 2.8125} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 2} Z`} 
              fill={colorPalette[0][1]}/>
        <!-- Bottom diamond -->
        <path d={`M ${barX + BAR_WIDTH/2 + 2.8125} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 2}
                  L ${barX + BAR_WIDTH/2 + 14.0625} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 3}
                  L ${barX + BAR_WIDTH/2 + 2.8125} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 4}
                  L ${barX + BAR_WIDTH/2 - 8.4375} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 3} Z`} 
              fill={colorPalette[0][0]}/>

        <!-- Update text label positions to use the same variables -->
        <text 
            x={barX + BAR_WIDTH/2 + 2.8125} 
            y={DIAMOND_BASE_Y - 5}
            text-anchor="middle"
            dominant-baseline="bottom"
            font-size="10px"
            fill="black"
        >
            Both rising
        </text>
        <text 
            x={barX + BAR_WIDTH/2 - 23} 
            y={DIAMOND_BASE_Y + DIAMOND_SPACING * 2}
            text-anchor="end"
            dominant-baseline="middle"
            font-size="10px"
            fill="black"
        >
            {label2} rises
        </text>
        <text 
            x={barX + BAR_WIDTH/2 + 27} 
            y={DIAMOND_BASE_Y + DIAMOND_SPACING * 2}
            text-anchor="start"
            dominant-baseline="middle"
            font-size="10px"
            fill="black"
        >
            {label3} rises
        </text>
        <text 
            x={barX + BAR_WIDTH/2 + 2.8125} 
            y={DIAMOND_BASE_Y + DIAMOND_SPACING * 4 + 10}
            text-anchor="middle"
            dominant-baseline="top"
            font-size="10px"
            fill="black"
        >
            No growth
        </text>
    </g>

    <RunningRqaPlotBarColor 
        series1={[10, 60, 30, 35]} 
        series2={[0, 1, 0, 1]} 
        series3={[0, 1, 0, 0]} 
        width={BAR_WIDTH}
        height={barHeight}
        backgroundColor="transparent"
        x={barX}
        y={0}
        show
        colorFilling={colorFilling}
        colorPalette={colorPalette}
    />
    <path
        d={`M ${lineStartX} ${lineStartY},
            ${lineStartX - lineLength} ${lineStartY},
            C ${lineEndX} ${barHeight - 28},
              ${lineEndX - 20} ${barHeight - 40},
              ${barX + 14} ${DIAMOND_BASE_Y + DIAMOND_SPACING * 3}`}
        fill="none"
        stroke="black"
        stroke-dasharray="3 3"
        stroke-width="1"
    />
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
            ${barX + BAR_WIDTH + 10},${barHeight/2}  
            ${barX + BAR_WIDTH + 15},${barHeight/2}
            ${barX + BAR_WIDTH + 10},${barHeight/2}
            ${barX + BAR_WIDTH + 10},${barHeight - 1}
            ${barX + BAR_WIDTH + 15},${barHeight - 1}
        `}
        fill="none"
        stroke="black"
        stroke-width="1"
    />
    <text 
        x={barX + BAR_WIDTH + 18}
        y={barHeight/2}
        text-anchor="start"
        dominant-baseline="middle"
        font-size="10px"
        fill="black"
    >0</text>
    <text 
        x={barX + BAR_WIDTH + 18}
        y={barHeight - 1}
        text-anchor="start"
        dominant-baseline="middle"
        font-size="10px"
        fill="black"
    >100</text>
    <text 
        x={line3StartX + 45} 
        y={barHeight - RIGHT_LABEL_MIN_HEIGHT}
        text-anchor="start"
        dominant-baseline="hanging"
        font-size="10px"
        fill="black"
    >
        <tspan x={line3StartX + 45} dy="0">bar volume</tspan>
        <tspan x={line3StartX + 45} dy="14">explained by</tspan>
        <tspan x={line3StartX + 45} dy="14">{label1}</tspan>
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