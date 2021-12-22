import { makeMap } from "./make-map";

export type JoinDataArgs<LeftRowType, RightRowType, IdType, OutputType> = {
    leftData: LeftRowType[],
    rightData: RightRowType[],
    leftId: (row: LeftRowType) => IdType,
    rightId: (row: RightRowType) => IdType
} & ({
    joinType: 'inner',
    merge: (left: LeftRowType, right: RightRowType) => OutputType
} | {
    joinType: 'left',
    merge: (left: LeftRowType, right: RightRowType | undefined) => OutputType
} | {
    joinType: 'right',
    merge: (left: LeftRowType | undefined, right: RightRowType) => OutputType
} | {
    joinType: 'outer',
    merge: (left: LeftRowType | undefined, right: RightRowType | undefined) => OutputType
});

export function joinData<LeftRowType, RightRowType, IdType, OutputType>(
    args : JoinDataArgs<LeftRowType, RightRowType, IdType, OutputType>
) : OutputType[] {
    const { leftData, rightData, leftId, rightId, merge } = args;
    const rightMap = makeMap(rightData, rightId);
    const rightKeys = new Set(rightMap.keys());
    const result = leftData.flatMap(row => {
        const key = leftId(row);
        const matches = rightMap.get(key);
        const matchDefault = (args.joinType === 'left' || args.joinType === 'outer') ?
            args.merge(row, undefined) : [];
        // remove any keys that are matched from the right map
        if (matches && matches.length > 0) {
            rightKeys.delete(key);
        }
        return matches?.map(match => merge(row, match)) ?? matchDefault;
    });
    if (args.joinType === 'right' || args.joinType === 'outer') {
        for (const rightKey of rightKeys) {
            for (const rightRow of rightMap.get(rightKey) ?? []) {
                result.push(args.merge(undefined, rightRow));
            }
        }
    }
    return result;
}