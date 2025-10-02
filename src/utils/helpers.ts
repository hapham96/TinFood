export function displayKmLabel(num: number) {
    if (num < 1) {
        return '<1 km away';
    }
    return Math.round(num * 10) / 10 + ' km away';
};