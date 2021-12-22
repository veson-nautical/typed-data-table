import { aggregate, aggregateByColumn, makeMultiMap, sum } from "../../src";

const TestData = makeMultiMap([
    { item: 'Cheese', price: 4.25, inventory: 10, category: 'Dairy' },
    { item: 'Tomato', price: 2.00, inventory: 20, category: 'Produce' },
    { item: 'Apple', price: 1.50, inventory: 40, category: 'Produce' }
], r => r.category)

test('aggregate', () => {
    const result = aggregate(TestData, items => items.length)

    expect(result.size).toEqual(2);
    expect(result.get('Dairy')).toEqual(1);
    expect(result.get('Produce')).toEqual(2);
})

test('aggregateByColumn', async () => {
    const result = aggregateByColumn(TestData,
        {
            count: rows => rows.length,
            inventoryTotal: rows => sum(rows.map(r => r.price * r.inventory))
        })
    expect(result.size).toEqual(2);
    expect(result.get('Dairy')).toStrictEqual({ count: 1, inventoryTotal: 42.5 });
    expect(result.get('Produce')).toStrictEqual({ count: 2, inventoryTotal: 100.0 });
})
