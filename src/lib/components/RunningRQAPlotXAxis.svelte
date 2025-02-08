<script lang="ts">
    let { 
        width,
        height,
        labelWidth,
        maxFixations,
        labelStep = 5
    } = $props<{
        width: number;
        height: number;
        labelWidth: number;
        maxFixations: number;
        labelStep?: number;
    }>();

    // Compute x-axis labels
    const xAxisLabels = $derived(() => {
        return Array.from(
            { length: Math.floor(maxFixations / labelStep) }, 
            (_, i) => (i + 1) * labelStep
        ).filter(val => val <= maxFixations);
    });
</script>

<!-- X-axis labels -->
{#each xAxisLabels() as label}
    <text
        x={labelWidth + (label * width / maxFixations)}
        y={height + 16}
        text-anchor="middle"
        font-size="12px"
        fill="black"
    >
        {label}
    </text>
{/each}

<!-- "0" label at start -->
<text
    x={labelWidth}
    y={height + 16}
    text-anchor="middle"
    font-size="12px"
    fill="black"
>
    0
</text>

<!-- "Fixations" label centered below -->
<text
    x={labelWidth + width / 2}
    y={height + 30}
    text-anchor="middle"
    font-size="12px"
    fill="black"
>
    Fixation
</text> 