# 58. Length of Last Word

## Difficulty: Easy | Language: JavaScript

- **LeetCode URL:** [Length of Last Word](https://leetcode.com/problems/length-of-last-word/)
- **Submission ID:** `2141905161`
- **Submitted At:** `Mon, 14 Sep 2026 18:29:36 GMT`
- **Runtime:** `0 ms` (beats 100.00%)
- **Memory:** `54.2 MB` (beats 16.75%)

## Solution Code

```javascript
/**
 * @param {string} s
 * @return {number}
 */
const lengthOfLastWord = function(s) {

    let i = s.length - 1;
    let count = 0;

    while (i >= 0 && s[i] === " ") {
        i--;
    }

    while (i >= 0 && s[i] !== " ") {
        count++;
        i--;
    }

    return count;
};
```
