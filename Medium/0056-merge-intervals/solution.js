/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
const merge = function(intervals) {

    intervals.sort((a, b) => a[0] - b[0]);

    const result = [];

    result.push(intervals[0]);

    for (let i = 1; i < intervals.length; i++) {

        const current = result[result.length - 1];
        const next = intervals[i];

        if (next[0] <= current[1]) {

            current[1] = Math.max(
                current[1],
                next[1]
            );

        } else {

            result.push(next);
        }
    }
    return result;
};