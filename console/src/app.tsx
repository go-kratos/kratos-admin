import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Logo,
  SelectLang,
} from "@/components";
import { type Admin, services } from "@/services";
import type { Settings as LayoutSettings } from "@ant-design/pro-components";
import { SettingDrawer } from "@ant-design/pro-components";
import type { RequestConfig, RunTimeLayoutConfig } from "@umijs/max";
import { getIntl, history, useAntdConfigSetter } from "@umijs/max";
import { Result } from "antd";
import { useLayoutEffect, useRef } from "react";
import defaultSettings from "../config/defaultSettings";
import {
  brandColor,
  buildAntdTheme,
  buildLayoutToken,
  type ColorMode,
} from "../config/theme";
import { errorConfig } from "./requestErrorConfig";

const isDevOrTest = process.env.NODE_ENV === "development" || process.env.CI;
const loginPath = "/user/login";

/**
 * ProLayout 会为 realDark 注入暗色算法，但 config.ts 中固定的亮色 token 优先级更高，
 * 因此还要同步替换最外层 ConfigProvider 的语义色。放在独立组件中，避免在 layout
 * 配置函数里调用 Hook。
 */
const ThemeSync = ({ primary, mode }: { primary: string; mode: ColorMode }) => {
  const setAntdConfig = useAntdConfigSetter();
  const setAntdConfigRef = useRef(setAntdConfig);

  // Umi 每次 Provider render 都会创建新的 setter；用 ref 取最新版，主题 effect 只在
  // 实际颜色变化时执行，避免 setter 自身变化造成重复更新。
  useLayoutEffect(() => {
    setAntdConfigRef.current = setAntdConfig;
  });

  useLayoutEffect(() => {
    setAntdConfigRef.current({ theme: buildAntdTheme(primary, mode) });
    const root = document.documentElement;
    root.style.colorScheme = mode;

    return () => {
      root.style.colorScheme = "";
    };
  }, [primary, mode]);

  return null;
};

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: Admin;
}> {
  const settings = defaultSettings as Partial<LayoutSettings>;
  // 登录页不取用户信息，否则每次打开登录页都会先吃一个 401。
  if (history.location.pathname === loginPath) {
    return { settings };
  }
  try {
    return { currentUser: await services.admin.Current({}), settings };
  } catch {
    // 401 的跳转由 requestErrorConfig 统一处理。
    return { settings };
  }
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  // SettingDrawer 换色后写在这里，未改动时回落到默认品牌色。
  const themeColor = initialState?.settings?.colorPrimary ?? brandColor;
  const colorMode: ColorMode =
    initialState?.settings?.navTheme === "realDark" ? "dark" : "light";
  return {
    actionsRender: () => [<SelectLang key="SelectLang" />],
    avatarProps: {
      // 空字符串要转成 undefined，否则 antd 会当成有效地址去加载，头像位置留白。
      src: initialState?.currentUser?.avatar || undefined,
      // 没有头像时用用户名首字母兜底，比通用的小人图标更容易辨认是谁。能渲染到
      // 这里说明 name 一定存在（见 AvatarDropdown 的 loading 分支）。
      children: initialState?.currentUser?.name?.[0]?.toUpperCase(),
      style: { backgroundColor: themeColor, color: "#FFFFFF" },
      title: <AvatarName />,
      render: (_, avatarChildren) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { pathname, search } = history.location;
      if (!initialState?.currentUser && pathname !== loginPath) {
        // 带上 redirect，登录后能回到原来的位置。
        history.push(
          `${loginPath}?redirect=${encodeURIComponent(pathname + search)}`
        );
      }
    },
    // umi 内建的 403 页面文案写死了中文，换成走 i18n 的版本。
    unAccessible: (
      <Result
        status="403"
        title="403"
        subTitle={getIntl().formatMessage({ id: "pages.403.subTitle" })}
      />
    ),
    childrenRender: (children) => (
      <>
        <ThemeSync primary={themeColor} mode={colorMode} />
        {children}
        {isDevOrTest && (
          <SettingDrawer
            disableUrlParams
            enableDarkTheme
            settings={initialState?.settings}
            onSettingChange={(settings) => {
              setInitialState((preInitialState) => ({
                ...preInitialState,
                settings,
              }));
            }}
          />
        )}
      </>
    ),
    ...initialState?.settings,
    // 以下两项必须排在 settings 展开之后，否则会被 defaultSettings 里的静态值盖掉。
    //
    // SettingDrawer 只写 settings.colorPrimary，而侧栏配色读的是 token.sider.*，
    // 两者不相通 —— 不在这里重新派生，换主题色时侧栏和内容区底色会停在默认色上。
    token: buildLayoutToken(themeColor, colorMode),
    className: `kratos-theme-${colorMode}`,
    // 同理，public/logo.svg 的 fill 写死在文件里，只有换成组件才能跟着主题色走。
    logo: <Logo color={themeColor} />,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  // Same-origin: the console is served alongside the Kratos HTTP server.
  baseURL: "",
  ...errorConfig,
};
