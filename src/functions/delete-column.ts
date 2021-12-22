/**
 * Deletes a field from a list of objects of RowType, updating the result type appropriately.
 * @param data The list of input objects
 * @param column The name of the field to remove
 * @param inplace Whether to modify the rows inplace or copy first
 * @returns A new list of objects without the provided field
 */
export function deleteColumn<RowType, ColName extends keyof RowType>(
    data: RowType[],
    column: ColName,
    inplace?: boolean
): (Omit<RowType, ColName>)[] {
    return data.map((row) => {
        if (!inplace) {
            row = {...row}
        }
        delete row[column];
        return row;
    });
}