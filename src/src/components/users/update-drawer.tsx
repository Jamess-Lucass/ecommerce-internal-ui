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
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { env } from "../../environment";
import { roles, statuses, User } from "../../types/user";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select } from "chakra-react-select";
import { ValidationErrorResponse } from "../../types/validation-error-response";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
};

export const schema = z.object({
  email: z.string().email().max(320),
  firstName: z.string().min(2).max(128),
  lastName: z.string().min(2).max(128),
  status: z
    .enum(statuses)
    .refine((val) => val !== "None" && statuses.includes(val)),
  role: z.enum(roles).refine((val) => val !== "None" && roles.includes(val)),
});

export type Inputs = z.infer<typeof schema>;

export function UpdateUserDrawer({ isOpen, onClose, user }: Props) {
  const firstField = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const {
    handleSubmit,
    register,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      role: user.role,
    },
  });

  const updateUserMutation = useMutation(
    (body: Inputs) =>
      axios.put(`${env.USER_SERVICE_BASE_URL}/api/v1/users/${user.id}`, body, {
        withCredentials: true,
        headers: { Prefer: "return=representation" },
      }),
    {
      onSuccess: ({ data }: AxiosResponse<User>) => {
        queryClient.setQueryData<User>(["/api/v1/users", user.id], () => ({
          ...data,
        }));

        toast({
          position: "bottom-left",
          title: "Success",
          status: "success",
          description: "Successfully updated User!",
        });

        onClose();
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
    updateUserMutation.mutate(data);
  };

  const roleOptions = roles
    .filter((x) => x !== "None")
    .map((x) => ({ value: x, label: x }));

  const statusOptions = statuses
    .filter((x) => x !== "None")
    .map((x) => ({ value: x, label: x }));

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
          Update user &apos;{user.firstName} {user.lastName}&apos;
        </DrawerHeader>

        <DrawerBody>
          <form id="update-user" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing="24px">
              <FormControl isInvalid={!!errors.email} isRequired>
                <FormLabel fontSize="xs">Name</FormLabel>
                <Input
                  type="text"
                  placeholder="john.doe@example.com"
                  {...register("email")}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.firstName} isRequired>
                <FormLabel fontSize="xs">First Name</FormLabel>
                <Input
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                />
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.lastName} isRequired>
                <FormLabel fontSize="xs">Last Name</FormLabel>
                <Input
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.status} isRequired>
                <FormLabel fontSize="xs">Status</FormLabel>
                <Controller
                  control={control}
                  name="status"
                  defaultValue={
                    statusOptions.find((x) => x.value === user.status)?.value
                  }
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={statusOptions}
                      chakraStyles={{
                        option: (base) => ({ ...base, flexWrap: "wrap" }),
                      }}
                      onChange={(option) => onChange(option?.value)}
                      value={statusOptions?.find(
                        (option) => value === option.value
                      )}
                    />
                  )}
                />
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.role} isRequired>
                <FormLabel fontSize="xs">Role</FormLabel>
                <Controller
                  control={control}
                  name="role"
                  defaultValue={
                    roleOptions.find((x) => x.value === user.role)?.value
                  }
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={roleOptions}
                      chakraStyles={{
                        option: (base) => ({ ...base, flexWrap: "wrap" }),
                      }}
                      onChange={(option) => onChange(option?.value)}
                      value={roleOptions?.find(
                        (option) => value === option.value
                      )}
                    />
                  )}
                />
                <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
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
