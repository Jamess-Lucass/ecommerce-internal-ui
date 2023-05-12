import {
  Flex,
  Link,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Image,
  Text,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { User } from "../../types/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { TableProvider } from "../../contexts/table-context";
import { environment } from "../../environment";
import { useCreateTable } from "../../hooks/use-create-table";
import { Table } from "../../components/table/table";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

export default function Users() {
  const form = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const table = useCreateTable<User>({
    url: `${environment.USER_SERVICE_BASE_URL}/api/v1/users`,
    key: (row) => row.id,
    columns: [
      {
        id: "id",
        name: "Id",
        cell: (row) => (
          <Link as="a" href={`/products/${row.id}`} color="blue.400">
            {row.id}
          </Link>
        ),
      },
      {
        id: "email",
        name: "Email",
        cell: (row) => (
          <Flex alignItems="center" gap={2}>
            <Image
              src={row.avatarUrl}
              height={6}
              borderRadius="full"
              referrerPolicy="no-referrer"
            />
            <Text>{row.email}</Text>
          </Flex>
        ),
      },
      { id: "role", name: "Role", cell: (row) => row.role },
      {
        id: "createdAt",
        name: "Created At",
        cell: (row) => new Date(row.createdAt).toUTCString(),
      },
      {
        id: "updatedAt",
        name: "Updated At",
        cell: (row) =>
          row.updatedAt ? new Date(row.updatedAt).toUTCString() : "-",
      },
    ],
    deleteEnabled: true,
    filters: {
      schema: schema,
      form: (
        <>
          <Flex gap={4} flexDir={{ base: "column", md: "row" }}>
            <FormControl
              isInvalid={!!form.formState.errors.email}
              isRequired={false}
            >
              <FormLabel fontSize="xs">Email</FormLabel>
              <Input
                type="text"
                placeholder="John.doe@email.com"
                size="sm"
                {...form.register("email")}
              />
              <FormErrorMessage>
                {form.formState.errors.email?.message}
              </FormErrorMessage>
            </FormControl>
          </Flex>

          <Flex gap={4} flexDir={{ base: "column", md: "row" }}>
            <FormControl
              isInvalid={!!form.formState.errors.firstName}
              isRequired={false}
            >
              <FormLabel fontSize="xs">First Name</FormLabel>
              <Input
                type="text"
                placeholder="John"
                size="sm"
                {...form.register("firstName")}
              />
              <FormErrorMessage>
                {form.formState.errors.firstName?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl
              isInvalid={!!form.formState.errors.lastName}
              isRequired={false}
            >
              <FormLabel fontSize="xs">Last Name</FormLabel>
              <Input
                type="text"
                placeholder="Doe"
                size="sm"
                {...form.register("lastName")}
              />
              <FormErrorMessage>
                {form.formState.errors.lastName?.message}
              </FormErrorMessage>
            </FormControl>
          </Flex>
        </>
      ),
    },
  });

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

      <TableProvider initialValue={table}>
        <FormProvider {...form}>
          <Table />
        </FormProvider>
      </TableProvider>
    </>
  );
}
