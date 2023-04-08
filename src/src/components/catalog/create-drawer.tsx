import {
  useToast,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  DrawerFooter,
  Button,
} from "@chakra-ui/react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse, AxiosError } from "axios";
import { useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { env } from "../../environment";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Catalog } from "../../types/catalog";
import { ValidationErrorResponse } from "../../types/validation-error-response";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const schema = z.object({
  name: z.string().max(128),
  description: z.string().min(2).max(1024),
  price: z.number(),
});

export type Inputs = z.infer<typeof schema>;

export function CreateCatalogItemDrawer({ isOpen, onClose }: Props) {
  const firstField = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    handleSubmit,
    register,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const createCatalogItemMutation = useMutation(
    (body: Inputs) =>
      axios.post(`${env.CATALOG_SERVICE_BASE_URL}/api/v1/catalog`, body, {
        withCredentials: true,
      }),
    {
      onSuccess: ({ data }: AxiosResponse<Catalog>) => {
        queryClient.setQueryData<Catalog[]>(["/api/v1/catalog"], (prev) => [
          ...(prev ?? []),
          data,
        ]);

        toast({
          position: "bottom-left",
          title: "Success",
          status: "success",
          description: "Successfully created catalog item",
        });

        onClose();
        reset();
      },
      onError: ({ response }: AxiosError<ValidationErrorResponse<Inputs>>) => {
        const errors = response?.data.errors;
        if (!errors) return;

        const errorsArray = Object.entries(errors) as [
          keyof Inputs,
          string[]
        ][];

        for (const [key, value] of errorsArray) {
          for (const message of value) {
            setError(key, {
              type: "custom",
              message: message,
            });
          }
        }
      },
    }
  );

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    createCatalogItemMutation.mutate(data);
  };

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      initialFocusRef={firstField}
      onClose={onClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          Create a new catalog item
        </DrawerHeader>

        <DrawerBody>
          <form id="update-user" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing="24px">
              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel fontSize="xs">Name</FormLabel>
                <Input
                  type="text"
                  placeholder="T-Shirt"
                  {...register("name")}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.description} isRequired>
                <FormLabel fontSize="xs">Description</FormLabel>
                <Input
                  type="text"
                  placeholder="A very cool new T-Shirt"
                  {...register("description")}
                />
                <FormErrorMessage>
                  {errors.description?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.price} isRequired>
                <FormLabel fontSize="xs">Price</FormLabel>
                <Input
                  type="text"
                  placeholder="10.99"
                  {...register("price", { valueAsNumber: true })}
                />
                <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
              </FormControl>
            </Stack>
          </form>
        </DrawerBody>

        <DrawerFooter borderTopWidth="1px">
          <Button
            variant="outline"
            mr={3}
            onClick={onClose}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            form="update-user"
            isLoading={isSubmitting}
          >
            Update
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
