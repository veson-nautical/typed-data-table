export type PickNumericKeys<T> = { 
    [K in keyof T as T[K] extends number ? K : never]: T[K] 
};
