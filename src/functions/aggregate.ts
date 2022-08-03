/**
 * Aggregates a MultiMap as produced by {@link makeMultiMap} using aggFunc over every value list to produce
 * a new transformed Map
 * @param data The input MultiMap
 * @param aggFunc A function aggregate a list of MultiMap values into a new aggregated type
 * @returns The aggregated Map from data KeyType to aggFunc output type
 */
export function aggregate<KeyType, RowType, AggregatedType>(
    data: Map<KeyType, RowType[]>,
    aggFunc: (rows: RowType[]) => AggregatedType
) : Map<KeyType, AggregatedType> {
    const result = new Map<KeyType, AggregatedType>();
    for (const [key, value] of data.entries()) {
        result.set(key, aggFunc(value));
    }
    return result;
}

type ExtractObjectFuncResults<T> = { 
    [C in keyof T]: T[C] extends (...args: any) => any ? ReturnType<T[C]> : unknown
}

export type AggregationFuncMap<T> = { 
    [K: string]: (args: T[]) => any 
}

/**
 * Aggregates a MultiMap as produced by {@link makeMultiMap} across multiple fields at once
 * @param data The data
 * @param aggregations an object of column => aggregation function for a list of values from that column
 * @returns A Multimap with the same keys and the outputs for each column in aggregations
 */
export function aggregateByColumn<KeyType, RowType, AggFuncsMapType extends AggregationFuncMap<RowType>>(
    data: Map<KeyType, RowType[]>,
    aggregations: AggFuncsMapType
): Map<KeyType, ExtractObjectFuncResults<AggFuncsMapType>> {
    return aggregate(data, (rows) => {
        const result : any = {};
        for (const [key, aggFunc] of Object.entries(aggregations)) {
            result[key] = (aggFunc as any)(rows);
        }
        return result;
    })
}

// ----------------------------------------------------
// Some common Aggregations for Convenience
// ----------------------------------------------------
export const sum = (items: number[]) => items.reduce((a, b) => a + b, 0);
export const product = (items: number[]) => items.length === 0 ? 0 : items.reduce((a, b) => a * b, 1.0);
export const min = (items: number[]) => Math.min(...items);
export const max = (items: number[]) => Math.max(...items);
export const mean = (items: number[]) => items.length === 0 ? NaN : sum(items) / items.length;
export const variance = (items: number[]) => {
    const itemMean = mean(items);
    return mean(items.map(it => Math.pow(it - itemMean, 2)));
};
export const standardDeviation = (items: number[]) => Math.sqrt(variance(items));
export const first = <T>(items: T[]) => items[0];
export const last = <T>(items: T[]) => items.slice(-1)[0];

/**
 * Finds the first index of the minimum value in the provide numeric list
 * @param items 
 */
export const minIndex = (items: number[]) => {
    let idx = null, minVal = null;
    for (let i = 0; i < items.length; i++) {
        if (minVal === null || items[i] < minVal) {
            minVal = items[i];
            idx = i;
        }
    }
    return idx;
}

/**
 * Finds the first index of the minimum value in the provide numeric list
 * @param items 
 */
export const maxIndex = (items: number[]) => {
    let idx = null, maxVal = null;
    for (let i = 0; i < items.length; i++) {
        if (maxVal === null || items[i] > maxVal) {
            maxVal = items[i];
            idx = i;
        }
    }
    return idx;
}