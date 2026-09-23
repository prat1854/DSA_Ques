/**
 * @param {number} n
 * @param {number} k
 * @return {string}
 */
const getPermutation = function(n, k) {
    let numbers = [];

    for (let i = 1; i <= n; i++) {
        numbers.push(i);
    }

    k--;

    let result = "";

    let factorial = 1;
    for (let i = 1; i < n; i++) {
        factorial *= i;
    }

    for (let i = n; i > 0; i--) {

        const index = Math.floor(k / factorial);

        result += numbers[index];

        numbers.splice(index, 1);

        k = k % factorial;

        if (i > 1) {
            factorial = factorial / (i - 1);
        }
    }

    return result;
};