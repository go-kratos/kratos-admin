import type { ProLayoutProps } from '@ant-design/pro-components';
import type { ThemeConfig } from 'antd';

export type ColorMode = 'light' | 'dark';

/**
 * 设计立场：中性背景 + 清晰的容器层级，品牌色只出现在需要用户注意的地方
 * （主按钮、链接、侧栏选中态）。亮色与暗色使用同一套语义层级。
 *
 * 这个文件被 config.ts（build 时序列化）和 defaultSettings.ts（运行时进 bundle）
 * 同时引用，所以只能存放纯数据和纯函数：不要在这里调用 theme.useToken()。
 */

/** 品牌葡萄紫，SettingDrawer 未改动时的默认主题色。 */
export const brandColor = '#7624F4';

const palettes = {
  light: {
    bgLayout: '#FDFDFD',
    bgContainer: '#FFFFFF',
    bgElevated: '#FFFFFF',
    border: '#EAEAEA',
    textHeading: '#03080A',
    text: '#1B2022',
    textSecondary: '#505456',
    // 对白底 4.85:1，满足 WCAG AA 正文要求。
    textTertiary: '#6F7273',
    rowHover: '#F8F8F8',
    hover: '#F4F4F4',
    selectedAlpha: 0.08,
    shadow: 'rgba(16,24,40,0.04)',
    elevatedShadow: 'rgba(16,24,40,0.08)',
  },
  dark: {
    // 三层背景保持中性，不让品牌紫污染大面积底色。
    bgLayout: '#0F0F10',
    bgContainer: '#18181A',
    bgElevated: '#202024',
    border: '#303034',
    textHeading: '#F5F5F6',
    text: '#E6E6E8',
    textSecondary: '#B5B5B9',
    textTertiary: '#8C8C92',
    rowHover: '#202024',
    hover: '#26262A',
    selectedAlpha: 0.2,
    shadow: 'rgba(0,0,0,0.2)',
    elevatedShadow: 'rgba(0,0,0,0.4)',
  },
} as const;

/**
 * 系统字体栈。不引入任何 webfont：装了 Inter 就用，否则回落到各平台的原生 UI
 * 字体。默认语言是 zh-CN，所以中文字族必须显式列出，否则会掉到宋体。
 */
export const fontFamily =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

/**
 * 把主题色按 alpha 混入当前容器底色，用于侧栏选中态。暗色不能继续以白色为混合
 * 基底，否则选中项会变成突兀的浅紫色块。
 *
 * 非 6 位 hex 一律退回容器底色（等于没有选中底色），比算出一个错色更容易发现。
 */
const mixColor = (foreground: string, background: string, alpha: number) => {
  const foregroundHex = foreground.replace('#', '');
  const backgroundHex = background.replace('#', '');
  if (
    !/^[0-9a-f]{6}$/i.test(foregroundHex) ||
    !/^[0-9a-f]{6}$/i.test(backgroundHex)
  ) {
    return background;
  }

  const foregroundValue = Number.parseInt(foregroundHex, 16);
  const backgroundValue = Number.parseInt(backgroundHex, 16);
  const foregroundChannels = [
    foregroundValue >> 16,
    (foregroundValue >> 8) & 0xff,
    foregroundValue & 0xff,
  ];
  const backgroundChannels = [
    backgroundValue >> 16,
    (backgroundValue >> 8) & 0xff,
    backgroundValue & 0xff,
  ];

  return `#${foregroundChannels
    .map((_, index) =>
      Math.round(
        backgroundChannels[index] +
          (foregroundChannels[index] - backgroundChannels[index]) * alpha,
      )
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

/**
 * 作用于全部 antd 组件，包含 ProLayout 之外的登录页、Modal、Message。
 *
 * config.ts 在构建时使用默认亮色；SettingDrawer 改变颜色或模式后，src/app.tsx 会用
 * 同一个 builder 同步更新运行时 ConfigProvider。
 */
export const buildAntdTheme = (
  primary: string = brandColor,
  mode: ColorMode = 'light',
): ThemeConfig => {
  const colors = palettes[mode];
  const selectedBg = mixColor(
    primary,
    colors.bgContainer,
    colors.selectedAlpha,
  );
  // 品牌色原色在深底上的对比度通常不足；向白色混合后仍保留主题色倾向。
  const selectedText =
    mode === 'dark' ? mixColor('#FFFFFF', primary, 0.5) : primary;
  return {
    token: {
      colorPrimary: primary,
      colorInfo: primary,
      colorBgLayout: colors.bgLayout,
      colorBgContainer: colors.bgContainer,
      colorBgElevated: colors.bgElevated,
      colorBorder: colors.border,
      colorBorderSecondary: colors.border,
      colorTextHeading: colors.textHeading,
      colorText: colors.text,
      colorTextSecondary: colors.textSecondary,
      colorTextTertiary: colors.textTertiary,
      borderRadius: 8,
      borderRadiusLG: 8,
      borderRadiusSM: 6,
      controlHeight: 36,
      fontSize: 14,
      fontFamily,
      boxShadow: `0 1px 2px 0 ${colors.shadow}`,
      boxShadowTertiary: `0 1px 2px 0 ${colors.shadow}`,
      boxShadowSecondary: `0 4px 12px -2px ${colors.elevatedShadow}, 0 0 0 1px ${colors.shadow}`,
    },
    components: {
      Menu: {
        // realDark 会切换到 Menu 自己的 dark preset；显式覆盖这些 token，避免它把
        // 侧栏选中项重新刷成高饱和主题色。
        darkItemColor: colors.textSecondary,
        darkItemHoverColor: colors.textHeading,
        darkItemHoverBg: colors.hover,
        darkItemSelectedColor: selectedText,
        darkItemSelectedBg: selectedBg,
        darkSubMenuItemBg: colors.bgContainer,
      },
      Table: {
        // 表头和 footer 与容器同色，分区交给 1px 分割线。
        headerBg: colors.bgContainer,
        footerBg: colors.bgContainer,
        headerColor: colors.textHeading,
        headerBorderRadius: 0,
        headerSplitColor: 'transparent',
        borderColor: colors.border,
        rowHoverBg: colors.rowHover,
        cellPaddingBlock: 12,
      },
    },
  };
};

/** 构建时先输出亮色；运行时由 ThemeSync 根据 SettingDrawer 的状态替换。 */
export const antdTheme: ThemeConfig = buildAntdTheme();

/**
 * ProLayout 外壳（侧栏、顶栏、PageContainer）的配色。
 *
 * 做成函数而非常量，是因为 SettingDrawer 只写 settings.colorPrimary，而侧栏读的是
 * token.sider.*。两条路径不相通，静态常量会让侧栏永远停在默认色上。
 */
export const buildLayoutToken = (
  primary: string = brandColor,
  mode: ColorMode = 'light',
): ProLayoutProps['token'] => {
  const colors = palettes[mode];
  const selectedBg = mixColor(
    primary,
    colors.bgContainer,
    colors.selectedAlpha,
  );
  const selectedText =
    mode === 'dark' ? mixColor('#FFFFFF', primary, 0.5) : primary;
  return {
    bgLayout: colors.bgLayout,
    sider: {
      colorMenuBackground: colors.bgContainer,
      colorMenuItemDivider: colors.border,
      colorTextMenu: colors.textSecondary,
      colorTextMenuSecondary: colors.textTertiary,
      colorTextMenuTitle: colors.textHeading,
      colorTextMenuSelected: selectedText,
      colorTextMenuActive: selectedText,
      colorTextSubMenuSelected: selectedText,
      colorTextMenuItemHover: colors.textHeading,
      colorBgMenuItemHover: colors.hover,
      colorBgMenuItemSelected: selectedBg,
      colorBgMenuItemActive: selectedBg,
      colorBgCollapsedButton: colors.bgContainer,
      colorTextCollapsedButton: colors.textTertiary,
      colorTextCollapsedButtonHover: colors.textHeading,
      paddingInlineLayoutMenu: 8,
      paddingBlockLayoutMenu: 8,
    },
    header: {
      colorBgHeader: colors.bgContainer,
      colorBgScrollHeader: colors.bgContainer,
      colorHeaderTitle: colors.textHeading,
      colorTextMenu: colors.textSecondary,
      colorTextMenuSelected: colors.textHeading,
      colorTextRightActionsItem: colors.textTertiary,
      colorBgRightActionsItemHover: colors.hover,
      heightLayoutHeader: 48,
    },
    pageContainer: {
      // 内容区自己不着色，露出 bgLayout。
      colorBgPageContainer: 'transparent',
      paddingInlinePageContainerContent: 24,
      paddingBlockPageContainerContent: 16,
    },
  };
};
