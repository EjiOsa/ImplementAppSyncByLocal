export declare function nullIfEmpty(obj: object): object | null;
export declare function unmarshall(raw: any, isRaw?: boolean): any;
declare type TableObject<T> = {
    [tableName: string]: T;
};
export declare function mapTableObject<T, R>(tableObject: TableObject<T>, mapper: (inp: T) => R): TableObject<R>;
export {};
