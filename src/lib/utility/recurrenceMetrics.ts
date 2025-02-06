/**
 * Computes basic RQA metrics from a recurrence matrix.
 * 
 * @param matrix - Binary recurrence matrix
 * @returns Object containing key RQA metrics
 */
export const computeRQAMetrics = (matrix: number[][]) => {
    const n = matrix.length;
    let recurrenceRate = 0;
    let diagonalLines = 0;
    let verticalLines = 0;
  
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matrix[i][j] === 1) {
          recurrenceRate++;
          
          // Check diagonal recurrence (determinism)
          if (i > 0 && j > 0 && matrix[i - 1][j - 1] === 1) {
            diagonalLines++;
          }
  
          // Check vertical recurrence (laminarity)
          if (i > 0 && matrix[i - 1][j] === 1) {
            verticalLines++;
          }
        }
      }
    }
  
    return {
      recurrenceRate: recurrenceRate / (n * n),
      determinism: diagonalLines / recurrenceRate,
      laminarity: verticalLines / recurrenceRate
    };
  };
  