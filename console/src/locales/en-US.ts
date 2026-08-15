import component from './en-US/component';
import menu from './en-US/menu';
import pages from './en-US/pages';
import settingDrawer from './en-US/settingDrawer';

export default {
  'navBar.lang': 'Languages',
  'layout.user.link.help': 'Help',
  'layout.user.link.privacy': 'Privacy',
  'layout.user.link.terms': 'Terms',
  ...menu,
  ...settingDrawer,
  ...component,
  ...pages,
};
