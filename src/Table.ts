import { makeMultiMap } from "./functions/make-multi-map";
import { addColumn, addColumnAsync } from "./functions/add-column";
import { joinData } from "./functions/join-data";
import { transformAsync, transformBatchAsync } from "./functions/transform-async";
import { deleteColumn } from "./functions/delete-column";
import { makeSingleMap } from "./functions/make-single-map";
import { filterNulls } from "./functions/filter-nulls";
import { firstUniqueRowBy } from "./functions/first-unique-row-by";
import { aggregate, aggregateByColumn, AggregationFuncMap, max, mean, min, sum } from "./functions/aggregate";
import { sortValues } from './functions/sort-values';
import { rollingWindow } from "./functions/rolling-window";
import { PickNumericKeys } from "./type-helpers";


/**
 * A companion for the {@link Table} data structure when working with windowed data.
 */
export class Window<RowType> {
    data: RowType[][];

    constructor(data: RowType[][]) {
        this.data = data;
    }

    aggregate<OutputRowType>(aggFunc: (window: Table<RowType>) => OutputRowType) {
        return new Table(this.data.map(window => aggFunc(new Table(window))));
    }
}

/**
 * A companion for the {@link Table} data structure when working with grouped data.
 */
export class Grouping<KeyType, RowType> {
    data: Map<KeyType, RowType[]>;

    constructor(data: Map<KeyType, RowType[]>) {
        this.data = data;
    }

    aggregate<AggType>(aggFunc: (row: RowType[]) => AggType) {
        return Table.fromMap(aggregate(this.data, aggFunc));
    }

    aggregateByColumn<AggFuncsMapType extends AggregationFuncMap<RowType>>(aggregations: AggFuncsMapType) {
        return Table.fromMap(aggregateByColumn(this.data, aggregations));
    }

    /**
     * Aggregates the grouping by returning the first row for each key
     * @returns A Table of the aggregated output
     */
    first() {
        return this.aggregate(rows => rows.length > 0 ? rows[0] : null).filterNulls();
    }

    /**
     * Aggregates the grouping by returning the last row for each key
     * @returns A Table of the aggregated output
     */
    last() {
        return this.aggregate(rows => rows.length > 0 ? rows.slice(-1)[0] : null).filterNulls();
    }

    /**
     * Aggregates a grouping by returning the number of rows for each key
     * @returns a Map of key => count
     */
    counts() {
        return aggregate(this.data, rows => rows.length)
    }
}

/**
 * A type-safe data structure for working with tabular data. It provides a fluent syntax to make adding columns and 
 * transformations as consise as possible.
 */
export class Table<RowType> {
    /**
     * Stores the underlying data for the table
     */
    data: RowType[];

    constructor(data: RowType[] | Table<RowType>) {
        this.data = data instanceof Table ? data.data : data;
    }

    static fromMap<KeyType, MapRowType>(map: Map<KeyType, MapRowType>) {
        const data: (MapRowType & { id: KeyType})[] = [];
        for (const [key, val] of map.entries()) {
            data.push({ id: key, ...val });
        }
        return new Table(data);
    }

    toMultiMap<K>(keyFunc: (row: RowType) => K) {
        return makeMultiMap(this.data, keyFunc);
    }

    toSingleMap<K>(keyFunc: (row: RowType) => K) {
        return makeSingleMap(this.data, keyFunc);
    }

    /**
     * Group data in the table by the provided keyFunc creating a {@link Grouping} object.
     * @param keyFunc 
     * @returns 
     */
    groupBy<K>(keyFunc: (row: RowType) => K) {
        return new Grouping(this.toMultiMap(keyFunc));
    }

    /**
     * Fetch the first row for each value of keyFunc
     * @param keyFunc 
     * @returns 
     */
    firstUniqueRowBy(keyFunc: (row: RowType) => any) {
        return new Table(firstUniqueRowBy(this.data, keyFunc));
    }

    /**
     * Adds a new calculated column to the table
     * @param column the name of the column
     * @param func the function to compute the column
     * @returns A new table with the provided column
     */
    withColumn<ColName extends string, ColType>(column: ColName, func: (row: RowType) => ColType) {
        const newDf = addColumn(this.data, column, func);
        return new Table(newDf);
    }

    /**
     * Like {@link Table#addColumn}, but async
     * @param column 
     * @param func 
     * @param concurrency max number of Promises running at any one time
     * @returns 
     */
    async withAsyncColumn<ColName extends string, ColType>(column: ColName, func: (row: RowType) => Promise<ColType>, concurrency?: number) {
        const newDf = await addColumnAsync(this.data, column, func, concurrency);
        return new Table(newDf);
    }

    /**
     * Deletes the specified column from the Table
     * @param column the name of the column to delete
     * @param inplace whether to modify the rows inplace or make a copy
     * @returns a new Table without the specified column
     */
    withoutColumn<ColName extends keyof RowType>(column: ColName, inplace?: boolean) {
        const newDf = deleteColumn(this.data, column, inplace);
        return new Table(newDf);
    }

    /**
     * Renames a column
     * @param oldName 
     * @param newName 
     * @returns a new Table with the column renamed
     */
    renameColumn<OldColName extends keyof RowType, NewColName extends string>(oldName: OldColName, newName: NewColName) {
        return this
            .withColumn(newName, row => row[oldName])
            .withoutColumn(oldName);
    }

    innerJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[] | Table<RightRowType>,
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType, right: RightRowType) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: new Table(data).data,
            leftId,
            rightId,
            joinType: 'inner',
            merge
        }));
    }

    leftJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[] | Table<RightRowType>,
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType, right?: RightRowType) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: new Table(this.data).data,
            rightData: new Table(data).data,
            leftId,
            rightId,
            joinType: 'left',
            merge
        }));
    }

    rightJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[] | Table<RightRowType>,
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType | undefined, right: RightRowType) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: new Table(data).data,
            leftId,
            rightId,
            joinType: 'right',
            merge
        }));
    }

    outerJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[] | Table<RightRowType>,
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType | undefined, right: RightRowType | undefined) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: new Table(data).data,
            leftId,
            rightId,
            joinType: 'outer',
            merge
        }));
    }

    /**
     * Filter a table to rows matching the specified condition
     * @param condition 
     * @returns 
     */
    where(condition: (row: RowType) => boolean): Table<RowType> {
        return new Table<RowType>(this.data.filter(condition));
    }

    /**
     * Transforms a table row-by-row, producing a new Table of the output
     * @param func 
     * @returns 
     */
    transform<OutRowType>(func: (row: RowType) => OutRowType): Table<OutRowType> {
        return new Table<OutRowType>(this.data.map(func));
    }

    /**
     * Transforms a table row-by-row asynchronously, producing a new Table of the output
     * @param func 
     * @param concurrency
     * @returns 
     */
    async transformAsync<OutRowType>(func: (row: RowType) => Promise<OutRowType>, concurrency = 10): Promise<Table<OutRowType>> {
        return new Table<OutRowType>(await transformAsync(this.data, func, concurrency));
    }

    /**
     * Transforms a table in batches asyncrhonously, producing a new Table of the output
     * @param func 
     * @param batchSize
     * @param concurrency
     * @returns 
     */
    async transformBatchAsync<OutRowType>(func: (row: RowType[]) => Promise<OutRowType[]>, batchSize = 20, concurrency = 5): Promise<Table<OutRowType>> {
        return new Table<OutRowType>(await transformBatchAsync(this.data, func, batchSize, concurrency));
    }

    /**
     * Filters out null and undefined rows from a table
     * @returns a new Table with nulls and undefined filtered out
     */
    filterNulls() : Table<NonNullable<RowType>> {
        return new Table<NonNullable<RowType>>(filterNulls(this.data));
    }

    /**
     * Append additional rows to this table
     * @param rows 
     * @returns a new Table with the appended rows
     */
    append(...rows: RowType[]) {
        return new Table([...this.data, ...rows]);
    }

    /**
     * Append additional rows to this table in place
     * @param rows 
     * @returns the existing table with the rows appeneded
     */
    appendInPlace(...rows: RowType[]) {
        this.data.push(...rows);
        return this;
    }

    /**
     * Performs a side-effect function with the data. This is useful for recording something about intermediate
     * state without breaking out of the type-safe builder pattern.
     * @param func
     */
    sideEffect(func: (data: RowType[]) => void) {
        func(this.data);
        return this;
    }

    /**
     * Returns a rolling window of the provided size over the table
     * @param windowSize 
     * @returns 
     */
    rolling(windowSize: number, offsetSize = 1, on?: (row: RowType, index: number) => number, minPeriods?: number) {
        return new Window(rollingWindow(this.data, windowSize, offsetSize, on, minPeriods));
    }

    /**
     * Sorts the values in the table by the specifed keys
     * @param keys 
     * @param ascending 
     * @param inplace 
     * @returns 
     */
    sortValues(keys: (keyof RowType)[], ascending: boolean = true, inplace: boolean = false) {
        if (inplace) {
            sortValues(this.data, keys, ascending, true);
            return this;
        } else {
            return new Table(sortValues(this.data, keys, ascending, false));
        }
    }

    /**
     * Returns the mean over the specied key
     * @param key 
     * @returns 
     */
    mean(key: keyof PickNumericKeys<RowType>) {
        return mean(this.data.map(r => r[key] as any));
    }

    /**
     * Returns the mean over the specied key
     * @param key 
     * @returns 
     */
    sum(key: keyof PickNumericKeys<RowType>) {
        return sum(this.data.map(r => r[key] as any));
    }

    /**
     * Returns the mean over the specied key
     * @param key 
     * @returns 
     */
    min(key: keyof PickNumericKeys<RowType>) {
        return min(this.data.map(r => r[key] as any));
    }

    /**
     * Returns the mean over the specied key
     * @param key 
     * @returns 
     */
    max(key: keyof PickNumericKeys<RowType>) {
        return max(this.data.map(r => r[key] as any));
    }

    /**
     * Returns the first row in the table
     * @returns 
     */
    first() {
        return this.data[0];
    }

    /**
     * Returns the last row in the table
     * @returns 
     */
    last() {
        return this.data.slice(-1)[0];
    }

    /**
     * Returns the row count of the table
     * @returns 
     */
    size() {
        return this.data.length;
    }
}