export function deleteColumn<RowType, ColName extends keyof RowType>(
    data: RowType[],
    column: ColName
): (Omit<RowType, ColName>)[] {
    return data.map(row => {
        delete row[column];
        return row;
    });
}