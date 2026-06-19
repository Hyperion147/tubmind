import { createRequest } from "./core";
import { createIdeasApi } from "./ideas";
import { createModerationApi } from "./moderation";
import { createTimeLogsApi } from "./time-logs";

export function createTubmindApi(baseUrl = "") {
  const request = createRequest(baseUrl);

  return {
    ideas: createIdeasApi(request),
    moderation: createModerationApi(request),
    timeLogs: createTimeLogsApi(request),
  };
}

export const tubmindApi = createTubmindApi();
