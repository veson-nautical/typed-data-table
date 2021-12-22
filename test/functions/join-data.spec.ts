import { joinData } from "../../src";

const DataA = [{
    id: 1,
    text: "A"
}, {
    id: 2,
    text: 'B'
}];
const DataB = [{
    id: 2,
    other: 'C'
}, {
    id: 3,
    other: 'D'
}];

const baseJoinArgs = {
    leftData: DataA,
    rightData: DataB,
    leftId: (x: any) => x.id,
    rightId: (x: any) => x.id,
    merge: (left: any, right: any) => ({...left, ...right})
};

test('inner join', () => {
    expect(joinData({
        ...baseJoinArgs,
        joinType: 'inner'

    })).toEqual([{
        id: 2,
        text: 'B',
        other: 'C'
    }]);
})

test('left join', () => {
    expect(joinData({
        ...baseJoinArgs,
        joinType: 'left'
    })).toEqual([{
        id: 1,
        text: "A"
    }, {
        id: 2,
        text: 'B',
        other: 'C'
    }]);
});

test('right join', () => {
    expect(joinData({
        ...baseJoinArgs,
        joinType: 'right'
    })).toEqual([{
        id: 2,
        text: 'B',
        other: 'C'
    }, {
        id: 3,
        other: 'D'
    }]);
});

test('outer join', () => {
    expect(joinData({
        ...baseJoinArgs,
        joinType: 'outer'
    })).toEqual([{
        id: 1,
        text: "A"
    }, {
        id: 2,
        text: 'B',
        other: 'C'
    }, {
        id: 3,
        other: 'D'
    }]);
});