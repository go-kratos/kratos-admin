import component from './zh-CN/component';
import menu from './zh-CN/menu';
import pages from './zh-CN/pages';
import settingDrawer from './zh-CN/settingDrawer';

export default {
  'navBar.lang': '语言',
  'layout.user.link.help': '帮助',
  'layout.user.link.privacy': '隐私',
  'layout.user.link.terms': '条款',
  ...pages,
  ...menu,
  ...settingDrawer,
  ...component,
};
