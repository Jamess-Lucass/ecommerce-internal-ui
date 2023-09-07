import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Flex,
  Tbody,
  Td,
  Skeleton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { environment } from "../../environment";
import { Catalog } from "../../types/catalog";
import { FiChevronRight, FiPlus } from "react-icons/fi";
import { CreateCatalogItemDrawer } from "../../components/catalog/create-drawer";
import { APIResponse } from "../../types/api-response";
import { withTransaction } from "@elastic/apm-rum-react";

function CatalogPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getUsers = async (signal: AbortSignal | undefined) => {
    const response = await axios.get<APIResponse<Catalog>>(
      `${environment.CATALOG_SERVICE_BASE_URL}/api/v1/catalog`,
      {
        signal,
        withCredentials: true,
      }
    );

    return response?.data;
  };

  const { data, isLoading } = useQuery(["/api/v1/catalog"], ({ signal }) =>
    getUsers(signal)
  );

  return (
    <>
      <Breadcrumb separator={<FiChevronRight size={12} />} fontSize="sm" mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Catalog</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <TableContainer flex={1}>
        <Button size="sm" mb={4} rightIcon={<FiPlus />} onClick={onOpen}>
          Create
        </Button>
        <Table variant="simple" colorScheme="gray" size="sm" overflowX="auto">
          <Thead h={8}>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Price</Th>
            </Tr>
          </Thead>
          <Tbody position="relative">
            {!data &&
              Array(18).map((x) => (
                <Tr key={x}>
                  <Td height="10px" colSpan={10}>
                    <Skeleton height="full" speed={1.2} startColor="gray.700" />
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
                key={row.id}
                opacity={isLoading ? "10%" : "inherit"}
                pointerEvents={isLoading ? "none" : "inherit"}
              >
                <Td>{row.id}</Td>
                <Td>{row.name}</Td>
                <Td>{row.description}</Td>
                <Td>£{row.price}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <CreateCatalogItemDrawer isOpen={isOpen} onClose={onClose} />
    </>
  );
}

export default withTransaction("Catalog", "component")(CatalogPage);
