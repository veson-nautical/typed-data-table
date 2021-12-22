
/**
 * Transforms a list of objects into an Map from key to list of object.
 * @param data The list of objects to transform
 * @param keyFunc The function to use to extract the keys for the output Map
 * @param valueFunc (Optional) a value function to transform the objects for the value list
 * @returns a Map from key to list of objects
 */
export function makeMultiMap<Row, Key, OutRow=Row>(data: Row[], keyFunc: (row: Row) => Key, valueFunc?: (row: Row) => OutRow) {
    const map = new Map<Key, OutRow[]>();
    for (const row of data) {
        const key = keyFunc(row);
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)!.push((valueFunc ? valueFunc(row) : row) as OutRow);
    }
    return map;
}
