export type ValidationErrorResponse<T> = {
  errors: Record<keyof T, string[]>;
};
