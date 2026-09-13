# 39. Combination Sum

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Combination Sum](https://leetcode.com/problems/combination-sum/)
- **Submission ID:** `2124242017`
- **Submitted At:** `Sat, 29 Aug 2026 18:23:51 GMT`
- **Runtime:** `0 ms` (beats 100.00%)
- **Memory:** `58.6 MB` (beats 89.11%)

## Solution Code

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
 
const combinationSum = function(candidates, target) {
    const result = [];
    const backtrack = (start, current, total) => {

        if (total === target) {
            result.push([...current]);
            return;
        }

        if (total > target) {
            return;
        }

        for (let i = start; i < candidates.length; i++) {

            const num = candidates[i];

            current.push(num);

            backtrack(
                i,
                current,
                total + num
            );

            current.pop();
        }
    };
    backtrack(0, [], 0);
    return result;
};
```
