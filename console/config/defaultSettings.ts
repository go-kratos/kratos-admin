import type { ProLayoutProps } from '@ant-design/pro-components';
import { brandColor, layoutToken } from './theme';

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
  token: layoutToken,
};

export default Settings;
