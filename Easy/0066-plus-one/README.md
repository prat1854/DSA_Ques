# 66. Plus One

## Difficulty: Easy | Language: JavaScript

- **LeetCode URL:** [Plus One](https://leetcode.com/problems/plus-one/)
- **Submission ID:** `2150997250`
- **Submitted At:** `Wed, 23 Sep 2026 14:47:41 GMT`
- **Runtime:** `0 ms` (beats 100.00%)
- **Memory:** `52.8 MB` (beats 86.17%)

## Solution Code

```javascript
/**
 * @param {number[]} digits
 * @return {number[]}
 */
const plusOne = function(digits) {
    for (let i = digits.length - 1; i >= 0; i--) {

        if (digits[i] < 9) {
            digits[i]++;
            return digits;
        }

        digits[i] = 0;
    }

    digits.unshift(1);

    return digits;
};
```
