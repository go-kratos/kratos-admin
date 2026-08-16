import type { Admin } from "@/services";
import type { ProColumns } from "@ant-design/pro-components";
import { FormattedMessage } from "@umijs/max";

/**
 * 状态列。管理员列表和概览页的「最近创建」都用它，状态映射改动只需要动这一处。
 *
 * 只映射 ACTIVE / INACTIVE：DELETED 不会出现在读接口的结果里，
 * STATUS_UNSPECIFIED 理论上也不该出现，未映射的值会原样渲染。
 */
export const adminStatusColumn: ProColumns<Admin> = {
  title: (
    <FormattedMessage
      id="pages.searchTable.title.status"
      defaultMessage="Status"
    />
  ),
  dataIndex: "status",
  width: 120,
  // 后端只声明了 name/email/created_at 可过滤，让 ProTable 为这一列生成搜索项
  // 会得到一个必然被 ParseFilter 拒绝的条件。
  search: false,
  valueEnum: {
    ACTIVE: {
      text: (
        <FormattedMessage
          id="pages.searchTable.status.active"
          defaultMessage="Active"
        />
      ),
      status: "Success",
    },
    INACTIVE: {
      text: (
        <FormattedMessage
          id="pages.searchTable.status.inactive"
          defaultMessage="Inactive"
        />
      ),
      status: "Default",
    },
  },
};
