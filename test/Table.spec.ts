import { Table } from "../src"

const TestTable = new Table([
    { item: 'Cheese', price: 4.25, inventory: 10, category: 'Dairy' },
    { item: 'Milk', price: 2.25, inventory: 10, category: 'Dairy' },
    { item: 'Tomato', price: 2.00, inventory: 20, category: 'Produce' },
    { item: 'Cucumber', price: 1.00, inventory: 15, category: 'Produce' },
    { item: 'Apple', price: 1.50, inventory: 40, category: 'Produce' }
])

const TestPurchases = new Table([
    { item: 'Cheese', customer: 1, amount: 2 },
    { item: 'Tomato', customer: 1, amount: 1 },
    { item: 'Apple', customer: 2, amount: 3 },
    { item: 'Milk', customer: 3, amount: 1 },
])

describe("Table", () => {
    test("withColumn", () => {
        const table = TestTable
            .withColumn('totalValue', row => row.inventory * row.price)
            .withColumn('itemCategory', row => `${row.category} - ${row.item}`);
        expect(table.data[0]).toStrictEqual({ 
            item: 'Cheese', 
            price: 4.25, 
            inventory: 10, 
            category: 'Dairy',
            totalValue: 42.50,
            itemCategory: 'Dairy - Cheese'
        })
    });

    test("withoutColumn", () => {
        const table = TestTable.withoutColumn('inventory');
        expect(table.data[0]).toStrictEqual({
            item: 'Cheese',
            price: 4.25,
            category: 'Dairy',
        })
    });

    test("where", () => {
        const table = TestTable.where(row => row.category === 'Produce');
        expect(table.data.length).toBe(3);
    });

    test("groupby first", () => {
        const table = TestTable.groupBy(r => r.category).first().withoutColumn('id');
        expect(table.data).toStrictEqual([
            { item: 'Cheese', price: 4.25, inventory: 10, category: 'Dairy' },
            { item: 'Tomato', price: 2.00, inventory: 20, category: 'Produce' }
        ])
    })

    test("groupby counts", () => {
        const counts = TestTable.groupBy(r => r.category).counts();
        expect(counts.get('Dairy')).toBe(2);
        expect(counts.get('Produce')).toBe(3);
    })

    test("join", () => {
        const table = TestTable.innerJoin(TestPurchases, r => r.item, r => r.item, (left, right) => ({
            ...left,
            ...right
        }));
        expect(table.data.length).toBe(4);
        expect(table.data[0]).toStrictEqual({
            item: 'Cheese', 
            price: 4.25, 
            inventory: 10, 
            category: 'Dairy',
            customer: 1,
            amount: 2
        })
    })
})
