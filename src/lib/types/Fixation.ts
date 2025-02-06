export interface Fixation {
    id: number; // Fixation index
    timestamp: number; // Time in ms
    aoi: string[]; // Array of AOI labels (to handle overlaps)
}