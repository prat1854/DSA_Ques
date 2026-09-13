/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
const myPow = function(x, n) {

    let result = 1;
    let base = x;
    let exponent = n;

    if (exponent < 0) {
        base = 1 / base;
        exponent = -exponent;
    }

    while (exponent > 0) {

        if (exponent % 2 === 1) {
            result *= base;
        }

        base *= base;

        exponent = Math.floor(exponent / 2);
    }

    return result;
};