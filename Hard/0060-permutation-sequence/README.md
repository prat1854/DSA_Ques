# 60. Permutation Sequence

## Difficulty: Hard | Language: JavaScript

- **LeetCode URL:** [Permutation Sequence](https://leetcode.com/problems/permutation-sequence/)
- **Submission ID:** `2142948717`
- **Submitted At:** `Tue, 15 Sep 2026 18:14:57 GMT`
- **Runtime:** `1 ms` (beats 46.53%)
- **Memory:** `54.1 MB` (beats 35.15%)

## Solution Code

```javascript
/**
 * @param {number} n
 * @param {number} k
 * @return {string}
 */
const getPermutation = function(n, k) {
    let numbers = [];

    for (let i = 1; i <= n; i++) {
        numbers.push(i);
    }

    k--;

    let result = "";

    let factorial = 1;
    for (let i = 1; i < n; i++) {
        factorial *= i;
    }

    for (let i = n; i > 0; i--) {

        const index = Math.floor(k / factorial);

        result += numbers[index];

        numbers.splice(index, 1);

        k = k % factorial;

        if (i > 1) {
            factorial = factorial / (i - 1);
        }
    }

    return result;
};
```
