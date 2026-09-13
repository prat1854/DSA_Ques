# 48. Rotate Image

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Rotate Image](https://leetcode.com/problems/rotate-image/)
- **Submission ID:** `2134287707`
- **Submitted At:** `Mon, 07 Sep 2026 18:23:12 GMT`
- **Runtime:** `1 ms` (beats 27.92%)
- **Memory:** `53.2 MB` (beats 90.69%)

## Solution Code

```javascript
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
```
