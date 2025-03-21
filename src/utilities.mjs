export function required(name) {
    throw new Error(`Parameter '${name}' is required`);
}
