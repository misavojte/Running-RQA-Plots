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

// /**
//  * Computes a self-transition corrected recurrence matrix for a sequence of fixations based on AOIs.
//  * Self transitions arising from contiguous fixations (determined dynamically by the run-length, i.e. the contemporary count)
//  * are excluded, while genuine recurrences (across separate contiguous blocks) are retained.
//  *
//  * @param fixations - Array of fixations with AOI labels
//  * @returns Binary recurrence matrix with self-transition correction
//  */
// export const computeSelfTransitionCorrectedRecurrenceMatrix = (fixations: Fixation[]): number[][] => {
//   const n = fixations.length;
//   const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

//   // Helper function: Checks if two fixations share at least one non-empty AOI.
//   const shareAOI = (fix1: Fixation, fix2: Fixation): boolean =>
//     fix1.aoi.some(aoi => aoi !== "" && fix2.aoi.includes(aoi));

//   // Determine contiguous blocks (runs) of self transitions.
//   // Consecutive fixations that share an AOI are assigned the same block index.
//   const blockIndices: number[] = new Array(n).fill(0);
//   let currentBlock = 0;
//   blockIndices[0] = currentBlock;
//   for (let i = 1; i < n; i++) {
//     if (shareAOI(fixations[i], fixations[i - 1])) {
//       // Same block as previous fixation.
//       blockIndices[i] = currentBlock;
//     } else {
//       // Start a new block.
//       currentBlock++;
//       blockIndices[i] = currentBlock;
//     }
//   }

//   // Build the recurrence matrix.
//   for (let i = 0; i < n; i++) {
//     for (let j = 0; j < n; j++) {
//       if (i === j) {
//         matrix[i][j] = 1; // Diagonal: A fixation is always recurrent with itself.
//       } else {
//         if (shareAOI(fixations[i], fixations[j])) {
//           // Exclude self transitions if fixations belong to the same contiguous block.
//           matrix[i][j] = (blockIndices[i] === blockIndices[j]) ? 0 : 1;
//         } else {
//           matrix[i][j] = 0;
//         }
//       }
//     }
//   }

//   return matrix;
// };