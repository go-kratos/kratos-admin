import { type Admin, type ListAdminsRequest, services } from "@/services";
import type {
  ActionType,
  ProColumns,
  ProDescriptionsItemProps,
} from "@ant-design/pro-components";
import {
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { FormattedMessage, useIntl } from "@umijs/max";
import { Button, Drawer, message, Popconfirm } from "antd";
import React, { useCallback, useRef, useState } from "react";
import CreateForm from "./components/CreateForm";
import UpdateForm from "./components/UpdateForm";

type AdminQueryParams = {
  current?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  phone?: string;
};

const handleList = async (params: AdminQueryParams) => {
  const filters: string[] = [];
  if (params.name) {
    filters.push(`name="${params.name}"`);
  }
  if (params.email) {
    filters.push(`email="${params.email}"`);
  }
  if (params.phone) {
    filters.push(`phone="${params.phone}"`);
  }
  const requestParams: ListAdminsRequest = {
    pageSize: params.pageSize,
    pageToken: undefined,
    filter: filters.join(" AND ") || undefined,
    orderBy: undefined,
  };
  const res = await services.admin.ListAdmins(requestParams);
  return {
    data: res.admins ?? [],
    success: true,
  };
};

const TableList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<Admin>();
  const [selectedRowsState, setSelectedRows] = useState<Admin[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  /**
   *  Delete node
   *
   * @param selectedRows
   */
  const handleRemove = useCallback(
    async (selectedRows: Admin[]) => {
      try {
        setDeleteLoading(true);
        for (const row of selectedRows) {
          await services.admin.DeleteAdmin({ id: row.id });
        }
        setSelectedRows([]);
        actionRef.current?.reloadAndRest?.();
        messageApi.success("Deleted successfully and will refresh soon");
      } catch {
        // Reporting is handled globally in requestErrorConfig.
      } finally {
        setDeleteLoading(false);
      }
    },
    [messageApi]
  );

  const columns: ProColumns<Admin>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.name"
          defaultMessage="Name"
        />
      ),
      dataIndex: "name",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.email"
          defaultMessage="Email"
        />
      ),
      dataIndex: "email",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.phone"
          defaultMessage="Phone"
        />
      ),
      dataIndex: "phone",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.access"
          defaultMessage="Access"
        />
      ),
      dataIndex: "access",
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.status"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      // 后端的 filter 只声明了 name/email/phone/created_at，status 不可过滤，
      // 所以不能让 ProTable 为这一列自动生成搜索项。
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
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.createdAt"
          defaultMessage="Created at"
        />
      ),
      dataIndex: "createdAt",
      valueType: "dateTime",
      search: false,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.title.updatedAt"
          defaultMessage="Updated at"
        />
      ),
      dataIndex: "updatedAt",
      valueType: "dateTime",
      search: false,
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
          onOk={actionRef.current?.reload}
          values={record}
        />,
        <Popconfirm
          key="delete"
          title="Delete the user"
          description="Are you sure to delete this user?"
          onConfirm={() => {
            handleRemove([record]);
          }}
          okText="Yes"
          cancelText="No"
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
    <PageContainer>
      {contextHolder}
      <ProTable<Admin, AdminQueryParams>
        headerTitle={intl.formatMessage({
          id: "pages.searchTable.title",
          defaultMessage: "Enquiry form",
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <CreateForm key="create" reload={actionRef.current?.reload} />,
        ]}
        request={handleList}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage
                id="pages.searchTable.chosen"
                defaultMessage="Chosen"
              />{" "}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{" "}
              <FormattedMessage
                id="pages.searchTable.item"
                defaultMessage="Items"
              />
            </div>
          }
        >
          <Button
            loading={deleteLoading}
            onClick={() => {
              handleRemove(selectedRowsState);
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<Admin>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<Admin>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
