/**
 * Sorts the values in a list by the specified keys in the order specified.
 * @param data 
 * @param keys the keys of the list to sort by
 * @param ascending whether to sort in ascending order or descending order
 * @param inplace whether to sort in place or return a new list
 * @returns 
 */
export function sortValues<RowType>(data: RowType[], keys: (keyof RowType)[], ascending: boolean = true, inplace: boolean = false) {
    const dataCopy = inplace ? data : [...data];
    dataCopy.sort((a, b) => {
        for (const key of keys) {
            if (a[key] == b[key]) {
                continue;
            } else if (a[key] < b[key]) {
                return ascending ? -1 : 1;
            }
        }
        return 0;
    });
    return dataCopy;
}
