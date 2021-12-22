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