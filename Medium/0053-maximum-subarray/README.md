# 53. Maximum Subarray

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/)
- **Submission ID:** `2138927954`
- **Submitted At:** `Fri, 11 Sep 2026 19:39:22 GMT`
- **Runtime:** `0 ms` (beats 100.00%)
- **Memory:** `62.5 MB` (beats 96.29%)

## Solution Code

```javascript
/**
 * @param {number[]} nums
 * @return {number}
 */
const maxSubArray = function(nums) {

    let currentSum = nums[0];
    let maxSum = nums[0];

    for (let i = 1; i < nums.length; i++) {

        currentSum = Math.max(
            nums[i],
            currentSum + nums[i]
        );

        maxSum = Math.max(maxSum, currentSum);
    }

    return maxSum;
};
```
