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

   console.log(N);
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

    let recurrentFixations = computeReccurencePointCount(matrix);
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

    if (numberOfPointsInDiagonalLines === 0) return 0;
    if (recurrentFixations === 0) return 0;
    console.log(`${numberOfPointsInDiagonalLines} / ${recurrentFixations}`);
    return (100 * numberOfPointsInDiagonalLines) / N;
};

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

