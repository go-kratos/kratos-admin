import { Footer } from "@/components";
import { createAdminService } from "@/services/index";
import { LoginRequest } from "@/services/kratos/admin/v1/index";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { FormattedMessage, Helmet, SelectLang, useIntl, useModel } from "@umijs/max";
import { App } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import { flushSync } from "react-dom";
import Settings from "../../../../config/defaultSettings";

const adminService = createAdminService();

const useStyles = createStyles(({ token }) => {
  return {
    lang: {
      width: 42,
      height: 42,
      lineHeight: "42px",
      position: "fixed",
      right: 16,
      borderRadius: token.borderRadius,
      ":hover": {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "auto",
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: "100% 100%",
    },
  };
});

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const Login: React.FC = () => {
  const { setInitialState } = useModel("@@initialState");
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const handleSubmit = async (req: LoginRequest) => {
    try {
      const userInfo = await adminService.Login(req);
      const defaultLoginSuccessMessage = intl.formatMessage({
        id: "pages.login.success",
        defaultMessage: "登录成功！",
      });
      message.success(defaultLoginSuccessMessage);
      // set user state
      flushSync(() => {
        setInitialState((state) => ({
          ...state,
          currentUser: userInfo,
        }));
      });
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get("redirect") || "/";
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: "pages.login.failure",
        defaultMessage: "登录失败，请重试！",
      });
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: "menu.login",
            defaultMessage: "登录页",
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: "1",
          padding: "32px 0",
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: "75vw",
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({
            id: "pages.layouts.userLayout.title",
          })}
          onFinish={async (values) => {
            await handleSubmit(values as LoginRequest);
          }}
        >
          <ProFormText
            name="username"
            fieldProps={{
              size: "large",
              prefix: <UserOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: "pages.login.username.placeholder",
              defaultMessage: "用户名: admin",
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.username.required"
                    defaultMessage="请输入用户名!"
                  />
                ),
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: "large",
              prefix: <LockOutlined />,
            }}
            placeholder={intl.formatMessage({
              id: "pages.login.password.placeholder",
              defaultMessage: "密码",
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.login.password.required"
                    defaultMessage="请输入密码！"
                  />
                ),
              },
            ]}
          />
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
