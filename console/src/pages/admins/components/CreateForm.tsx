import { type Admin, services } from "@/services";
import { PlusOutlined } from "@ant-design/icons";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { FormattedMessage, useIntl, useRequest } from "@umijs/max";
import { Button, message } from "antd";
import type { FC } from "react";

interface CreateFormProps {
  /** 创建成功后刷新列表。 */
  reload?: () => void;
}

const CreateForm: FC<CreateFormProps> = (props) => {
  const { reload } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  const { run, loading } = useRequest(services.admin.CreateAdmin, {
    manual: true,
    onSuccess: () => {
      messageApi.success(
        intl.formatMessage({ id: "pages.searchTable.createSuccess" })
      );
      reload?.();
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
        // 480 而不是更窄：四个字段竖排下来高度接近 500，太窄会显得瘦长。
        width={480}
        modalProps={{ okButtonProps: { loading }, destroyOnHidden: true }}
        onFinish={async (value) => {
          try {
            await run({ admin: value as Admin });
            return true;
          } catch {
            // Reporting is handled globally in requestErrorConfig.
            return false;
          }
        }}
      >
        {/* 不给字段设 width：pro-form 的 "md" 是固定 328px，在弹窗里会让输入框右侧
            空出一段。不设就跟着容器占满。 */}
        <ProFormText
          name="name"
          label={intl.formatMessage({ id: "pages.searchTable.title.name" })}
          placeholder={intl.formatMessage({
            id: "pages.searchTable.placeholder.name",
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="pages.searchTable.required.name" />
              ),
            },
          ]}
        />
        <ProFormText
          name="email"
          label={intl.formatMessage({ id: "pages.searchTable.title.email" })}
          placeholder={intl.formatMessage({
            id: "pages.searchTable.placeholder.email",
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="pages.searchTable.required.email" />
              ),
            },
            {
              type: "email",
              message: (
                <FormattedMessage id="pages.searchTable.invalid.email" />
              ),
            },
          ]}
        />
        {/* Password 而非 type="password"：它自带明文切换，创建账号时能核对输入。 */}
        <ProFormText.Password
          name="password"
          label={intl.formatMessage({ id: "pages.searchTable.title.password" })}
          placeholder={intl.formatMessage({
            id: "pages.searchTable.placeholder.password",
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="pages.searchTable.required.password" />
              ),
            },
          ]}
        />
        <ProFormSelect
          name="access"
          label={intl.formatMessage({ id: "pages.searchTable.title.access" })}
          placeholder={intl.formatMessage({
            id: "pages.searchTable.placeholder.access",
          })}
          // 取值是后端约定的标识符，直接展示不做翻译，与表格里的 access 标签一致。
          options={[
            { label: "user", value: "user" },
            { label: "admin", value: "admin" },
          ]}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="pages.searchTable.required.access" />
              ),
            },
          ]}
        />
      </ModalForm>
    </>
  );
};

export default CreateForm;
