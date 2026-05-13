import type { ApiRequestConfig } from "@repo/core";

type RequestParams = NonNullable<ApiRequestConfig["params"]>;
type RequestParamValue = RequestParams[string];

function isRequestParamValue(value: unknown): value is RequestParamValue {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === undefined
  );
}

export function toRequestParams(
  params?: Record<string, unknown> | null,
): RequestParams | undefined {
  if (!params) {
    return undefined;
  }

  const requestParams: RequestParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || !isRequestParamValue(value)) {
      return;
    }

    requestParams[key] = value;
  });

  return Object.keys(requestParams).length > 0 ? requestParams : undefined;
}
