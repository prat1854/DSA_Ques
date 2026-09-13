/**
 * @param {number[][]} matrix
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
const rotate = function(matrix) {

    const n = matrix.length;

    for (let row = 0; row < n; row++) {

        for (let col = row + 1; col < n; col++) {

            [matrix[row][col], matrix[col][row]] =
            [matrix[col][row], matrix[row][col]];
        }
    }

    for (let row = 0; row < n; row++) {

        let left = 0;
        let right = n - 1;

        while (left < right) {

            [matrix[row][left], matrix[row][right]] =
            [matrix[row][right], matrix[row][left]];

            left++;
            right--;
        }
    }
};