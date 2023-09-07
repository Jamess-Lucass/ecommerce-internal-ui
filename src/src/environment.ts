import { z } from "zod";

const schema = z.object({
  ELASTIC_APM_SERVER_URL: z.string().url().optional(),
  ELASTIC_APM_SERVICE_NAME: z.string().optional(),
  ELASTIC_APM_DISTRIBUTED_TRACE_ORIGINS: z.string().optional(),
  USER_SERVICE_BASE_URL: z.string().url().optional(),
  CATALOG_SERVICE_BASE_URL: z.string().url().optional(),
  IDENTITY_SERVICE_BASE_URL: z.string().url(),
  LOGIN_UI_BASE_URL: z.string().url(),
});

const data = {
  ELASTIC_APM_SERVER_URL: import.meta.env.VITE_ELASTIC_APM_SERVER_URL,
  ELASTIC_APM_SERVICE_NAME: import.meta.env.VITE_ELASTIC_APM_SERVICE_NAME,
  ELASTIC_APM_DISTRIBUTED_TRACE_ORIGINS: import.meta.env
    .VITE_ELASTIC_APM_DISTRIBUTED_TRACE_ORIGINS,
  USER_SERVICE_BASE_URL: import.meta.env.VITE_USER_SERVICE_BASE_URL,
  CATALOG_SERVICE_BASE_URL: import.meta.env.VITE_CATALOG_SERVICE_BASE_URL,
  IDENTITY_SERVICE_BASE_URL: import.meta.env.VITE_IDENTITY_SERVICE_BASE_URL,
  LOGIN_UI_BASE_URL: import.meta.env.VITE_LOGIN_UI_BASE_URL,
};

export const environment = schema.parse(data);
