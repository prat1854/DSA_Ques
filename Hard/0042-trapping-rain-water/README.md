# 42. Trapping Rain Water

## Difficulty: Hard | Language: JavaScript

- **LeetCode URL:** [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
- **Submission ID:** `2128828456`
- **Submitted At:** `Wed, 02 Sep 2026 18:12:41 GMT`
- **Runtime:** `0 ms` (beats 100.00%)
- **Memory:** `55.1 MB` (beats 66.70%)

## Solution Code

```javascript
/**
 * @param {number[]} height
 * @return {number}
 */
const trap = function(height) {

    let left = 0;
    let right = height.length - 1;

    let leftMax = 0;
    let rightMax = 0;

    let water = 0;

    while (left < right) {

        if (height[left] < height[right]) {

            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }

            left++;

        } else {

            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }

            right--;
        }
    }

    return water;
};
```
