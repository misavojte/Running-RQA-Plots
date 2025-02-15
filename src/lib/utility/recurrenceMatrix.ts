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

/**
 * Computes the Euclidean distance between two fixations.
 *
 * @param fix1 - The first fixation with numeric x and y coordinates.
 * @param fix2 - The second fixation with numeric x and y coordinates.
 * @returns The Euclidean distance.
 */
const euclideanDistance = (fix1: Fixation, fix2: Fixation): number => {
  if (!fix1.x || !fix1.y || !fix2.x || !fix2.y) return 999;
  const dx = fix1.x - fix2.x;
  const dy = fix1.y - fix2.y;
  console.log(dx, dy, Math.sqrt(dx * dx + dy * dy));
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Computes the recurrence matrix for a sequence of fixations based on Euclidean distance.
 * A pair of fixations is considered recurrent (1) if the Euclidean distance between them is 
 * less than the provided threshold and they belong to different contiguous groups.
 * Contiguous fixations falling within the threshold distance are grouped together.
 *
 * @param fixations - Array of fixations with numeric x and y coordinates.
 * @param threshold - The distance threshold used for both recurrence and grouping.
 * @returns A binary recurrence matrix.
 */
export const computeEuclideanRecurrenceMatrix = (fixations: Fixation[], threshold: number = 100): number[][] => {
  const n = fixations.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  if (n === 0) return matrix;

  // Group contiguous fixations that are within the threshold distance.
  const groupIndices: number[] = new Array(n).fill(0);
  let currentGroup = 0;
  groupIndices[0] = currentGroup;
  for (let i = 1; i < n; i++) {
    // If the current fixation falls within the threshold of the previous one,
    // assign it to the same group; otherwise, start a new group.
    if (euclideanDistance(fixations[i], fixations[i - 1]) < threshold) {
      groupIndices[i] = currentGroup;
    } else {
      currentGroup++;
      groupIndices[i] = currentGroup;
    }
  }

  // Build the recurrence matrix.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        // A fixation is always recurrent with itself.
        matrix[i][j] = 1;
      } else {
        // If the Euclidean distance is less than the threshold,
        // mark recurrence only if the fixations belong to different groups.
        if (euclideanDistance(fixations[i], fixations[j]) < threshold) {
          matrix[i][j] = (groupIndices[i] === groupIndices[j]) ? 0 : 1;
        } else {
          matrix[i][j] = 0;
        }
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