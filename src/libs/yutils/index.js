export function cp (v) {
    return JSON.parse(JSON.stringify(v));
}

export function ts (v) {
    return new Date().toISOString();
}

export function catom (atom, fn) {
    const new_atom = cp(atom);

    fn(new_atom);

    return new_atom;
}
