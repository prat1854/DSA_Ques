# 40. Combination Sum II

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/)
- **Submission ID:** `2125367951`
- **Submitted At:** `Sun, 30 Aug 2026 18:16:26 GMT`
- **Runtime:** `1 ms` (beats 96.57%)
- **Memory:** `57 MB` (beats 50.72%)

## Solution Code

```javascript
/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
const combinationSum2 = function(candidates, target) {

    candidates.sort((a, b) => a - b);

    const result = [];

    const backtrack = (start, current, remaining) => {

        if (remaining === 0) {
            result.push([...current]);
            return;
        }

        for (let i = start; i < candidates.length; i++) {

            if (i > start && candidates[i] === candidates[i - 1]) {
                continue;
            }

            const num = candidates[i];

            if (num > remaining) {
                break;
            }

            current.push(num);

            backtrack(
                i + 1,
                current,
                remaining - num
            );
            current.pop();
        }
    };

    backtrack(0, [], target);

    return result;
};
```
