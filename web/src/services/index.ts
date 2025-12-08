import { createAdminServiceClient } from "@/services/kratos/admin/v1/index";
import { request } from "@umijs/max";

type Request = {
  path: string;
  method: string;
  body: string | null;
};

function requestHandler({ path, method, body }: Request) {
  const headers: Record<string, string> = {};
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    headers["Content-Type"] = "application/json";
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
