# 50. Pow(x, n)

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Pow(x, n)](https://leetcode.com/problems/powx-n/)
- **Submission ID:** `2137775581`
- **Submitted At:** `Thu, 10 Sep 2026 17:23:37 GMT`
- **Runtime:** `0 ms` (beats 100.00%)
- **Memory:** `54 MB` (beats 33.75%)

## Solution Code

```javascript
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
const myPow = function(x, n) {

    let result = 1;
    let base = x;
    let exponent = n;

    if (exponent < 0) {
        base = 1 / base;
        exponent = -exponent;
    }

    while (exponent > 0) {

        if (exponent % 2 === 1) {
            result *= base;
        }

        base *= base;

        exponent = Math.floor(exponent / 2);
    }

    return result;
};
```
