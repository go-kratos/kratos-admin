import type { RequestOptions } from "@@/plugin-request/request";
import type { RequestConfig } from "@umijs/max";
import { message as toast } from "antd";

// Define the structure of the expected response.
interface ResponseStructure {
  code: number;
  reason?: string;
  message?: string;
  metadata?: Map<string, number>;
}

// Request configuration with error handling and interceptors.
export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (res) => {
      const { code, reason, message } = res as unknown as ResponseStructure;
      if (code != 200) {
        const error: any = new Error(message);
        error.info = { reason, message };
        throw error;
      }
    },
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      if (error.response?.data) {
        const errorInfo: ResponseStructure | undefined = error.response?.data;
        if (errorInfo) {
          const { message, reason } = errorInfo;
          toast.error(reason + ": " + message);
        }
      } else if (error.response) {
        toast.error(`Response status: ${error.response.status}`);
      } else if (error.request) {
        toast.error("None response! Please retry.");
      } else {
        toast.error("Request error, please retry.");
      }
    },
  },
  requestInterceptors: [
    (config: RequestOptions) => {
      return config;
    },
  ],
  responseInterceptors: [
    (response) => {
      if (response.status != 200) {
        toast.error(`Request error: ${response.status}`);
      }
      return response;
    },
  ],
};
