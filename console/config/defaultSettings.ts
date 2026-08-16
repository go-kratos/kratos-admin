import type { ProLayoutProps } from '@ant-design/pro-components';
import { brandColor, buildLayoutToken } from './theme';

const Settings: ProLayoutProps & {
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: brandColor,
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Kratos Admin',
  logo: '/logo.svg',
  iconfontUrl: '',
  // 首屏用默认主题色的那一套；SettingDrawer 换色后由 src/app.tsx 重新派生，
  // 见那里对 token 覆盖顺序的说明。
  token: buildLayoutToken(brandColor),
};

export default Settings;
