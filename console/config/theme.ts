import type { ProLayoutProps } from '@ant-design/pro-components';
import type { ThemeConfig } from 'antd';

/**
 * 设计立场：中性近白底 + 纯白容器，层次由 1px 边框建立而非阴影，品牌色只出现在
 * 需要用户注意的地方（主按钮、链接、侧栏选中态）。
 *
 * 这个文件被 config.ts（build 时序列化）和 defaultSettings.ts（运行时进 bundle）
 * 同时引用，所以只能存放纯数据和纯函数：不要在这里调用 theme.useToken()。
 */

/** 品牌葡萄紫，SettingDrawer 未改动时的默认主题色。 */
export const brandColor = '#7624F4';

const colorBgContainer = '#FFFFFF';
/** 内容区底色。零饱和度 —— 掺进主题色会让整屏透出色偏。 */
const colorBgLayout = '#FDFDFD';
/**
 * 所有边框：表单控件、卡片、表格行线、侧栏边界。antd 默认把控件边框（colorBorder，
 * #D9D9D9）和分割线（colorBorderSecondary，#F0F0F0）分成深浅两档，这里统一成一个
 * 值 —— 同一个页面上线宽相同却深浅不同，看着像两套东西。
 *
 * 落在两档之间：#D9D9D9 对白底 1.41，铺满整页显得脏重；#F2F2F2 只有 1.12，卡片
 * 和表格的边界又看不出来。
 */
const colorBorder = '#EAEAEA';
const colorTextHeading = '#03080A';
const colorTextBody = '#1B2022';
const colorTextSecondary = '#505456';
/** 对白底 4.85:1，满足 WCAG AA 正文要求。 */
const colorTextTertiary = '#6F7273';

/** 行 hover 与菜单 hover：叠在纯白容器上的两档中性灰。 */
const colorBgRowHover = '#F8F8F8';
const colorBgHover = '#F4F4F4';

/**
 * 系统字体栈。不引入任何 webfont：装了 Inter 就用，否则回落到各平台的原生 UI
 * 字体。默认语言是 zh-CN，所以中文字族必须显式列出，否则会掉到宋体。
 */
export const fontFamily =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'";

/**
 * 侧栏选中项底色：白底上掺 8% 主题色。这是唯一需要跟着 SettingDrawer 实时变化的
 * 派生色，所以只有它做成函数。
 *
 * 非 6 位 hex 一律退回纯白（等于没有选中底色），比算出一个错色更容易发现。
 */
const deriveSelectedBg = (primary: string) => {
  const hex = primary.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return colorBgContainer;
  const n = Number.parseInt(hex, 16);
  const channels = [n >> 16, (n >> 8) & 0xff, n & 0xff];
  return `#${channels
    .map((v) =>
      Math.round(255 + (v - 255) * 0.08)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

/**
 * 作用于全部 antd 组件，包含 ProLayout 之外的登录页、Modal、Message。
 *
 * 这份配置在 build 时被序列化，因此固定用 brandColor。SettingDrawer 换色时只有
 * ProLayout 外壳会实时跟随（见 src/app.tsx），而它只在 dev 下渲染。
 */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: brandColor,
    colorInfo: brandColor,
    colorBgLayout,
    colorBgContainer,
    colorBgElevated: colorBgContainer,
    colorBorder,
    // 分割线与控件边框取同一个值，见 colorBorder 的说明。
    colorBorderSecondary: colorBorder,
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
      // 表头和 footer 都保持纯白，分区交给 1px 分割线。刷上灰底会把表格切成
      // 三个色块，而且色块在卡片圆角处会露出直角。
      headerBg: colorBgContainer,
      footerBg: colorBgContainer,
      headerColor: colorTextHeading,
      headerBorderRadius: 0,
      // 表头列间的竖线在扁平风格里显得很碎。
      headerSplitColor: 'transparent',
      borderColor: colorBorder,
      rowHoverBg: colorBgRowHover,
      cellPaddingBlock: 12,
    },
  },
};

/**
 * ProLayout 外壳（侧栏、顶栏、PageContainer）的配色。
 *
 * 做成函数而非常量，是因为 SettingDrawer 只写 settings.colorPrimary，而侧栏读的是
 * token.sider.*。两条路径不相通，静态常量会让侧栏永远停在默认色上。
 */
export const buildLayoutToken = (
  primary: string = brandColor,
): ProLayoutProps['token'] => {
  const selectedBg = deriveSelectedBg(primary);
  return {
    bgLayout: colorBgLayout,
    sider: {
      colorMenuBackground: colorBgContainer,
      colorMenuItemDivider: colorBorder,
      colorTextMenu: colorTextSecondary,
      colorTextMenuSecondary: colorTextTertiary,
      colorTextMenuTitle: colorTextHeading,
      colorTextMenuSelected: primary,
      colorTextMenuActive: primary,
      colorTextSubMenuSelected: primary,
      colorTextMenuItemHover: colorTextHeading,
      colorBgMenuItemHover: colorBgHover,
      colorBgMenuItemSelected: selectedBg,
      colorBgMenuItemActive: selectedBg,
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
      colorBgRightActionsItemHover: colorBgHover,
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
