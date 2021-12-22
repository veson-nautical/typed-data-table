/**
 * Filters out null and undefined values from a list, typing the result so typescript knows the output is NonNullable
 * @param data 
 * @returns 
 */
export function filterNulls<T>(data: T[]): NonNullable<T>[] {
    return data.filter(row =>
        row !== null && row !== undefined) as NonNullable<T>[];
}