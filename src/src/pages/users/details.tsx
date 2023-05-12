import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Tooltip,
  Text,
  useDisclosure,
  defineStyleConfig,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FiChevronRight } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { UpdateUserDrawer } from "../../components/users/update-drawer";
import { environment } from "../../environment";
import { User } from "../../types/user";

type Params = {
  id: string;
};

export default function UserDetails() {
  const { id } = useParams<Params>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getUser = async (signal: AbortSignal | undefined) => {
    const response = await axios.get<User>(
      `${environment.USER_SERVICE_BASE_URL}/api/v1/users/${id}`,
      {
        signal,
        withCredentials: true,
      }
    );

    return response?.data;
  };

  const { data } = useQuery(["/api/v1/users", id], ({ signal }) =>
    getUser(signal)
  );

  const buttonTabStyle = defineStyleConfig({
    baseStyle: {
      size: "md",
      fontWeight: "normal",
      variant: "ghost",
      px: 4,
      py: 2,
      mb: "-2px",
      height: "inherit",
      _hover: {
        background: "inherit",
      },
      _active: {
        background: "whiteAlpha.300",
        color: "blue.300",
        borderColor: "blue.600",
        borderBottom: "2px solid",
      },
    },
  });

  return (
    <>
      <Breadcrumb separator={<FiChevronRight size={12} />} fontSize="sm" mb={4}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink href="/users">Users</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{id}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Tabs isLazy>
        <TabList>
          <Tab>Details</Tab>
          <Button
            __css={buttonTabStyle.baseStyle}
            isDisabled={!data}
            onClick={onOpen}
          >
            Edit
          </Button>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex gap={8}>
              <Flex direction="column" gap={2}>
                <Text>Id:</Text>
                <Text>First Name:</Text>
                <Text>Last Name:</Text>
                <Text>Role:</Text>
                <Text>Status:</Text>
              </Flex>

              <Flex direction="column" gap={2}>
                <Text>{data?.id}</Text>
                <Text>{data?.firstName || "-"}</Text>
                <Text>{data?.lastName || "-"}</Text>
                <Text>{data?.role}</Text>
                <Text>{data?.status}</Text>
              </Flex>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {data && (
        <UpdateUserDrawer isOpen={isOpen} onClose={onClose} user={data} />
      )}
    </>
  );
}
