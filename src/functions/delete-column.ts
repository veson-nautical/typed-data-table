/**
 * Deletes a field from a list of objects of RowType, updating the result type appropriately
 * @param data The list of input objects
 * @param column The name of the field to remove
 * @returns A new list of objects without the provided field
 */
export function deleteColumn<RowType, ColName extends keyof RowType>(
    data: RowType[],
    column: ColName
): (Omit<RowType, ColName>)[] {
    return data.map(row => {
        delete row[column];
        return row;
    });
}