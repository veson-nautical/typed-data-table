import chunk from "lodash.chunk";
import PromisePool from "es6-promise-pool";

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