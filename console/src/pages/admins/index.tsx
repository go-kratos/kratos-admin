import { type DataTableRef, DataTable } from "@/components";
import { type Admin, services } from "@/services";
import type { ProColumns } from "@ant-design/pro-components";
import { PageContainer } from "@ant-design/pro-components";
import { FormattedMessage, useIntl } from "@umijs/max";
import { Popconfirm, Tag, Typography } from "antd";
import React, { useCallback, useRef } from "react";
import { adminStatusColumn } from "./columns";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";

/** 一次拉取的上限。取满时 DataTable 的 footer 会提示还有更多。 */
const PAGE_SIZE = 100;

/** 把值转成 CEL 字符串字面量，否则搜索词里的引号会让后端解析失败。 */
const celString = (value: string) =>
  `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

const TableList: React.FC = () => {
  const tableRef = useRef<DataTableRef<Admin>>(null);
  const intl = useIntl();

  const handleList = useCallback(async (params: { keyword?: string }) => {
    const word = params.keyword?.trim();
    // `:` 是 AIP 的 has 操作符，后端映射成 LIKE %x%，所以一个输入框可以同时
    // 模糊匹配名称和邮箱。
    const filter = word
      ? `name:${celString(word)} OR email:${celString(word)}`
      : undefined;
    const res = await services.admin.ListAdmins({
      pageSize: PAGE_SIZE,
      pageToken: undefined,
      filter,
      orderBy: "created_at desc",
    });
    return {
      data: res.admins ?? [],
      success: true,
      hasMore: Boolean(res.nextPageToken),
    };
  }, []);

  const columns: ProColumns<Admin>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.name"
          defaultMessage="Name"
        />
      ),
      dataIndex: "name",
      render: (_, record) => (
        <Typography.Text strong>{record.name}</Typography.Text>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.email"
          defaultMessage="Email"
        />
      ),
      dataIndex: "email",
      // 邮箱比名称长，复制出来比读出来更常用。
      copyable: true,
      ellipsis: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.access"
          defaultMessage="Access"
        />
      ),
      dataIndex: "access",
      width: 120,
      // 与 status 同理：后端只声明 name/email/created_at 可过滤。
      search: false,
      // access 的取值是 "admin" / "user" 这类标识符，和表单里的 options 一样
      // 直接展示，不做翻译。
      render: (_, record) =>
        record.access ? (
          <Tag
            variant="filled"
            color={record.access === "admin" ? "purple" : undefined}
          >
            {record.access}
          </Tag>
        ) : (
          "-"
        ),
    },
    adminStatusColumn,
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.createdAt"
          defaultMessage="Created at"
        />
      ),
      dataIndex: "createdAt",
      valueType: "dateTime",
      width: 200,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.titleOption"
          defaultMessage="Operating"
        />
      ),
      dataIndex: "option",
      valueType: "option",
      width: 120,
      render: (_, record) => [
        <UpdateForm
          trigger={
            <a>
              <FormattedMessage
                id="pages.searchTable.edit"
                defaultMessage="Edit"
              />
            </a>
          }
          key="edit"
          onOk={() => tableRef.current?.reload()}
          values={record}
        />,
        <Popconfirm
          key="delete"
          title={intl.formatMessage({
            id: "pages.searchTable.deleteConfirm.title",
          })}
          description={intl.formatMessage({
            id: "pages.searchTable.deleteConfirm.description",
          })}
          onConfirm={() => tableRef.current?.remove([record])}
        >
          <a>
            <FormattedMessage
              id="pages.searchTable.delete"
              defaultMessage="Delete"
            />
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer
      title={intl.formatMessage({ id: "pages.searchTable.title" })}
      content={
        <Typography.Text type="secondary">
          <FormattedMessage id="pages.searchTable.description" />
        </Typography.Text>
      }
      // 主操作放页头右上角，和标题同一视线高度；工具栏只留搜索与刷新。
      extra={[
        <CreateForm key="create" reload={() => tableRef.current?.reload()} />,
      ]}
    >
      <DataTable<Admin>
        ref={tableRef}
        columns={columns}
        request={handleList}
        pageSize={PAGE_SIZE}
        searchPlaceholder={intl.formatMessage({
          id: "pages.searchTable.searchPlaceholder",
        })}
        onDelete={(row) => services.admin.DeleteAdmin({ id: row.id })}
      />
    </PageContainer>
  );
};

export default TableList;
