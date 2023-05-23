import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  Skeleton,
  Table as ChakraTable,
  TableContainer,
  Tag,
  TagCloseButton,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiFilter,
  FiPlus,
  FiRefreshCcw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import {
  ChangeEvent,
  createContext as createReactContext,
  useEffect,
  useContext as useReactContext,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useFormContext } from "react-hook-form";
import { useTable } from "../../contexts/table-context";
import { Row } from "../../hooks/use-create-table";

type CreateContextReturn<T> = [React.Provider<T>, () => T];

type ODataResponse<T> = {
  count: number;
  value: T[];
};

export function createContext<T>() {
  const Context = createReactContext<T | undefined>(undefined);

  function useContext() {
    const context = useReactContext(Context);

    if (!context) {
      const error = new Error();
      error.name = "ContextError";
      throw error;
    }

    return context;
  }

  return [Context.Provider, useContext] as CreateContextReturn<T>;
}

export function Table() {
  const table = useTable();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  type Inputs = Record<string, unknown>;
  const {
    reset,
    resetField,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useFormContext();

  const initialTablePageSize =
    window.localStorage.getItem("table-page-size") || "15";

  const [query, setQuery] = useState<URLSearchParams>(
    new URLSearchParams(`top=${initialTablePageSize}&count=true`)
  );
  const [orderedColumn, setOrderedColumn] = useState({
    name: table.defaults?.orderBy?.column,
    direction: table.defaults?.orderBy?.direction,
  });
  const [selectedItems, setSelectedItems] = useState<Row[]>([]);

  const getData = async (signal: AbortSignal | undefined, filters: string) => {
    const response = await axios.get<ODataResponse<Row>>(
      `${table.url}?${filters}`,
      {
        signal,
        withCredentials: true,
      }
    );

    return response.data;
  };

  const { data, isLoading, isRefetching, refetch } = useQuery(
    [new URL(table.url).pathname, query.toString()],
    ({ signal }) => getData(signal, query.toString())
  );

  const deleteRowMutation = useMutation(
    (id: string) =>
      axios.delete(`${table.url}/${id}`, {
        withCredentials: true,
      }),
    {
      onSuccess: (_, id) => {
        queryClient.removeQueries([new URL(table.url).pathname]);

        setSelectedItems((prev) => prev.filter((x) => x.id !== id));

        onClose();
      },
    }
  );

  const highlightedRowBackgroundColor = useColorModeValue(
    "gray.200",
    "gray.700"
  );

  const showRowSelect = table.deleteEnabled;

  const range = (start: number, end: number) => {
    const length = Math.ceil(end - start) < 0 ? 0 : Math.ceil(end - start);

    return Array(length)
      .fill(start)
      .map((x, y) => x + y);
  };

  const handleSearchOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeout(() => {
      const params = new URLSearchParams(query);

      if (!event.target.value) {
        // search param cannot be empty
        params.delete("search");
        setQuery(params);

        return;
      }

      params.set("search", `"${event.target.value}"`);
      setQuery(params);
    }, 500);
  };

  const getColumnHeaderOrderColour = (
    name: string,
    directory: "asc" | "desc"
  ) => {
    return orderedColumn.name === name && orderedColumn.direction === directory
      ? "cyan.300"
      : "inherit";
  };

  const handleColumnHeaderOnClick = (name: string) => {
    const params = new URLSearchParams(query);

    if (orderedColumn.name === name) {
      // Flip the direction

      const direction = orderedColumn.direction === "asc" ? "desc" : "asc";
      setOrderedColumn({
        name,
        direction: direction,
      });

      params.set("orderby", `${name} ${direction}`);
      setQuery(params);
      return;
    }

    setOrderedColumn({ name, direction: "asc" });
    params.set("orderby", `${name} asc`);
    setQuery(params);
  };

  const handlePageOnClick = (page: number) => {
    const params = new URLSearchParams(query);

    const top = Number(params.get("top"));
    const skip = (page - 1) * top;

    params.set("skip", skip.toString());

    setQuery(params);
  };

  const handleSelectAllCheckboxOnChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setSelectedItems(data?.value ?? []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectCheckboxOnClick = (row: Row) => {
    const item = selectedItems.find((x) => x === row);

    if (item) {
      const items = [...selectedItems];
      items.splice(items.indexOf(item), 1);

      setSelectedItems(items);
    } else {
      setSelectedItems([...selectedItems, row]);
    }
  };

  const handleRefreshOnClick = () => {
    refetch();
  };

  const handleDeleteConfirmationClick = () => {
    for (const item of selectedItems) {
      deleteRowMutation.mutate(item.id);
    }
  };

  const handleResetFiltersOnClick = () => {
    reset();
    handleSubmit(onSubmit)();
  };

  const handleResetFilterOnClick = (filter: string) => {
    resetField(filter);
    handleSubmit(onSubmit)();
  };

  const handlePageSizeOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    window.localStorage.setItem("table-page-size", value);

    const params = new URLSearchParams(query);
    params.set("top", value);
    setQuery(params);
  };

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const params = new URLSearchParams(query);
    params.delete("filter");

    const filters = Object.entries(data)
      .filter(([, value]) => !!value)
      .map(([key, value]) => `${key} contains '${value}'`);

    if (filters.length > 0) {
      params.set("filter", filters.join(" and "));
    }

    setQuery(params);
  };

  const allSelected = data?.value.every((x) => selectedItems.includes(x));
  const isIndeterminate =
    data?.value.some((x) => selectedItems.includes(x)) && !allSelected;

  const totalPages =
    Math.ceil((data?.count || 1) / Number(query.get("top"))) ?? 1;
  const page =
    Number(query.get("skip") ?? 0) / Number(query.get("top") ?? 1) + 1;
  const first = Math.max(1, page - 3);
  const last = Math.min(totalPages, page + 3);

  return (
    <>
      <Flex gap={2} flexDirection="column" mt={4} h="97%">
        <Flex
          gap={4}
          alignItems={{ base: "start", md: "center" }}
          flexDir={{ base: "column", md: "row" }}
        >
          <InputGroup width={72} size="sm">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              borderRadius="md"
              placeholder="Search"
              onChange={handleSearchOnChange}
            />
          </InputGroup>

          <Flex gap={4}>
            {table.filters?.form && (
              <Menu isLazy size="lg">
                <MenuButton
                  as={Button}
                  fontWeight="medium"
                  variant="outline"
                  leftIcon={<FiFilter />}
                  rightIcon={<FiChevronDown />}
                  size="sm"
                >
                  Filters
                </MenuButton>
                <MenuList p={4} w={{ base: "100vw", md: "lg" }}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Flex gap={2} flexDir="column">
                      {table.filters.form}

                      <Flex justifyContent="flex-end" mt={4}>
                        <ButtonGroup size="sm">
                          <Button
                            variant="outline"
                            colorScheme="red"
                            onClick={handleResetFiltersOnClick}
                          >
                            Reset
                          </Button>
                          <Button
                            colorScheme="blue"
                            type="submit"
                            isLoading={isSubmitting}
                          >
                            Apply
                          </Button>
                        </ButtonGroup>
                      </Flex>
                    </Flex>
                  </form>
                </MenuList>
              </Menu>
            )}

            <Button
              size="sm"
              fontWeight="medium"
              variant="outline"
              leftIcon={<FiRefreshCcw />}
              onClick={handleRefreshOnClick}
            >
              Refresh
            </Button>

            {table.createOnClick && (
              <Button
                size="sm"
                fontWeight="medium"
                variant="outline"
                leftIcon={<FiPlus />}
                onClick={table.createOnClick}
              >
                Create
              </Button>
            )}

            {table.deleteEnabled && (
              <Button
                size="sm"
                fontWeight="medium"
                variant="outline"
                leftIcon={<FiTrash2 />}
                onClick={onOpen}
                isDisabled={selectedItems.length === 0}
              >
                Delete
              </Button>
            )}
          </Flex>
        </Flex>

        {Object.entries(getValues()).some(([, value]) => !!value) && (
          <Flex p={2}>
            <Flex alignItems="center" gap={2} flex={1}>
              <Icon as={FiFilter} />
              {Object.entries(getValues())
                .filter(([, value]) => !!value)
                .map(([key, value]) => (
                  <Tag
                    size="md"
                    key={key}
                    borderRadius="full"
                    variant="subtle"
                    colorScheme="blue"
                  >
                    <TagLabel>
                      {key}: {value}
                    </TagLabel>
                    <TagCloseButton
                      onClick={() => handleResetFilterOnClick(key)}
                    />
                  </Tag>
                ))}
            </Flex>

            <Button
              size="sm"
              fontWeight="medium"
              onClick={handleResetFiltersOnClick}
            >
              Reset filters
            </Button>
          </Flex>
        )}

        <TableContainer flex={1} mt={1}>
          <ChakraTable
            variant="simple"
            colorScheme="gray"
            size="sm"
            overflowX="auto"
          >
            <Thead h={8}>
              <Tr>
                {showRowSelect && (
                  <Th w="0" pr={1}>
                    <Checkbox
                      isDisabled={
                        !data ||
                        data?.value.length == 0 ||
                        isLoading ||
                        isRefetching
                      }
                      isChecked={allSelected}
                      isIndeterminate={isIndeterminate}
                      onChange={handleSelectAllCheckboxOnChange}
                    />
                  </Th>
                )}
                {table.columns.map(({ id, name, isOrderable = true }) => (
                  <Th
                    key={id.toString()}
                    cursor={isOrderable ? "pointer" : "default"}
                    pr={0}
                    onClick={() =>
                      isOrderable
                        ? handleColumnHeaderOnClick(id.toString())
                        : undefined
                    }
                  >
                    <Flex alignItems="center">
                      <Text flex={1}>{name}</Text>
                      {isOrderable && (
                        <Box lineHeight={0}>
                          <Icon
                            as={BsFillCaretUpFill}
                            h={2}
                            display="block"
                            color={getColumnHeaderOrderColour(
                              id.toString(),
                              "asc"
                            )}
                          />
                          <Icon
                            as={BsFillCaretDownFill}
                            h={2}
                            color={getColumnHeaderOrderColour(
                              id.toString(),
                              "desc"
                            )}
                          />
                        </Box>
                      )}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody position="relative">
              {!data?.value &&
                Array(18).map((x) => (
                  <Tr key={x}>
                    <Td height="10px" colSpan={10}>
                      <Skeleton
                        height="full"
                        speed={1.2}
                        startColor="gray.700"
                      />
                    </Td>
                  </Tr>
                ))}
              {data?.value.length === 0 && (
                <Tr>
                  <Td height={96} rowSpan={20} colSpan={10}>
                    <Flex justifyContent="center">No results found</Flex>
                  </Td>
                </Tr>
              )}
              {data?.value.map((row) => (
                <Tr
                  key={table.key(row)}
                  bgColor={
                    selectedItems.includes(row)
                      ? highlightedRowBackgroundColor
                      : "inherit"
                  }
                  opacity={isLoading || isRefetching ? "10%" : "inherit"}
                  pointerEvents={isLoading || isRefetching ? "none" : "inherit"}
                >
                  {showRowSelect && (
                    <Td pr={1}>
                      <Checkbox
                        isChecked={selectedItems.includes(row)}
                        onChange={() => handleSelectCheckboxOnClick(row)}
                      />
                    </Td>
                  )}
                  {table.columns.map((column) => (
                    <Td key={column.id.toString()}>{column.cell(row)}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </ChakraTable>
        </TableContainer>
        <Flex
          gap={4}
          alignItems={{ base: "start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
        >
          <Text flex={1}>
            {selectedItems.length} of {data?.count ?? "-"} row(s) selected.
          </Text>

          <Flex gap={8}>
            <Flex gap={4}>
              <Text>Rows per page</Text>
              <Select
                size="sm"
                w={20}
                borderRadius="md"
                onChange={handlePageSizeOnChange}
                defaultValue={initialTablePageSize}
              >
                <option value="15">15</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </Flex>
            <ButtonGroup size="sm" isAttached variant="outline">
              <IconButton
                isDisabled={page === 1}
                icon={<FiChevronsLeft />}
                aria-label="table-first-page"
                onClick={() => handlePageOnClick(1)}
              />
              <IconButton
                isDisabled={page === 1}
                icon={<FiChevronLeft />}
                aria-label="table-previous-page"
                onClick={() => handlePageOnClick(page - 1)}
              />
              {range(first, last + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  isActive={page === pageNumber}
                  onClick={() => handlePageOnClick(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <IconButton
                isDisabled={page === totalPages}
                icon={<FiChevronRight />}
                aria-label="table-next-page"
                onClick={() => handlePageOnClick(page + 1)}
              />
              <IconButton
                isDisabled={page === totalPages}
                icon={<FiChevronsRight />}
                aria-label="table-last-page"
                onClick={() => handlePageOnClick(totalPages)}
              />
            </ButtonGroup>
          </Flex>
        </Flex>
      </Flex>

      {table.deleteEnabled && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Item(s)
              </AlertDialogHeader>

              <AlertDialogBody>
                <Text>Are you sure you want to delete the selected items?</Text>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDeleteConfirmationClick}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </>
  );
}
