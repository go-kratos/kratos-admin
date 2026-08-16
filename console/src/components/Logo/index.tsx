import { brandColor } from '../../../config/theme';

export type LogoProps = {
  /** 方块底色。传入当前主题色即可让 logo 跟随 SettingDrawer 换色。 */
  color?: string;
  size?: number;
  /**
   * `plain` 去掉方块底，只留 K 字形，字形取 `color`。登录页左栏本身就是品牌色底，
   * 再叠一个同色方块会糊成一块 —— 那里传 `plain` + 白色。
   */
  variant?: 'solid' | 'plain';
};

/**
 * 品牌标记。做成组件而非引用 public/logo.svg，是因为静态文件的 fill 写死在文件里，
 * 主题色变了它不会动。
 *
 * 字形与 public/logo.svg 一致 —— 那份仍用于 favicon 生成，改这里时两处都要动。
 */
const Logo: React.FC<LogoProps> = ({
  color = brandColor,
  size = 28,
  variant = 'solid',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Kratos Admin"
  >
    {variant === 'solid' && (
      <rect width="200" height="200" rx="44" fill={color} />
    )}
    <g fill={variant === 'solid' ? '#FFFFFF' : color}>
      <rect x="52" y="46" width="26" height="108" rx="6" />
      <path d="M132 46h30l-58 54 58 54h-32l-52-50v-8z" />
    </g>
  </svg>
);

export default Logo;
