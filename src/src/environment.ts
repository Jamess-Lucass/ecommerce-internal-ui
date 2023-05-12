import { z } from "zod";

const schema = z.object({
  USER_SERVICE_BASE_URL: z.string().url().optional(),
  CATALOG_SERVICE_BASE_URL: z.string().url().optional(),
  IDENTITY_SERVICE_BASE_URL: z.string().url(),
  LOGIN_UI_BASE_URL: z.string().url(),
});

const data = {
  USER_SERVICE_BASE_URL: import.meta.env.VITE_USER_SERVICE_BASE_URL,
  CATALOG_SERVICE_BASE_URL: import.meta.env.VITE_CATALOG_SERVICE_BASE_URL,
  IDENTITY_SERVICE_BASE_URL: import.meta.env.VITE_IDENTITY_SERVICE_BASE_URL,
  LOGIN_UI_BASE_URL: import.meta.env.VITE_LOGIN_UI_BASE_URL,
};

export const environment = schema.parse(data);
