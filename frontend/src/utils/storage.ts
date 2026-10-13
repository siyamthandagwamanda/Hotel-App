const STORAGE_KEY = 'nextstay.landingSeen';

export function loadLandingSeen(): boolean {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function saveLandingSeen(value: boolean): void {
    window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
}