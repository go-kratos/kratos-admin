import { createAdminServiceClient } from "@/services/kratos/admin/v1/index";
import { request } from "@umijs/max";

type Request = {
  path: string;
  method: string;
  body: string | null;
};

function requestHandler({ path, method, body }: Request) {
  // Use protojson so proto semantics (oneof, well-known types like Timestamp)
  // are preserved in both directions. kratos selects the codec from the
  // Content-Type / Accept subtype, so both headers must name protojson.
  const headers: Record<string, string> = {
    Accept: "application/protojson",
  };
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    headers["Content-Type"] = "application/protojson";
  }
  return request("/" + path, {
    method: method,
    data: body,
    headers: headers,
  });
}

export function createAdminService() {
  return createAdminServiceClient(requestHandler);
}
