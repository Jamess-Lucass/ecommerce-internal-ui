import { createContext, PropsWithChildren, useContext } from "react";
import { Row, useCreateTable } from "../hooks/use-create-table";

type TodoContextType<T extends Row> = ReturnType<typeof useCreateTable<T>>;

const TableContext = createContext<TodoContextType<any>>(
  {} as TodoContextType<any>
);

type Props<T extends Row> = {
  initialValue: ReturnType<typeof useCreateTable<T>>;
};

export function TableProvider<T extends Row>({
  children,
  initialValue,
}: PropsWithChildren<Props<T>>) {
  return (
    <TableContext.Provider value={initialValue}>
      {children}
    </TableContext.Provider>
  );
}

export const useTable = () => useContext(TableContext);
