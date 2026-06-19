import {
  timeLogSchema,
  type CreateTimeLogInput,
} from "@tubmind/contracts";

import { jsonInit, type RequestFunction } from "./core";

export function createTimeLogsApi(request: RequestFunction) {
  return {
    list: () =>
      request(
        "/api/time-logs",
        undefined,
        timeLogSchema.array(),
        "Failed to load time logs",
      ),
    create: (input: CreateTimeLogInput) =>
      request(
        "/api/time-logs",
        jsonInit("POST", input),
        timeLogSchema,
        "Failed to save time log",
      ),
  };
}
