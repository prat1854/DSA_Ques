# 46. Permutations

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Permutations](https://leetcode.com/problems/permutations/)
- **Submission ID:** `2133107601`
- **Submitted At:** `Sun, 06 Sep 2026 17:15:44 GMT`
- **Runtime:** `2 ms` (beats 64.74%)
- **Memory:** `59.3 MB` (beats 66.47%)

## Solution Code

```javascript
/**
 * @param {number[]} nums
 * @return {number[][]}
 */
const permute = function(nums) {

    const result = [];
    const used = new Set();

    const backtrack = (current) => {

        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (const num of nums) {

            if (used.has(num)) {
                continue;
            }

            used.add(num);
            current.push(num);

            backtrack(current);
            current.pop();
            used.delete(num);
        }
    };
    backtrack([]);
    return result;
};
```
