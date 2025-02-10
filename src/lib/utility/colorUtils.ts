export const assignRandomColorToAoi = (aoi: string[]): {aoi: string, color: string}[] => {
    // Scientific color palette (colorblind-friendly)
    const scientificPalette = [
        '#4477AA', // blue
        '#EE6677', // red
        '#228833', // green
        '#CCBB44', // yellow
        '#66CCEE', // cyan
        '#AA3377', // purple
        '#BBBBBB', // gray
    ];
    
    return aoi.map((aoi, index) => ({
        aoi: aoi,
        color: scientificPalette[index % scientificPalette.length]
    }));
}

export const getUniqueAois = (fixationGroups: {label: string, fixations: {aoi: string[]}[]}[]): string[] => {
    return [...new Set(fixationGroups.flatMap(group => group.fixations).flatMap(fixation => fixation.aoi))];
} 