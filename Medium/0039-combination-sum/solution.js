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