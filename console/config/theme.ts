import type { ProLayoutProps } from '@ant-design/pro-components';
import type { ThemeConfig } from 'antd';

/**
 * 设计立场：中性灰底 + 纯白容器，层次由 1px 边框建立而非阴影，靛蓝只出现在
 * 需要用户注意的地方（主按钮、选中态、链接）。
 *
 * 这个文件被 config.ts（build 时序列化）和 defaultSettings.ts（运行时进 bundle）
 * 同时引用，所以只能存放纯数据：不要在这里调用 theme.useToken() 或引入 antd 运行时值。
 */

/** 品牌靛蓝。antd 的 colorPrimary 与侧栏选中态必须取同一个值，故在此集中定义。 */
export const brandColor = '#4F46E5';

/** 品牌色的极浅填充，用作侧栏选中项底色。 */
const brandColorBg = '#EEF2FF';

const colorBgLayout = '#F7F8FA';
const colorBgContainer = '#FFFFFF';
/** 卡片与表格的分隔线，页面层次几乎全靠它。 */
const colorBorderSecondary = '#E9EBEF';
const colorTextHeading = '#111827';
const colorTextBody = '#1F2937';
const colorTextSecondary = '#4B5563';
const colorTextTertiary = '#6B7280';

/**
 * 系统字体栈。不引入任何 webfont：装了 Inter 就用，否则回落到各平台的
 * 原生 UI 字体。默认语言是 zh-CN，所以中文字族必须显式列出，否则会掉到宋体。
 */
export const fontFamily =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

/** 作用于全部 antd 组件，包含 ProLayout 之外的登录页、Modal、Message。 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: brandColor,
    colorInfo: brandColor,
    colorBgLayout,
    colorBgContainer,
    colorBgElevated: colorBgContainer,
    colorBorder: '#D9DCE3',
    colorBorderSecondary,
    colorTextHeading,
    colorText: colorTextBody,
    colorTextSecondary,
    colorTextTertiary,
    borderRadius: 8,
    borderRadiusLG: 8,
    borderRadiusSM: 6,
    controlHeight: 36,
    fontSize: 14,
    fontFamily,
    // 环境阴影压到几乎不可见，层次交给边框。
    boxShadow: '0 1px 2px 0 rgba(16,24,40,0.04)',
    boxShadowTertiary: '0 1px 2px 0 rgba(16,24,40,0.04)',
    // 浮层例外：纯白弹层落在纯白卡片上需要一道 1px ring 才能分辨边界。
    boxShadowSecondary:
      '0 4px 12px -2px rgba(16,24,40,0.08), 0 0 0 1px rgba(16,24,40,0.04)',
  },
  components: {
    Table: {
      headerBg: '#FAFAFB',
      headerColor: colorTextSecondary,
      // 表头列间的竖线在扁平风格里显得很碎。
      headerSplitColor: 'transparent',
      borderColor: colorBorderSecondary,
      rowHoverBg: colorBgLayout,
      cellPaddingBlock: 12,
    },
  },
};

/** 只作用于 ProLayout 的外壳：侧栏、顶栏、PageContainer。 */
export const layoutToken: ProLayoutProps['token'] = {
  bgLayout: colorBgLayout,
  sider: {
    colorMenuBackground: colorBgContainer,
    colorMenuItemDivider: colorBorderSecondary,
    colorTextMenu: colorTextSecondary,
    colorTextMenuSecondary: colorTextTertiary,
    colorTextMenuTitle: colorTextHeading,
    colorTextMenuSelected: brandColor,
    colorTextMenuActive: brandColor,
    colorTextSubMenuSelected: brandColor,
    colorTextMenuItemHover: colorTextHeading,
    colorBgMenuItemHover: '#F3F4F6',
    colorBgMenuItemSelected: brandColorBg,
    colorBgMenuItemActive: brandColorBg,
    colorBgCollapsedButton: colorBgContainer,
    colorTextCollapsedButton: colorTextTertiary,
    colorTextCollapsedButtonHover: colorTextHeading,
    paddingInlineLayoutMenu: 8,
    paddingBlockLayoutMenu: 8,
  },
  header: {
    colorBgHeader: colorBgContainer,
    colorBgScrollHeader: colorBgContainer,
    colorHeaderTitle: colorTextHeading,
    colorTextMenu: colorTextSecondary,
    colorTextMenuSelected: colorTextHeading,
    colorTextRightActionsItem: colorTextTertiary,
    colorBgRightActionsItemHover: '#F3F4F6',
    heightLayoutHeader: 48,
  },
  pageContainer: {
    // 内容区自己不着色，露出 bgLayout。
    colorBgPageContainer: 'transparent',
    paddingInlinePageContainerContent: 24,
    paddingBlockPageContainerContent: 16,
  },
};
