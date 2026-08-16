import { type Admin, services } from "@/services";
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
} from "@ant-design/pro-components";
import { FormattedMessage, useIntl, useRequest } from "@umijs/max";
import { message } from "antd";
import type { FC, ReactElement } from "react";

export type UpdateFormProps = {
  trigger?: ReactElement;
  onOk?: () => void;
  values: Partial<Admin>;
};

const UpdateForm: FC<UpdateFormProps> = (props) => {
  const { onOk, values, trigger } = props;

  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(services.admin.UpdateAdmin, {
    manual: true,
    onSuccess: () => {
      messageApi.success(
        intl.formatMessage({ id: "pages.searchTable.updateSuccess" })
      );
      onOk?.();
    },
  });

  const onFinish = async (formValues: Admin) => {
    // 只把要改的字段列进 mask。password 留空意为「不改」，若也列进去，服务端的
    // fieldmask.Update 会把它当成一次显式清空。
    const paths = ["name", "email", "access"];
    if (formValues.password) {
      paths.push("password");
    }
    try {
      await run({ admin: formValues, updateMask: paths.join(",") });
      return true;
    } catch {
      // Reporting is handled globally in requestErrorConfig.
      return false;
    }
  };

  return (
    <>
      {contextHolder}
      <ModalForm<Admin>
        title={intl.formatMessage({
          id: "pages.searchTable.updateForm.basicConfig",
          defaultMessage: "Basic Information",
        })}
        trigger={trigger}
        initialValues={values}
        // 与新建弹窗同宽，两个表单看起来才是一套。
        width={480}
        modalProps={{
          destroyOnHidden: true,
          okButtonProps: { loading },
        }}
        onFinish={onFinish}
      >
        <ProFormText name="id" hidden />
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
        {/* 编辑时密码非必填：留空即不修改，占位文案要把这点说清楚。 */}
        <ProFormText.Password
          name="password"
          label={intl.formatMessage({ id: "pages.searchTable.title.password" })}
          placeholder={intl.formatMessage({
            id: "pages.searchTable.placeholder.passwordKeep",
          })}
        />
      </ModalForm>
    </>
  );
};

export default UpdateForm;
