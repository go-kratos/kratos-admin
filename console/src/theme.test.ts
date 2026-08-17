import { brandColor, buildAntdTheme, buildLayoutToken } from '../config/theme';

describe('theme builders', () => {
  it('uses neutral light colors by default', () => {
    const theme = buildAntdTheme();
    const layout = buildLayoutToken();

    expect(theme.token?.colorBgContainer).toBe('#FFFFFF');
    expect(theme.token?.colorText).toBe('#1B2022');
    expect(layout?.bgLayout).toBe('#FDFDFD');
    expect(layout?.sider?.colorMenuBackground).toBe('#FFFFFF');
  });

  it('uses dark surfaces and readable text throughout the layout', () => {
    const theme = buildAntdTheme(brandColor, 'dark');
    const layout = buildLayoutToken(brandColor, 'dark');

    expect(theme.token).toMatchObject({
      colorBgLayout: '#0F0F10',
      colorBgContainer: '#18181A',
      colorBgElevated: '#202024',
      colorBorder: '#303034',
      colorText: '#E6E6E8',
    });
    expect(theme.components?.Table).toMatchObject({
      headerBg: '#18181A',
      borderColor: '#303034',
      rowHoverBg: '#202024',
    });
    expect(theme.components?.Menu).toMatchObject({
      darkItemColor: '#B5B5B9',
      darkItemSelectedColor: '#bb92fa',
      darkItemSelectedBg: '#2b1a46',
    });
    expect(layout?.bgLayout).toBe('#0F0F10');
    expect(layout?.sider).toMatchObject({
      colorMenuBackground: '#18181A',
      colorMenuItemDivider: '#303034',
      colorBgMenuItemHover: '#26262A',
    });
  });

  it('mixes the selected background against the current surface', () => {
    const light = buildLayoutToken(brandColor, 'light');
    const dark = buildLayoutToken(brandColor, 'dark');

    expect(light?.sider?.colorBgMenuItemSelected).toBe('#f4edfe');
    expect(dark?.sider?.colorBgMenuItemSelected).toBe('#2b1a46');
  });
});
