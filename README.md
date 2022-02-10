# Typed Data Table
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/veson-nautical/typed-data-table/blob/main/LICENSE) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) [![Build](https://github.com/mshafir/typed-data-table/actions/workflows/build.yml/badge.svg)](https://github.com/veson-nautical/typed-data-table/actions/workflows/build.yml)


Typed data table is a typescript node project aiming to provide a type-safe way to interact with tabular data and a basic set of useful primitives.

[Live example](https://codesandbox.io/s/typed-data-table-examples-6wg1i?file=/src/index.ts)

[Documentation](https://veson-nautical.github.io/typed-data-table/)

[GitHub](https://github.com/veson-nautical/typed-data-table)

## Installation

`npm install typed-data-table`

## Usage

```ts
// Let's set up some tables to work with
let inventory = new Table([
  { item: "Cheese", price: 4.25, inventory: 10, category: "Dairy" },
  { item: "Milk", price: 2.25, inventory: 10, category: "Dairy" },
  { item: "Tomato", price: 2.0, inventory: 20, category: "Produce" },
  { item: "Cucumber", price: 1.0, inventory: 15, category: "Produce" },
  { item: "Apple", price: 1.5, inventory: 40, category: "Produce" }
]);

let purchases = new Table([
  { item: "Cheese", customer: 1, amount: 2 },
  { item: "Tomato", customer: 1, amount: 1 },
  { item: "Apple", customer: 2, amount: 3 },
  { item: "Milk", customer: 3, amount: 1 }
]);
```

### Add/Remove Column
you can define new columns and rename or remove columns with chaining
the value functions are typesafe, knowing about previous transformations
and preserving the type information of the objects in each row
```ts
const updatedInventory = inventory
  .withColumn("totalValue", (r) => r.price * r.inventory)
  .renameColumn("inventory", "amountInStock");
```

### Joining
You can join tables together in memory, again preserving type-assist for the resulting data structure
```ts
// you can do type-safe joins
const joinedPurchases = purchases
  .innerJoin(
    inventory,
    (r) => r.item,
    (r) => r.item,
    (left, right) => ({
      ...left,
      ...right
    })
  )
  .withColumn("cost", (r) => r.amount * r.price);
```

### Grouping
you can group the data as well, specifying the columns and how they're calculated over the groups of rows

```ts
const groupedByCustomer = joinedPurchases
  .groupBy((r) => r.customer)
  .aggregateByColumn({
    // makes a column 'total' that is the sum of the cost column for each group  
    total: (rows) => sum(rows.map((r) => r.cost)),
    // makes a column 'items' that is the sum of the amount column for each group
    items: (rows) => sum(rows.map((r) => r.amount))
  })
  // even the strings in this func will auto-complete, aggregating a group returns a table with the group key
  // as the 'id' column, you can rename this back to customer if desired.
  .renameColumn("id", "customer");
```
