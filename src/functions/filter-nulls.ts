export function filterNulls<T>(data: T[]): NonNullable<T>[] {
    return data.filter(row =>
        row !== null && row !== undefined) as NonNullable<T>[];
}