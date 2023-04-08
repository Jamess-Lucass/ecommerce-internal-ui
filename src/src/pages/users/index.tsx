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
  Text,
  Link,
  Image,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Box } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";
import { env } from "../../environment";
import { APIResponse } from "../../types/api-response";
import { User } from "../../types/user";

export default function Users() {
  const getUsers = async (signal: AbortSignal | undefined) => {
    const response = await axios.get<APIResponse<User>>(
      `${env.USER_SERVICE_BASE_URL}/api/v1/users`,
      {
        signal,
        withCredentials: true,
      }
    );

    return response?.data;
  };

  const { data, isLoading } = useQuery(["/api/v1/users"], ({ signal }) =>
    getUsers(signal)
  );

  return (
    <>
      <Breadcrumb separator={<FiChevronRight size={12} />} fontSize="sm" mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Users</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <TableContainer flex={1}>
        <Table variant="simple" colorScheme="gray" size="sm" overflowX="auto">
          <Thead h={8}>
            <Tr>
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <Tbody position="relative">
            {!data?.value &&
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
                <Td>
                  <Link
                    href={`/users/${row.id}`}
                    color="blue.400"
                    display={{ base: "none", sm: "block" }}
                  >
                    {row.id}
                  </Link>
                </Td>
                <Td>{row.email}</Td>
                <Td>{row.role}</Td>
                <Td display="flex" gap={2} alignItems="center">
                  <Image src={row.avatarUrl} h={6} />
                  <Text>
                    {row.firstName} {row.lastName}
                  </Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
