export type SortOption<T = unknown> = { key: string; by: T; order: 'asc' | 'desc'; label: string };
export type Primitive = string | number | boolean | null | undefined;
