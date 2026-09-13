# 45. Jump Game II

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Jump Game II](https://leetcode.com/problems/jump-game-ii/)
- **Submission ID:** `2131052431`
- **Submitted At:** `Fri, 04 Sep 2026 18:40:11 GMT`
- **Runtime:** `3 ms` (beats 32.42%)
- **Memory:** `54.3 MB` (beats 81.69%)

## Solution Code

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
const jump = function(nums) {

    let jumps = 0;
    let currentEnd = 0;
    let farthest = 0;

    for (let i = 0; i < nums.length - 1; i++) {

        farthest = Math.max(
            farthest,
            i + nums[i]
        );

        if (i === currentEnd) {
            jumps++;
            currentEnd = farthest;
        }
    }

    return jumps;
};
```
