/**
 * 这个文件作为组件的目录
 * 目的是统一管理对外输出的组件，方便分类
 */
import DataTable from './DataTable';
import Footer from './Footer';
import Logo from './Logo';
import { SelectLang } from './RightContent';
import { AvatarDropdown, AvatarName } from './RightContent/AvatarDropdown';

export type { DataTableRef, DataTableResult } from './DataTable';
export { AvatarDropdown, AvatarName, DataTable, Footer, Logo, SelectLang };
