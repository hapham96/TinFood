export function displayKmLabel(num: number) {
    if (num == 0) {
        return 'Near you';
    }
    if (num < 1) {
        return '<1 km away';
    }
    return Math.round(num * 10) / 10 + ' km away';
};

export const isRunningInBrowser = () => typeof window !== 'undefined';

export function sleep(ms: number = 1000) {
    return new Promise((resolve) =>
        setTimeout(() => {
            resolve(ms);
        }, Math.abs(ms))
    );
}