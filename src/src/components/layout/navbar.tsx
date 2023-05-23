import {
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  HStack,
  Menu,
  MenuButton,
  Avatar,
  VStack,
  Box,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  Link,
  Icon,
  Image,
} from "@chakra-ui/react";
import { FiChevronDown, FiLogOut, FiMenu, FiMoon } from "react-icons/fi";
import { useAuth } from "../../contexts/auth-context";

type NavbarProps = {
  onMobileSidebarToggle: () => void;
};

export function Navbar({ onMobileSidebarToggle }: NavbarProps) {
  const { user, signout } = useAuth();
  const { toggleColorMode } = useColorMode();

  return (
    <Flex
      pr={4}
      pl={2}
      minHeight={16}
      alignItems="center"
      borderBottomWidth="1px"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent="space-between"
    >
      <Flex alignItems="center" gap={1}>
        <IconButton
          onClick={onMobileSidebarToggle}
          display={{ base: "inline-flex", sm: "none" }}
          variant="ghost"
          aria-label="open menu"
          isRound
          icon={<FiMenu />}
        />

        <Link href="/" display={{ base: "none", sm: "block" }} mx={2}>
          <Image src="/logo.png" h={8} alt="Logo" />
        </Link>

        <Flex gap={6} ml={4}>
          <Link href="/users" display={{ base: "none", sm: "block" }}>
            Users
          </Link>

          <Link href="/catalog" display={{ base: "none", sm: "block" }}>
            Catalog
          </Link>
        </Flex>
      </Flex>

      <HStack spacing={{ base: "2", md: "6" }}>
        <Flex alignItems="center">
          <Menu isLazy>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    mx={1}
                    referrerPolicy="no-referrer"
                    w={6}
                    h={6}
                  />
                ) : (
                  <Avatar
                    size="sm"
                    name={`${user.firstName} ${user.lastName}`}
                  />
                )}

                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                >
                  <Text fontSize="sm" textTransform="capitalize">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="gray.600"
                    textTransform="capitalize"
                  ></Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList fontSize="sm">
              <MenuItem onClick={toggleColorMode}>
                <Icon as={FiMoon} mx={2} />
                Toggle theme
              </MenuItem>

              <MenuDivider />

              <MenuItem onClick={signout}>
                <Icon as={FiLogOut} mx={2} />
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
}
