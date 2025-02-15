import type { Fixation } from "$lib/types/Fixation.js";

/**
 * Iterates through the upper triangle of a matrix and executes a callback for each position.
 * 
 * @param matrix - The matrix to iterate through
 * @param callback - Function to execute for each position in upper triangle
 */
export const forEachUpperTriangle = (
    matrix: number[][],
    callback: (i: number, j: number, value: number) => void
): void => {
    const N = matrix.length;
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            callback(i, j, matrix[i][j]);
        }
    }
};

export const computeReccurencePointCount = (matrix: number[][]): number => {
    const N = matrix.length;
    if (N < 2) return 0; // Avoid division by zero for small matrices
 
    let recurrentPoints = 0;
 
    forEachUpperTriangle(matrix, (i, j, value) => {
        if (value === 1) {
            recurrentPoints++;
        }
    });

    return recurrentPoints;
}

/**
* Computes the Recurrence (REC) measure for a given recurrence matrix.
*
* @param matrix - Binary recurrence matrix (NxN)
* @returns REC as a percentage of recurrent fixations
*/
export const computeRecurrenceRate = (matrix: number[][]): number => {
   const N = matrix.length;
   if (N < 2) return 0; // Avoid division by zero for small matrices
   // Apply recurrence formula
   const R = computeReccurencePointCount(matrix); // Total recurrence points in upper triangle
   return (100 * (2 * R)) / (N * (N - 1)); // REC as a percentage
};

/**
 * Computes the Determinism (DET) measure from a recurrence matrix.
 *
 * @param matrix - Binary recurrence matrix (NxN)
 * @param minLength - Minimum diagonal line length (L)
 * @returns Determinism percentage (0-100)
 */
export const computeDeterminism2 = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0; // Avoid invalid calculations

    let numberOfPointsInDiagonalLines = 0;
    let copiedMatrix = matrix.map(row => row.slice());

    forEachUpperTriangle(copiedMatrix, (i, j, value) => {
        if (value !== 1) return;
        
        let currentDiagonalLength = 1;
        // Check how far the diagonal line extends
        while (i + currentDiagonalLength < N && 
               j + currentDiagonalLength < N && 
               copiedMatrix[i + currentDiagonalLength][j + currentDiagonalLength] === 1) {
            currentDiagonalLength++;
        }

        // Only count if the diagonal meets minimum length requirement
        if (currentDiagonalLength >= minLength) {
            numberOfPointsInDiagonalLines += currentDiagonalLength;
            // Remove the counted diagonal line from the matrix
            for (let k = 0; k < currentDiagonalLength; k++) {
                copiedMatrix[i + k][j + k] = 0;
            }
        }
    });

    let maxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix);

    if (numberOfPointsInDiagonalLines === 0) return 0;
    if (maxPossibleDeterministicFixations === 0) return 0;
    return (100 * numberOfPointsInDiagonalLines) / ( maxPossibleDeterministicFixations);

};

/**
 * Computes the maximum possible number of deterministic fixations in a recurrence matrix.
 * This is the total number of points in the upper triangle
 * MaxDet(N,L)= ((N−1+L)(N−L)) / 2
 * 
 * @param matrix - Binary recurrence matrix (NxN)
 * @returns Maximum possible number of deterministic fixations


*/
export const computeMaxPossibleDeterministicFixations = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    // return (N * (N - 1) / 2) - 1;
    // return (N * (N - 1) / 2);
    return (N - 1 + minLength) * (N - minLength) / 2;
}



/**
 * Computes the Determinism (DET) measure from a recurrence matrix.
 *
 * @param matrix - Binary recurrence matrix (NxN)
 * @param minLength - Minimum diagonal line length (L)
 * @returns Determinism percentage (0-100)
 */
export const computeDeterminism = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0;

    let recurrentFixations = computeReccurencePointCount(matrix);
    let numberOfPointsInDiagonalLines = 0;
    const visited = new Set<string>();

    forEachUpperTriangle(matrix, (i, j, value) => {
        if (value !== 1 || visited.has(`${i},${j}`)) return;

        let currentDiagonalLength = 1;
        let x = i, y = j;

        // Traverse diagonal and mark visited points
        while (
            x + 1 < N && y + 1 < N &&
            matrix[x + 1][y + 1] === 1 &&
            !visited.has(`${x + 1},${y + 1}`)
        ) {
            visited.add(`${x},${y}`);
            x++;
            y++;
            currentDiagonalLength++;
        }

        // Mark the last point in diagonal as visited
        visited.add(`${x},${y}`);

        if (currentDiagonalLength >= minLength) {
            numberOfPointsInDiagonalLines += currentDiagonalLength;
        }
    });

    if (numberOfPointsInDiagonalLines === 0 || recurrentFixations === 0) return 0;
    return (100 * numberOfPointsInDiagonalLines) / recurrentFixations;
};

/**
 * Computes the number of points in horizontal lines from a recurrence matrix.
 * A horizontal chain is defined along a fixed column (j) with increasing row indices,
 * and it is valid only if each new row still satisfies i < j.
 *
 * @param matrix - Binary recurrence matrix (NxN).
 * @param minLength - Minimum horizontal line length (L).
 * @returns The total number of recurrence points that belong to horizontal chains.
 */
export const computeNumberOfPointsInHorizontalLines = (
  matrix: number[][],
  minLength = 2
): number => {
  const N = matrix.length;
  if (N < minLength) return 0;
  let total = 0;
  const visited = new Set<string>();

  forEachUpperTriangle(matrix, (i, j, value) => {
    const key = `${i},${j}`;
    if (value !== 1 || visited.has(key)) return;

    // Begin a horizontal chain from (i,j)
    let chainLength = 1;
    visited.add(key);
    let nextRow = i + 1;
    // For a horizontal chain, we require that nextRow < j so the point stays in the upper triangle.
    while (nextRow < j && matrix[nextRow][j] === 1 && !visited.has(`${nextRow},${j}`)) {
      visited.add(`${nextRow},${j}`);
      chainLength++;
      nextRow++;
    }
    if (chainLength >= minLength) {
      total += chainLength;
    }
  });
  return total;
};

/**
 * Computes metrics for diagonal lines in a recurrence matrix.
 * A diagonal chain is defined along the main diagonal direction (i+1, j+1).
 * Only points in the upper triangle (i < j) are considered so that expansion remains within bounds.
 *
 * @param matrix - Binary recurrence matrix (NxN).
 * @param minLength - Minimum diagonal line length to be counted.
 * @returns An object containing:
 *   - count: number of diagonal lines (of at least minLength),
 *   - averageLength: average length of these diagonal lines,
 *   - maxLength: maximum diagonal line length found.
 */
export const computeDiagonalLineMetrics = (
    matrix: number[][],
    minLength = 2
  ): { count: number; averageLength: number; maxLength: number; totalLength: number } => {
    const N = matrix.length;
    if (N < minLength) return { count: 0, averageLength: 0, maxLength: 0, totalLength: 0 };
  
    let count = 0;
    let totalLength = 0;
    let maxLength = 0;
    const visited = new Set<string>();
  
    // Iterate only over the upper triangle (i < j)
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const key = `${i},${j}`;
        if (matrix[i][j] !== 1 || visited.has(key)) continue;
  
        // Begin a diagonal chain from (i, j)
        let chainLength = 1;
        visited.add(key);
        let nextRow = i + 1;
        let nextCol = j + 1;
  
        while (
          nextRow < N &&
          nextCol < N &&
          matrix[nextRow][nextCol] === 1 &&
          !visited.has(`${nextRow},${nextCol}`)
        ) {
          visited.add(`${nextRow},${nextCol}`);
          chainLength++;
          nextRow++;
          nextCol++;
        }
  
        if (chainLength >= minLength) {
          count++;
          totalLength += chainLength;
          if (chainLength > maxLength) {
            maxLength = chainLength;
          }
        }
      }
    }
  
    return {
      count,
      averageLength: count > 0 ? totalLength / count : 0,
      maxLength,
      totalLength
    };
  };

/**
 * Computes the number of points in vertical lines from a recurrence matrix.
 * A vertical chain is defined along a fixed row (i) with increasing column indices.
 * Since (i,j) with i < j is the starting condition, vertical expansion automatically
 * remains within the upper triangle.
 *
 * @param matrix - Binary recurrence matrix (NxN).
 * @param minLength - Minimum vertical line length (L).
 * @returns The total number of recurrence points that belong to vertical chains.
 */
export const computeNumberOfPointsInVerticalLines = (
  matrix: number[][],
  minLength = 2
): number => {
  const N = matrix.length;
  if (N < minLength) return 0;
  let total = 0;
  const visited = new Set<string>();

  forEachUpperTriangle(matrix, (i, j, value) => {
    const key = `${i},${j}`;
    if (value !== 1 || visited.has(key)) return;

    // Begin a vertical chain from (i,j)
    let chainLength = 1;
    visited.add(key);
    let nextCol = j + 1;
    // For vertical chains, simply ensure that nextCol is within bounds.
    while (nextCol < N && matrix[i][nextCol] === 1 && !visited.has(`${i},${nextCol}`)) {
      visited.add(`${i},${nextCol}`);
      chainLength++;
      nextCol++;
    }
    if (chainLength >= minLength) {
      total += chainLength;
    }
  });
  return total;
};

/**
 * Computes laminarity (LAM) from a recurrence matrix.
 * LAM is the sum of the number of points in horizontal and vertical lines.
 */
export const computeLaminarity = (matrix: number[][], minLength = 2): number => {
    const numberOfRecurrencePoints = computeReccurencePointCount(matrix);
    if (numberOfRecurrencePoints === 0) return 0;
    return 100 * (computeNumberOfPointsInHorizontalLines(matrix, minLength) + computeNumberOfPointsInVerticalLines(matrix, minLength)) / ( 2 * numberOfRecurrencePoints);
}

export const computeLaminarity2 = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0;
    const numberOfMaxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix, minLength);
    if (numberOfMaxPossibleDeterministicFixations === 0) return 0;
    return 100 * (computeNumberOfPointsInHorizontalLines(matrix, minLength) + computeNumberOfPointsInVerticalLines(matrix, minLength)) / ( 2 * numberOfMaxPossibleDeterministicFixations);
}


export const computeHorizontalLaminarity = (matrix: number[][], minLength = 2): number => {
    const numberOfRecurrencePoints = computeReccurencePointCount(matrix);
    if (numberOfRecurrencePoints === 0) return 0;
    return 100 * computeNumberOfPointsInHorizontalLines(matrix, minLength) / ( numberOfRecurrencePoints);
}

export const computeVerticalLaminarity = (matrix: number[][], minLength = 2): number => {
    const numberOfRecurrencePoints = computeReccurencePointCount(matrix);
    if (numberOfRecurrencePoints === 0) return 0;
    return 100 * computeNumberOfPointsInVerticalLines(matrix, minLength) / ( numberOfRecurrencePoints);
}

export const computeHorizontalLaminarity2 = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0;
    const maxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix, minLength);
    if (maxPossibleDeterministicFixations === 0) return 0;
    return 100 * computeNumberOfPointsInHorizontalLines(matrix, minLength) / ( maxPossibleDeterministicFixations);
}




export const computeVerticalLaminarity2 = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0;
    const maxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix, minLength);
    if (maxPossibleDeterministicFixations === 0) return 0;
    return 100 * computeNumberOfPointsInVerticalLines(matrix, minLength) / ( maxPossibleDeterministicFixations);
}

/**
 * Computes a DET–LAM difference measure that remains invariant when
 * both DET and LAM scale by the same factor. For example, if DET and LAM
 * both rise proportionally (due to repeated refixations), this measure
 * stays constant.
 *
 * @param matrix - Binary recurrence matrix (NxN).
 * @param minLength - Minimum line length for DET and LAM measures.
 * @returns Value in [0, 100], where 50 indicates DET ≈ LAM.
 */
export const computeDetLamDifference = (matrix: number[][], minLength = 2): number => {
    const det = computeDeterminism(matrix, minLength);
    const lam = computeLaminarity(matrix, minLength);
  
    // Sum used as denominator for difference. If zero, default to middle value.
    const sum = det + lam;
    if (sum < 1e-6) {
      // Both DET and LAM are effectively zero, so no difference is meaningful.
      // Return 50 as a neutral midpoint (or 0 if you prefer).
      return 50;
    }
  
    // Raw difference in range [-1, 1]
    // This ratio remains constant if DET and LAM scale by the same factor.
    const difference = (det - lam) / sum;
  
    // Shift [-1, 1] -> [0, 1] and then scale -> [0, 100]
    // difference = -1  =>  0%
    // difference =  0  => 50%
    // difference =  1  => 100%
    const normalizedDifference = (difference + 1) * 50;
  
    // Clamp to [0, 100]
    return Math.max(0, Math.min(100, normalizedDifference));
  };


  /**
 * Computes the Consecutive Fixation Ratio (CFR) from a recurrence matrix.
 * CFR is the ratio of consecutive recurrent points along the first diagonal above the main diagonal.
 *
 * @param matrix - Binary recurrence matrix (NxN)
 * @returns CFR as a number between 0 and 1 (0% to 100% if multiplied by 100)
 */
export const computeConsecutiveFixationRatio = (matrix: number[][]): number => {
    const N = matrix.length;
    if (N < 2) return 0; // Not enough data for consecutive analysis

    let consecutiveCount = 0;
    
    // Check the first diagonal above the main diagonal (i.e., consecutive fixations)
    for (let i = 0; i < N - 1; i++) {
        if (matrix[i][i + 1] === 1) {
            consecutiveCount++;
        }
    }

    // Total possible consecutive transitions equals N-1
    return consecutiveCount / (N - 1) * 100;
};

/**
 * Computes the Center of Recurrence Mass (CORM) from a binary recurrence matrix.
 * 
 * Formula:
 *   CORM = 100 * ( sum_{i<j} (j - i) * r_ij ) / ( (N - 1) * R )
 * 
 * where:
 *   - i < j indicates summation over the upper triangle of the matrix
 *   - r_ij is 1 if points i and j are recurrent, 0 otherwise
 *   - R is the total number of recurrent points in the upper triangle
 *   - (N - 1) normalizes the maximum possible distance from the diagonal
 * 
 * @param matrix - Binary recurrence matrix (NxN)
 * @returns CORM in the range [0, 100]. Returns 0 if no recurrences are found.
 */
export const computeCenterOfRecurrenceMass = (matrix: number[][]): number => {
  const N = matrix.length;
  if (N < 2) return 0; // Not enough data for meaningful CORM

  // Total number of recurrence points in the upper triangle
  const R = computeReccurencePointCount(matrix);
  if (R === 0) return 0; // Avoid division by zero

  let sumDistances = 0;

  // Iterate over upper triangle and accumulate (j - i) for each recurrent point
  forEachUpperTriangle(matrix, (i, j, value) => {
      if (value === 1) {
          sumDistances += (j - i);
      }
  });

  // Normalize by (N - 1)*R and scale by 100
  const corm = (100 * sumDistances) / ((N - 1) * R);
  return corm;
};