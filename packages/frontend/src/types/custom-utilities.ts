export type CustomPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ArrayElementType<T> = T extends readonly (infer U)[] ? U : never;

export type SomeRequired<T, K extends keyof T> = Omit<T, K> & Required<RequiredNotNull<Pick<T, K>>>;
export type RequiredNotNull<T> = {
	[P in keyof T]: NonNullable<T[P]>;
};
