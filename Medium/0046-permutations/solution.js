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