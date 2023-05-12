import { ReactNode } from "react";
import { ZodType } from "zod";

export type Row = { id: string } & Record<
  string,
  string | number | null | undefined | object
>;

type DefaultOrderBy<T> = {
  column: keyof T;
  direction: "asc" | "desc";
};

type Defaults<T> = {
  orderBy: DefaultOrderBy<T>;
};

type Column<T extends Row> = {
  id: keyof T;
  name: string;
  cell: (col: T) => ReactNode;
  isOrderable?: boolean;
};

type Filters = {
  schema: ZodType;
  form: ReactNode;
};

type Props<T extends Row> = {
  url: string;
  key: (col: T) => string;
  columns: Column<T>[];
  exportOnClick?: (params: URLSearchParams) => void;
  createOnClick?: () => void;
  deleteEnabled?: boolean;
  defaults?: Defaults<T>;
  filters?: Filters;
};

export function useCreateTable<T extends Row>({
  url,
  key,
  columns,
  filters,
  exportOnClick,
  createOnClick,
  deleteEnabled,
  defaults,
}: Props<T>) {
  return {
    url,
    key,
    columns,
    filters,
    exportOnClick,
    createOnClick,
    deleteEnabled,
    defaults,
  };
}
