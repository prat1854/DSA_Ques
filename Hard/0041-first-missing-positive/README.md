# 41. First Missing Positive

## Difficulty: Hard | Language: JavaScript

- **LeetCode URL:** [First Missing Positive](https://leetcode.com/problems/first-missing-positive/)
- **Submission ID:** `2126484191`
- **Submitted At:** `Mon, 31 Aug 2026 18:24:37 GMT`
- **Runtime:** `6 ms` (beats 57.59%)
- **Memory:** `62.7 MB` (beats 73.00%)

## Solution Code

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
const firstMissingPositive = function(nums) {

    const n = nums.length;

    for (let i = 0; i < n; i++) {
        if (nums[i] <= 0 || nums[i] > n) {
            nums[i] = n + 1;
        }
    }
    for (let i = 0; i < n; i++) {

        const num = Math.abs(nums[i]);

        if (num >= 1 && num <= n) {
            nums[num - 1] = -Math.abs(nums[num - 1]);
        }
    }

    for (let i = 0; i < n; i++) {

        if (nums[i] > 0) {
            return i + 1;
        }
    }

    return n + 1;
};
```
