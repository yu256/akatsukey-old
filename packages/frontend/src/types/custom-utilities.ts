export type CustomPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ArrayElementType<T> = T extends readonly (infer U)[] ? U : never;
