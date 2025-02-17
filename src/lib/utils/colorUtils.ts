export const assignRandomColorToAoi = (aoi: string[]): {aoi: string, color: string}[] => {
    // Extended scientific color palette (colorblind-friendly)
    const scientificPalette = [
        '#4477AA', // blue
        '#EE6677', // red
        '#228833', // green
        '#CCBB44', // yellow
        '#66CCEE', // cyan
        '#AA3377', // purple
        '#EE8866', // orange
        '#44BB99', // turquoise
        '#BBCC33', // lime
        '#99DDFF', // light blue
        '#BB4444', // brown
        '#99AA77', // olive
    ];
    
    return aoi.map((aoi, index) => ({
        aoi: aoi,
        color: aoi === "No AOI" ? '#BBBBBB' : scientificPalette[index % scientificPalette.length]
    }));
}

export const getUniqueAois = (fixationGroups: {label: string, fixations: {aoi: string[]}[]}[]): string[] => {
    // Get all unique AOIs
    const aois = [...new Set(fixationGroups
        .flatMap(group => group.fixations)
        .flatMap(fixation => fixation.aoi)
        .map(aoi => aoi.trim())
        .filter(aoi => aoi !== ""))];
    
    // Sort alphabetically
    aois.sort((a, b) => a.localeCompare(b));
    
    // Add "No AOI" at the end
    return [...aois, "No AOI"];
} 

export type BlendMode = 'linear' | 'rgb' | 'hsl' | 'lab';

export function hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
          ]
        : [0, 0, 0];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b]
        .map(x => Math.round(x).toString(16).padStart(2, '0'))
        .join('');
}

export function blendColors(color1: string, color2: string, ratio: number, mode: BlendMode): string {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    switch (mode) {
        case 'rgb':
            // Simple RGB interpolation
            const blended = rgb1.map((c1, i) => 
                Math.round(c1 * (1 - ratio) + rgb2[i] * ratio)
            );
            return rgbToHex(blended[0], blended[1], blended[2]);
        
        // Add other blend modes here (LAB, HSL) if needed
        // For now defaulting to linear RGB
        default:
            return rgbToHex(
                rgb1[0] * (1 - ratio) + rgb2[0] * ratio,
                rgb1[1] * (1 - ratio) + rgb2[1] * ratio,
                rgb1[2] * (1 - ratio) + rgb2[2] * ratio
            );
    }
}

export function createColorGradient(startColor: string, endColor: string, steps: number, mode: BlendMode = 'rgb'): string[] {
    if (steps < 2) return [startColor];
    
    const gradient: string[] = [];
    
    // Calculate step size
    const stepSize = 1 / (steps - 1);
    
    // Generate colors for each step
    for (let i = 0; i < steps; i++) {
        const ratio = i * stepSize;
        const color = blendColors(startColor, endColor, ratio, mode);
        gradient.push(color);
    }
    
    return gradient;
} 