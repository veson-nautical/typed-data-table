import { transformAsync, transformBatchAsync } from "../../src";

test('transformAsync', async () => {
    const result = await transformAsync([1,2,3],
        (val: number) => Promise.resolve().then(() =>
            val + 1));

    expect(result).toStrictEqual([2,3,4]);
})

test('transformBatchAsync', async () => {
    const result = await transformBatchAsync([1,2,3,4,5,6],
        (vals: number[]) => Promise.resolve().then(() =>
            [vals.reduce((a,b) => a + b, 0)]),
        2);

    expect(result).toStrictEqual([3,7,11])
})
