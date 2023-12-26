import { StPage } from "@/app/model/types";
import { getChangedProps } from "./getChangedProps";

const testCases = [
    {
        currPage: {
            id: '1',
            userId: 'user1',
            title: 'Title',
        },
        newPage: {
            id: '1',
            userId: 'user1',
            title: 'Title',
        },
        expected: {}
    },
    {
        currPage: {
            id: '1',
            userId: 'user1',
            title: 'Title',
        },
        newPage: {
            id: '1',
            userId: 'user2', // Changed value
            title: 'Updated Title', // Changed value
            description: 'Description', // New property
        },
        expected: {
            userId: 'user2',
            title: 'Updated Title',
            description: 'Description',
        }
    },
    {
        currPage: {
            id: '1',
            userId: 'user1',
        },
        newPage: {
            id: '1',
            userId: 'user2',
            title: 'Title', // New property
        },
        expected: {
            userId: 'user2',
            title: 'Title',
        }
    },
    {
        currPage: {
            id: '1',
            userId: 'user1',
            title: 'Title', // Existing property
        },
        newPage: {
            id: '1',
            userId: 'user2',
        },
        expected: {
            userId: 'user2',
        }
    }
]

describe('getChangedProps', () => {
    testCases.forEach(({ currPage, newPage, expected }) => {
        it(`should return ${JSON.stringify(expected)} when currPage is ${JSON.stringify(currPage)} and newPage is ${JSON.stringify(newPage)}`, async () => {
            const changedProps = await getChangedProps(currPage as StPage, newPage as Partial<StPage>);
            expect(changedProps).toEqual(expected);
        })
    })
});
