import { Suspense, useState } from "react";
import { Center, ChakraProvider, Spinner, useToast } from "@chakra-ui/react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AxiosError } from "axios";
import { ErrorResponse } from "./types/error-response";
import Home from "./pages/home";
import Layout from "./components/layout";
import Users from "./pages/users";
import { AuthProvider } from "./contexts/auth-context";
import CatalogPage from "./pages/catalog";
import UserDetails from "./pages/users/details";

function App() {
  const toast = useToast();

  const [queryClient] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
      queryCache: new QueryCache({
        onError: (error) => {
          const err = error as AxiosError<ErrorResponse>;

          toast({
            position: "bottom-left",
            title: "Error",
            status: "error",
            description: err.response?.data?.message ?? "An error has occured",
          });
        },
      }),
      mutationCache: new MutationCache({
        onError: (error) => {
          const err = error as AxiosError<ErrorResponse>;

          toast({
            position: "bottom-left",
            title: "Error",
            status: "error",
            description: err.response?.data?.message ?? "An error has occured",
          });
        },
      }),
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <AuthProvider>
          <Layout>
            <BrowserRouter>
              <Suspense
                fallback={
                  <Center w="full" h="calc(100vh - 200px)">
                    <Spinner />
                  </Center>
                }
              >
                <Routes>
                  <Route path="users">
                    <Route index element={<Users />} />
                    <Route path=":id" element={<UserDetails />} />
                  </Route>
                  <Route path="catalog" element={<CatalogPage />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </Layout>
        </AuthProvider>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
