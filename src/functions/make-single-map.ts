/**
 * Transforms a list of objects into a Map of key to object.
 * By default this will select the first object in the list for each unique key, unless valueComparer is provided.
 * 
 * @param data The list of objects to transform
 * @param keyFunc Function for extracting the key for the Map
 * @param valueFunc (Optional) a function to transform the Map values
 * @param valueComparer (Optional) a comparer to use to select the best object for each matching key. 
 *  Should return a value > 0 if the first arg is better to keep over the second.
 * @returns a Map from key to object, picking the best or first object in the data list for each unique key
 */
export function makeSingleMap<Row, Key, OutRow=Row>(
    data: Row[],
    keyFunc: (row: Row) => Key,
    valueFunc?: (row: Row) => OutRow,
    valueComparer?: (rowOne: OutRow, rowTwo: OutRow) => number
) {
    const map = new Map<Key, OutRow>();
    for (const row of data) {
        const key = keyFunc(row);
        const value = (valueFunc ? valueFunc(row) : row) as OutRow;
        if (!map.has(key) || (valueComparer && valueComparer(value, map.get(key)!) > 0)) {
            map.set(key, value);
        }
    }
    return map;
}