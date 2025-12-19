import { createAdminService } from "@/services/index";
import type { Admin } from "@/services/kratos/admin/v1";
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

const adminService = createAdminService();

const UpdateForm: FC<UpdateFormProps> = (props) => {
  const { onOk, values, trigger } = props;

  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();

  const { run, loading } = useRequest(adminService.UpdateAdmin, {
    manual: true,
    onSuccess: () => {
      messageApi.success("Updated successfully");
      onOk?.();
    },
    onError: () => {
      messageApi.error("Update failed, please try again!");
    },
  });

  const onFinish = async (formValues: Admin) => {
    if (!values.id) {
      messageApi.error("Missing admin id");
      return false;
    }
    const updateMask = ["name", "email", "phone", "access", "password"].join(
      ","
    );
    try {
      await run({ admin: formValues, updateMask });
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <>
      {contextHolder}
      <ModalForm<Admin>
        title={intl.formatMessage({
          id: "pages.searchTable.updateForm.basicConfig",
          defaultMessage: "基本信息",
        })}
        trigger={trigger}
        initialValues={values}
        width="400px"
        modalProps={{
          destroyOnClose: true,
          okButtonProps: { loading },
        }}
        onFinish={onFinish}
      >
        <ProFormText name="id" hidden />
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
        <ProFormText
          label={intl.formatMessage({
            id: "pages.searchTable.title.password",
            defaultMessage: "Password",
          })}
          width="md"
          name="password"
          fieldProps={{ type: "password" }}
        />
      </ModalForm>
    </>
  );
};

export default UpdateForm;
