import { Box, useDisclosure } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { Navbar } from "./navbar";

export default function Index({ children }: PropsWithChildren) {
  const { onOpen: onMobileOpen } = useDisclosure();

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      <Navbar onMobileSidebarToggle={onMobileOpen} />
      <Box padding={4}>{children}</Box>
    </Box>
  );
}
