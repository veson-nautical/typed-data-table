/**
 * Iterates through the provided data and selects the first element that matches each key
 * @param data a list of objects to process
 * @param keyFunc a function for computed each object's key
 * @returns a new list with only the first element matching each key
 */
export function firstUniqueRowBy<RowType>(data: RowType[], keyFunc: (row: RowType) => any) {
    const unique = new Set();
    const rows : RowType[] = [];
    for (const row of data) {
        const key = keyFunc(row);
        if (!unique.has(key)) {
            rows.push(row);
            unique.add(key);
        }
    }
    return rows;
}