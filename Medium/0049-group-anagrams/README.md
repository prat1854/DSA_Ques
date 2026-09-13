# 49. Group Anagrams

## Difficulty: Medium | Language: JavaScript

- **LeetCode URL:** [Group Anagrams](https://leetcode.com/problems/group-anagrams/)
- **Submission ID:** `2135427947`
- **Submitted At:** `Tue, 08 Sep 2026 17:17:11 GMT`
- **Runtime:** `23 ms` (beats 88.50%)
- **Memory:** `66.4 MB` (beats 83.13%)

## Solution Code

```javascript
/**
 * @param {string[]} strs
 * @return {string[][]}
 */
const groupAnagrams = function(strs) {

    const groups = new Map();

    for (const word of strs) {

        const key = word.split("").sort().join("");

        if (!groups.has(key)) {
            groups.set(key, []);
        }

        groups.get(key).push(word);
    }

    return Array.from(groups.values());
};
```
