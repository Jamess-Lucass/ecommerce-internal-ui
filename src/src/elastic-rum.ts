import { init as initApm } from "@elastic/apm-rum";
import { environment } from "./environment";

initApm({
  serviceName: environment.ELASTIC_APM_SERVICE_NAME,
  serverUrl: environment.ELASTIC_APM_SERVER_URL,
  serviceVersion: "",
  logLevel: "trace",
  pageLoadTransactionName: "/",
  distributedTracing: true,
  propagateTracestate: true,
  breakdownMetrics: true,
  distributedTracingOrigins:
    environment.ELASTIC_APM_DISTRIBUTED_TRACE_ORIGINS?.split(",").map(
      (origin) => new RegExp(origin)
    ),
});
