export function cp (v) {
    return JSON.parse(JSON.stringify(v));
}

export function ts (v) {
    return new Date().toISOString();
}
