import { Center, Spinner } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { environment } from "../environment";
import { User } from "../types/user";

type AuthContextType = {
  user: User;
  signout: () => void;
};

const AuthContext = createContext({} as AuthContextType);

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const getUser = async (signal?: AbortSignal) => {
    const response = await axios.get<User>(
      `${environment.IDENTITY_SERVICE_BASE_URL}/api/v1/oauth/me`,
      {
        signal,
        withCredentials: true,
      }
    );

    return response?.data;
  };

  const { isLoading, data: user } = useQuery<User>(
    ["me"],
    ({ signal }) => getUser(signal),
    {
      onError() {
        window.location.href = `${environment.LOGIN_UI_BASE_URL}?redirect_uri=${window.location.href}`;
      },
    }
  );

  const signoutMutation = useMutation(
    () =>
      axios.post(
        `${environment.IDENTITY_SERVICE_BASE_URL}/api/v1/oauth/signout`,
        {},
        {
          withCredentials: true,
        }
      ),
    {
      onSuccess: () => {
        window.location.href = `${environment.LOGIN_UI_BASE_URL}?redirect_uri=${window.location.href}`;
      },
    }
  );

  const handleSignout = useCallback(() => {
    signoutMutation.mutate();
  }, [signoutMutation]);

  const value = useMemo(
    () => ({
      signout: handleSignout,
      user: user ?? ({} as User),
    }),
    [user, handleSignout]
  );

  if (isLoading) {
    return (
      <Center w="full" h="100vh">
        <Spinner />
      </Center>
    );
  }

  if (user?.role !== "Administrator" && user?.role !== "Employee") {
    window.location.href = environment.LOGIN_UI_BASE_URL;

    return (
      <Center w="full" h="100vh">
        <Spinner />
      </Center>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => useContext(AuthContext);
