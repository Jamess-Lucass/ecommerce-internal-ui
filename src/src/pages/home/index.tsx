import { Text } from "@chakra-ui/react";
import { useAuth } from "../../contexts/auth-context";

export default function Home() {
  const { user } = useAuth();

  return (
    <Text fontSize="2xl">
      Welcome {user.firstName} {user.lastName} to the internal employee portal.
    </Text>
  );
}
