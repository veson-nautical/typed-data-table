import { makeMultiMap } from "./functions/make-multi-map";
import { addColumn, addColumnAsync } from "./functions/add-column";
import { joinData } from "./functions/join-data";
import { transformAsync, transformBatchAsync } from "./functions/transform-async";
import { deleteColumn } from "./functions/delete-column";
import { makeSingleMap } from "./functions/make-single-map";
import { filterNulls } from "./functions/filter-nulls";
import { firstUniqueRowBy } from "./functions/first-unique-row-by";

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

    toMultiMap<K>(keyFunc: (row: RowType) => K) {
        return makeMultiMap(this.data, keyFunc);
    }

    toSingleMap<K>(keyFunc: (row: RowType) => K) {
        return makeSingleMap(this.data, keyFunc);
    }

    firstUniqueRowBy(keyFunc: (row: RowType) => any) {
        return new Table(firstUniqueRowBy(this.data, keyFunc));
    }

    withColumn<ColName extends string, ColType>(column: ColName, func: (row: RowType) => ColType) {
        const newDf = addColumn(this.data, column, func);
        return new Table(newDf);
    }

    async withAsyncColumn<ColName extends string, ColType>(column: ColName, func: (row: RowType) => Promise<ColType>, concurrency?: number) {
        const newDf = await addColumnAsync(this.data, column, func, concurrency);
        return new Table(newDf);
    }

    withoutColumn<ColName extends keyof RowType>(column: ColName) {
        const newDf = deleteColumn(this.data, column);
        return new Table(newDf);
    }

    renameColumn<OldColName extends keyof RowType, NewColName extends string>(oldName: OldColName, newName: NewColName) {
        return this
            .withColumn(newName, row => row[oldName])
            .withoutColumn(oldName);
    }

    innerJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[],
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType, right: RightRowType) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: data,
            leftId,
            rightId,
            joinType: 'inner',
            merge
        }));
    }

    leftJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[],
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType, right?: RightRowType) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: data,
            leftId,
            rightId,
            joinType: 'left',
            merge
        }));
    }

    rightJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[],
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType | undefined, right: RightRowType) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: data,
            leftId,
            rightId,
            joinType: 'right',
            merge
        }));
    }

    outerJoin<RightRowType, IdType, OutputType>(
        data: RightRowType[],
        leftId: (row: RowType) => IdType,
        rightId: (row: RightRowType) => IdType,
        merge: (left: RowType | undefined, right: RightRowType | undefined) => OutputType
    ) : Table<OutputType> {
        return new Table<OutputType>(joinData({
            leftData: this.data,
            rightData: data,
            leftId,
            rightId,
            joinType: 'outer',
            merge
        }));
    }

    where(condition: (row: RowType) => boolean): Table<RowType> {
        return new Table<RowType>(this.data.filter(condition));
    }

    transform<OutRowType>(func: (row: RowType) => OutRowType): Table<OutRowType> {
        return new Table<OutRowType>(this.data.map(func));
    }

    async transformAsync<OutRowType>(func: (row: RowType) => Promise<OutRowType>, concurrency = 10): Promise<Table<OutRowType>> {
        return new Table<OutRowType>(await transformAsync(this.data, func, concurrency));
    }

    async transformBatchAsync<OutRowType>(func: (row: RowType[]) => Promise<OutRowType[]>, batchSize = 20, concurrency = 5): Promise<Table<OutRowType>> {
        return new Table<OutRowType>(await transformBatchAsync(this.data, func, batchSize, concurrency));
    }

    filterNulls() : Table<NonNullable<RowType>> {
        return new Table<NonNullable<RowType>>(filterNulls(this.data));
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
}