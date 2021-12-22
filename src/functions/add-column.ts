import { transformAsync } from "./transform-async";

/**
 * Adds a new top-level field to all objects in the provided data list updating the output type appropriately
 * to contain the newly provided field. Though named addColumn, this can be used for arbitrary object transformation.
 * 
 * @param data The list of input objects
 * @param column the name of the column field to add
 * @param func the function which, given an object, produces the value for the new column
 * @returns A new list of objects that contain the newly calcualted column field
 */
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

/**
 * Identical to {@link addColumn}, but calculates the new column asynchronously.
 * @param data The list of input objects
 * @param column the name of the column field to add
 * @param func the function which, given an object, returns a Promise for the value for the new column
 * @param concurrency the max number of Promises to issue at once
 * @returns A Promise for a new list of objects that contain the newly calcualted column field
 */
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

