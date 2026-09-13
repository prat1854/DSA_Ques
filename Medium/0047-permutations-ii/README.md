# 47. Permutations II

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Permutations II](https://leetcode.com/problems/permutations-ii/)
- **Submission ID:** `2133112919`
- **Submitted At:** `Sun, 06 Sep 2026 17:20:21 GMT`
- **Runtime:** `3 ms` (beats 72.89%)
- **Memory:** `57.9 MB` (beats 84.74%)

## Solution Code

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
const permuteUnique = function(nums) {

    nums.sort((a, b) => a - b);

    const result = [];
    const used = new Array(nums.length).fill(false);

    const backtrack = (current) => {

        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {

            if (used[i]) {
                continue;
            }
                if (
                i > 0 &&
                nums[i] === nums[i - 1] &&
                !used[i - 1]
            ) {
                continue;
            }
        used[i] = true;
            current.push(nums[i]);

            backtrack(current);
            
            current.pop();
            used[i] = false;
        }
    };

    backtrack([]);
  return result;
};
```
