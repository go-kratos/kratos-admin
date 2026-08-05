import { asServiceError } from "@/services";
import { getIntl, history, type RequestConfig } from "@umijs/max";
import { message as toast } from "antd";

const loginPath = "/user/login";

// User-facing wording per error reason. A reason with no entry here falls back
// to the server message.
const reasonMessageId: Record<string, string> = {
  INVALID_CREDENTIALS: "pages.login.invalidCredentials",
  PERMISSION_DENIED: "pages.error.permissionDenied",
};

/**
 * Global request error handling: every failed request is reported here, so a
 * caller only has to handle its own success path. umi re-rejects afterwards, so
 * callers that need more than a toast can still catch and inspect `reason`.
 */
export const errorConfig: RequestConfig = {
  errorConfig: {
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      const serviceError = asServiceError(error);
      if (serviceError) {
        // 401 means the cookie is missing or expired. On the login page itself
        // a 401 is just a failed attempt, so don't redirect there.
        if (
          serviceError.code === 401 &&
          history.location.pathname !== loginPath
        ) {
          history.push(loginPath);
        }
        const messageId =
          serviceError.reason && reasonMessageId[serviceError.reason];
        toast.error(
          messageId
            ? getIntl().formatMessage({ id: messageId })
            : serviceError.message || "Request failed, please retry."
        );
        return;
      }

      // No structured body: a gateway error, a timeout, or an aborted request.
      if (error.response) {
        toast.error(`Response status: ${error.response.status}`);
      } else if (error.request) {
        toast.error("None response! Please retry.");
      } else {
        toast.error("Request error, please retry.");
      }
    },
  },
};
