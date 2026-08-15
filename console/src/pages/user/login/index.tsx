import { Footer } from "@/components";
import { type LoginRequest, services } from "@/services";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { LoginForm, ProFormText } from "@ant-design/pro-components";
import { FormattedMessage, Helmet, SelectLang, useIntl, useModel } from "@umijs/max";
import { App } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import { flushSync } from "react-dom";
import Settings from "../../../../config/defaultSettings";

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
      backgroundColor: token.colorBgLayout,
      // 顶部一层极淡的品牌色光晕，零外部资源。
      backgroundImage:
        "radial-gradient(60% 50% at 50% 0%, rgba(79,70,229,0.06) 0%, rgba(79,70,229,0) 100%)",
    },
    card: {
      width: 400,
      maxWidth: "calc(100vw - 32px)",
      margin: "0 auto",
      padding: "32px 0 8px",
      backgroundColor: token.colorBgContainer,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadiusLG,
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
      const userInfo = await services.admin.Login(req);
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
    } catch {
      // Reporting the failure is handled globally in requestErrorConfig, which
      // maps `reason` to the wording for this locale.
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
          display: "flex",
          alignItems: "center",
          padding: "48px 16px",
        }}
      >
        <div className={styles.card}>
          <LoginForm
            contentStyle={{
              minWidth: 280,
              maxWidth: "100%",
            }}
            logo={<img alt="logo" src="/logo.svg" />}
            title="Kratos Admin"
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
                defaultMessage: "用户名",
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
      </div>
      <Footer />
    </div>
  );
};

export default Login;
