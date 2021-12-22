/**
 * Iterates through
 * @param data 
 * @param keyFunc 
 * @returns 
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