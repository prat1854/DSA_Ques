/**
 * @param {string} s
 * @return {number}
 */
const lengthOfLastWord = function(s) {

    let i = s.length - 1;
    let count = 0;

    while (i >= 0 && s[i] === " ") {
        i--;
    }

    while (i >= 0 && s[i] !== " ") {
        count++;
        i--;
    }

    return count;
};