import { createAdminService } from "@/services/index";
import { CreateAdminRequest } from "@/services/kratos/admin/v1/index";
import { PlusOutlined } from "@ant-design/icons";
import {
  type ActionType,
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { FormattedMessage, useIntl, useRequest } from "@umijs/max";
import { Button, message } from "antd";
import type { FC } from "react";

interface CreateFormProps {
  reload?: ActionType["reload"];
}

const adminService = createAdminService();

const CreateForm: FC<CreateFormProps> = (props) => {
  const { reload } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  const { run, loading } = useRequest(adminService.CreateAdmin, {
    manual: true,
    onSuccess: () => {
      messageApi.success("Added successfully");
      reload?.();
    },
    onError: () => {
      messageApi.error("Adding failed, please try again!");
    },
  });

  return (
    <>
      {contextHolder}
      <ModalForm
        title={intl.formatMessage({
          id: "pages.searchTable.createForm.newAdmin",
          defaultMessage: "New admin",
        })}
        trigger={
          <Button type="primary" icon={<PlusOutlined />}>
            <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>
        }
        width="400px"
        modalProps={{ okButtonProps: { loading } }}
        onFinish={async (value) => {
          try {
            await run({ admin: value as CreateAdminRequest });
            return true;
          } catch (error) {
            return false;
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.required.name"
                  defaultMessage="Name is required"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: "pages.searchTable.title.name",
            defaultMessage: "Name",
          })}
          width="md"
          name="name"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.required.email"
                  defaultMessage="Email is required"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: "pages.searchTable.title.email",
            defaultMessage: "Email",
          })}
          width="md"
          name="email"
        />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.required.password"
                  defaultMessage="Password is required"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: "pages.searchTable.title.password",
            defaultMessage: "Password",
          })}
          width="md"
          name="password"
          fieldProps={{ type: "password" }}
        />
        <ProFormSelect
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.required.access"
                  defaultMessage="Access is required"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: "pages.searchTable.title.access",
            defaultMessage: "Access",
          })}
          width="md"
          name="access"
          options={[
            { label: "User", value: "user" },
            { label: "Admin", value: "admin" },
          ]}
        />
        <ProFormText
          label={intl.formatMessage({
            id: "pages.searchTable.title.phone",
            defaultMessage: "Phone",
          })}
          width="md"
          name="phone"
        />
      </ModalForm>
    </>
  );
};

export default CreateForm;
