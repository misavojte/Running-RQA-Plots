export interface Fixation {
    id: number; // Fixation index
    timestamp: number; // Time in ms
    x?: number; // X coordinate
    y?: number; // Y coordinate
    aoi: string[]; // Array of AOI labels (to handle overlaps)
}