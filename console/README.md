# Kratos Admin Console

基于 [Umi Max](https://umijs.org) + [Ant Design](https://ant.design) 的后台管理控制台，
配套仓库根目录的 Kratos 服务。

## 命令

```shell
npm install
npm run dev     # 开发服务器，:3000，/v1/ 代理到 :8000
npm run build   # 产物输出到 dist/
npm run lint    # biome + tsc
npx jest --forceExit   # 测试（直接 npm test 会因 jest 不退出而挂住终端）
```

后端不在 8000 端口时用环境变量覆盖，不必改代码：

```shell
API_TARGET=http://localhost:9000 npm run dev
```

## 目录

```
config/           构建配置。theme.ts 是唯一的配色来源
src/services/     由 `make api` 从 proto 生成，不要手改
src/pages/        页面，按路由组织
src/components/   跨页面复用的组件
src/locales/      i18n，只保留 zh-CN 与 en-US
```

## 新增一个资源页面

以 `admins` 为参考实现，照它抄。假设新资源叫 `roles`：

1. **后端契约先行**：在 `api/<domain>/<version>/` 定义 proto，然后在仓库根目录跑
   `make api`。TS 客户端会生成到 `src/services/`。
2. `src/services/index.ts` 加一行 client。
3. `src/pages/roles/index.tsx` — 列表页，抄 `pages/admins/index.tsx`。
4. `src/pages/roles/components/` — 新建与编辑弹窗表单。
5. `config/routes.ts` 加一条路由。`name` 决定菜单文案的 key：`name: "roles"` 会去读
   `menu.roles`。需要权限门就加 `access: "canAdmin"`，取值必须是 `src/access.ts`
   返回对象里的字段名。
6. `src/locales/{zh-CN,en-US}/menu.ts` 加 `menu.roles`，否则菜单会直接显示这个 key。
7. `src/locales/{zh-CN,en-US}/pages.ts` 加列标题、按钮、提示文案。

## 几个约定

- **文案一律走 i18n。** 默认语言是 zh-CN，硬编码英文会让中文界面里冒出英文提示。
  toast、Popconfirm 的按钮文字也算。
- **列表页的搜索项要和后端的可过滤字段对齐。** ProTable 会为带 `valueEnum` 的列自动
  生成搜索项，后端没声明的字段必须显式 `search: false`，否则提交时会被拒。
- **配色改 `config/theme.ts`。** `antdTheme` 管所有 antd 组件，`buildLayoutToken()`
  管 ProLayout 外壳（侧栏、顶栏）；两者作用域不同，都要改。
- **`public/scripts/loading.js` 里的 logo 和底色是重复的一份**，为了在 React 挂载前
  消除白屏。改品牌资产时记得同步。
