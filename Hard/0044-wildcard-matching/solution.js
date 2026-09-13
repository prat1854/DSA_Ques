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