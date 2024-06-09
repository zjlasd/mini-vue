function getSequence(arr) {
    if (arr.length === 0) return [];

    const dp = new Array(arr.length).fill(1);
    const prev = new Array(arr.length).fill(-1);
    let res = 1;
    let resIndex = 0;

    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < i; j++) {
            if (arr[i] > arr[j]) {
                if (dp[i] < dp[j] + 1) {
                    dp[i] = dp[j] + 1;
                    prev[i] = j;
                }
            }
        }
        if (res < dp[i]) {
            res = dp[i];
            resIndex = i;
        }
    }

    const lisIndices = [];
    for (let i = resIndex; i >= 0; i = prev[i]) {
        lisIndices.push(i);
        if (prev[i] === -1) break;
    }
    lisIndices.reverse();
    return lisIndices;
}

const r = getSequence([4, 2,3,1,5])
console.log(r)