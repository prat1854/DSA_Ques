# 44. Wildcard Matching

## Difficulty: Hard | Language: JavaScript

- **LeetCode URL:** [Wildcard Matching](https://leetcode.com/problems/wildcard-matching/)
- **Submission ID:** `2131051136`
- **Submitted At:** `Fri, 04 Sep 2026 18:38:32 GMT`
- **Runtime:** `2 ms` (beats 85.38%)
- **Memory:** `57 MB` (beats 92.69%)

## Solution Code

```javascript
/**
 * @param {string} s
 * @param {string} p
 * @return {boolean}
 */
const isMatch = function(s, p) {

    let sIndex = 0;
    let pIndex = 0;

    let starIndex = -1;
    let matchIndex = 0;

    while (sIndex < s.length) {

        if (
            pIndex < p.length &&
            (p[pIndex] === s[sIndex] || p[pIndex] === "?")
        ) {
            sIndex++;
            pIndex++;
        }

        else if (
            pIndex < p.length &&
            p[pIndex] === "*"
        ) {
            starIndex = pIndex;
            matchIndex = sIndex;

            pIndex++;
        }
        else if (starIndex !== -1) {
            matchIndex++;

            sIndex = matchIndex;
            pIndex = starIndex + 1;
        }
        else {
            return false;
        }
    }
    while (
        pIndex < p.length &&
        p[pIndex] === "*"
    ) {
        pIndex++;
    }

    return pIndex === p.length;
};
```
