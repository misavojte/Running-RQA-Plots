import type { Fixation } from "../types/Fixation.js";

/**
 * Computes the recurrence matrix for a sequence of fixations based on AOIs.
 * Recurrence is binary (1 if recurrent, 0 if not).
 * It cannot be with an empty AOI string.
 * 
 * @param fixations - Array of fixations with AOI labels
 * @returns Binary recurrence matrix
 */
export const computeRecurrenceMatrix = (fixations: Fixation[]): number[][] => {
    const n = fixations.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1; // A fixation is always recurrent with itself
        } else {
          // Check for AOI overlap and ensure AOI is not an empty string
          const sharedAOI = fixations[i].aoi.some(aoi => aoi !== "" && fixations[j].aoi.includes(aoi));
          matrix[i][j] = sharedAOI ? 1 : 0;
        }
      }
    }
    return matrix;
  };