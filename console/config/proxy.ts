/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置。生产环境下
 * console 与 Kratos HTTP 服务同源部署，无需代理。
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  dev: {
    "/v1/": {
      // 后端换端口时用 API_TARGET 覆盖，不必改代码。
      target: process.env.API_TARGET ?? "http://localhost:8000",
      changeOrigin: true,
    },
  },
};
