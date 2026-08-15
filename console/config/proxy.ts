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
      target: "http://localhost:8000",
      changeOrigin: true,
    },
  },
};
