export const computeReccurencePointCount = (matrix: number[][]): number => {
    const N = matrix.length;
    if (N < 2) return 0; // Avoid division by zero for small matrices
 
    let recurrentPoints = 0;
 
    // Count recurrence points in the upper triangle (i < j)
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) { // Upper triangle only
            if (matrix[i][j] === 1) {
                recurrentPoints++;
            }
        }
    }

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
export const computeDeterminism = (matrix: number[][], minLength = 2): number => {
    const N = matrix.length;
    if (N < minLength) return 0; // Avoid invalid calculations

    let recurrentFixations = computeReccurencePointCount(matrix);
    let diagonalLineLengths: number[] = []; // Stores valid diagonal line lengths

    // In upper triangle, find all diagonal lines of at least minLength
    for (let i = 0; i < N - 1; i++) {
        for (let j = i + 1; j < N - 1; j++) {
            if (matrix[i][j] === 1 && matrix[i + 1][j + 1] === 1) {
                diagonalLineLengths.push(1);
            }
        }
    }

    if (recurrentFixations === 0) return 0;
    if (diagonalLineLengths.length === 0) return 0;
    return 100 * (diagonalLineLengths.reduce((sum, length) => sum + length, 0)) / recurrentFixations;
};
