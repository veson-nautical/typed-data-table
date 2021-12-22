import chunk from "lodash.chunk";
import PromisePool from "es6-promise-pool";

/**
 * Transforms data one at a time from InRowType to OutRowType asynchronously.
 * This implementation uses an ES6 promise pool to issue concurrent promises up to the
 * specified concurrency limit. This is useful when issuing external service calls.
 * 
 * @param data a list of data elements to transform
 * @param func the (async) transformation function
 * @param concurrency the max number of promises to issue at one time (default 10)
 * @returns a list of transformed elements
 */
export async function transformAsync<InRowType, OutRowType>(
    data: InRowType[],
    func: (row: InRowType) => Promise<OutRowType>,
    concurrency = 10
): Promise<OutRowType[]> {
    const queue = [...data];
    const results : OutRowType[] = [];
    const promiseProducer = function() {
        const next = queue.shift();
        if (next) {
            return func(next).then(newRow => {
                results.push(newRow);
                return newRow;
            });
        }
    };
    const pool = new PromisePool(promiseProducer, concurrency);
    await pool.start();
    return results;
}

/**
 * Transforms data in batches from InRowType to OutRowType asynchronously.
 * The provided transformation function takes in a single batch (list of inputs) and should
 * return a list of transformed outputs. 
 * This implementation uses an ES6 promise pool to issue concurrent promises up to the
 * specified concurrency limit. This is useful when issuing external service calls.
 * 
 * @param data a list of data elements to transform
 * @param func the (async) transformation function
 * @param batchSize the size of each batch
 * @param concurrency the max number of promises to issue at one time (default 5)
 * @returns a list of transformed elements
 */
export async function transformBatchAsync<InRowType, OutRowType>(
    data: InRowType[],
    func: (row: InRowType[]) => Promise<OutRowType[]>,
    batchSize = 20,
    concurrency = 5
): Promise<OutRowType[]> {
    const batches: InRowType[][] = chunk(data, batchSize);
    const results: OutRowType[] = [];
    const promiseProducer = function() {
        const next = batches.shift();
        if (next) {
            return func(next).then(newRows => {
                results.push(...newRows);
                return newRows;
            });
        }
    };
    const pool = new PromisePool(promiseProducer, concurrency);
    await pool.start();
    return results;
}