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