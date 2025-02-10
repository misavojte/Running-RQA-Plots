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
 * Can be computed as N * (N - 1) / 2. If we subtract 1, we get the maximum possible number of deterministic fixations that can be in a diagonal line.
 * 
 * @param matrix - Binary recurrence matrix (NxN)
 * @returns Maximum possible number of deterministic fixations

*/
export const computeMaxPossibleDeterministicFixations = (matrix: number[][]): number => {
    const N = matrix.length;
    // return (N * (N - 1) / 2) - 1;
    return (N * (N - 1) / 2);
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
    const numberOfMaxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix);
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
    const maxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix);
    if (maxPossibleDeterministicFixations === 0) return 0;
    return 100 * computeNumberOfPointsInHorizontalLines(matrix, minLength) / ( maxPossibleDeterministicFixations);
}




export const computeVerticalLaminarity2 = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0;
    const maxPossibleDeterministicFixations = computeMaxPossibleDeterministicFixations(matrix);
    if (maxPossibleDeterministicFixations === 0) return 0;
    return 100 * computeNumberOfPointsInVerticalLines(matrix, minLength) / ( maxPossibleDeterministicFixations);
}
