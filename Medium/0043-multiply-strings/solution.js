/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
const multiply = function(num1, num2) {

    if (num1 === "0" || num2 === "0") {
        return "0";
    }

    const result = new Array(
        num1.length + num2.length
    ).fill(0);

    for (let i = num1.length - 1; i >= 0; i--) {

        for (let j = num2.length - 1; j >= 0; j--) {

            const digit1 = Number(num1[i]);
            const digit2 = Number(num2[j]);

            const position = i + j + 1;

            result[position] += digit1 * digit2;

            result[position - 1] +=
                Math.floor(result[position] / 10);

            result[position] %= 10;
        }
    }
     //join ("") array to string or replace wala beginning ke zero hatao  sab zero hogya toh h "0"
    return result.join("").replace(/^0+/, "") || "0";
};