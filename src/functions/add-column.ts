import { transformAsync } from "./transform-async";

export function addColumn<RowType, ColName extends string, ColType>(
    data: RowType[],
    column: ColName,
    func: (row: RowType) => ColType
): (RowType & Record<ColName, ColType>)[] {
    return data.map(row => ({
        ...row,
        [column]: func(row)
    } as any));
}

export async function addColumnAsync<RowType, ColName extends string, ColType>(
    data: RowType[],
    column: ColName,
    func: (row: RowType) => Promise<ColType>,
    concurrency = 10
): Promise<(RowType & Record<ColName, ColType>)[]> {
    return transformAsync(data, async row => ({
        ...row,
        [column]: await func(row)
    } as any), concurrency);
}

