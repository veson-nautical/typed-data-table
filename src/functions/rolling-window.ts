
/**
 * Returns rolling windows of the given size of the input list.
 * @param data the input data list
 * @param windowSize 
 * @param on  a function for the value to compute the window over, by default this is the index
 * @param minPeriods Minimum number of observations in window required to have a value; 
 *  defaults to 1 if `on` is provided, otherwise `windowSize`
 * @returns list of rolling windows
 */
export function rollingWindow<RowType>(
    data: RowType[], 
    windowSize: number, 
    on?: (row: RowType, index: number) => number,
    minPeriods?: number
) : RowType[][] {
    const result : RowType[][] = [];
    const preparedData = data.map((row, index) => ({
        value: on ? on(row, index) : index, 
        row
    }))
    preparedData.sort((a, b) => a.value - b.value);

    const minPeriodsValue = minPeriods ?? (on ? 1 : windowSize)

    for (let i=0; i < preparedData.length; i++) {
        let chunk : RowType[] = [];

        // take from the start of the window until we pass the window size
        for (let j=i; j < preparedData.length; j++) {
            if (preparedData[j].value - preparedData[i].value >= windowSize) {
                break;
            }
            chunk.push(preparedData[j].row);
        }

        // if we have enough observations, add to the result
        if (chunk.length >= minPeriodsValue) {
            result.push(chunk);
        }
    }
    return result
}