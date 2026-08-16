import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { App, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import { flushSync } from 'react-dom';
import { Logo } from '@/components';
import { type LoginRequest, services } from '@/services';
import Settings from '../../../../config/defaultSettings';
import { brandColor } from '../../../../config/theme';

/** 左右分栏的断点：窄于此值时左侧品牌区收起，表单占满整屏。 */
const SPLIT_AT = 768;

const useStyles = createStyles(({ token }) => {
  return {
    page: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: token.colorBgContainer,
      [`@media (max-width: ${SPLIT_AT - 1}px)`]: {
        flexDirection: 'column',
      },
    },
    lang: {
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 1,
      width: 42,
      height: 42,
      lineHeight: '42px',
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    // 左栏：public/login-brand.svg 铺满，文字叠在上面。
    //
    // 左栏偏大：右栏只放一个 360px 的表单，给它更多宽度只是加白边，而品牌图越宽
    // 越好看。backgroundColor 是图加载前的兜底，避免白底闪一下。
    brandPane: {
      flex: '0 0 63%',
      // 必须显式声明：emotion 不带 border-box reset，默认 content-box 下 flex-basis
      // 只算内容区，再加上左右 56px padding，左栏会撑到 66% 而不是 58%。
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: 56,
      color: '#FFFFFF',
      backgroundColor: brandColor,
      backgroundImage: 'url(/login-brand.svg)',
      // cover 会裁掉长短边之一，所以 SVG 里的图形都留在中心安全区内。
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      [`@media (max-width: ${SPLIT_AT - 1}px)`]: {
        // 窄屏只留一条品牌色顶栏，不占掉表单的垂直空间。
        flex: '0 0 auto',
        padding: 24,
      },
    },
    brandRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    brandLogo: {
      display: 'block',
    },
    brandTitle: {
      margin: 0,
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 600,
    },
    brandSlogan: {
      margin: 0,
      maxWidth: 360,
      color: 'rgba(255,255,255,0.82)',
      fontSize: 24,
      lineHeight: 1.5,
      [`@media (max-width: ${SPLIT_AT - 1}px)`]: {
        display: 'none',
      },
    },
    brandFoot: {
      margin: 0,
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12,
      [`@media (max-width: ${SPLIT_AT - 1}px)`]: {
        display: 'none',
      },
    },
    // 右栏：表单垂直居中，不用卡片边框 —— 左栏的色块已经把版面分开了。
    formPane: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    },
    formInner: {
      width: '100%',
      maxWidth: 360,
      // LoginForm 把 main 写死成 min-width:328px、container 带水平内边距，
      // 在这个宽度下会溢出并让输入框缩不下去。
      '.ant-pro-form-login-container': {
        paddingInline: 0,
        paddingBlock: 0,
      },
      '.ant-pro-form-login-main': {
        minWidth: 'auto',
        maxWidth: 'none',
        width: '100%',
      },
    },
    formHead: {
      marginBottom: 32,
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
  const { setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const handleSubmit = async (req: LoginRequest) => {
    try {
      const userInfo = await services.admin.Login(req);
      message.success(intl.formatMessage({ id: 'pages.login.success' }));
      // set user state
      flushSync(() => {
        setInitialState((state) => ({
          ...state,
          currentUser: userInfo,
        }));
      });
      const urlParams = new URL(window.location.href).searchParams;
      window.location.href = urlParams.get('redirect') || '/';
    } catch {
      // Reporting the failure is handled globally in requestErrorConfig, which
      // maps `reason` to the wording for this locale.
    }
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>
          {intl.formatMessage({ id: 'menu.login', defaultMessage: '登录页' })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />

      <div className={styles.brandPane}>
        <div className={styles.brandRow}>
          <span className={styles.brandLogo}>
            <Logo variant="plain" color="#FFFFFF" size={34} />
          </span>
          <h1 className={styles.brandTitle}>Kratos Admin</h1>
        </div>
        <p className={styles.brandSlogan}>
          {intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
        </p>
        <p className={styles.brandFoot}>
          {intl.formatMessage({ id: 'pages.login.brandFoot' })}
        </p>
      </div>

      <div className={styles.formPane}>
        <div className={styles.formInner}>
          <div className={styles.formHead}>
            <Typography.Title level={3} style={{ marginBottom: 4 }}>
              {intl.formatMessage({ id: 'pages.login.welcome' })}
            </Typography.Title>
            <Typography.Text type="secondary">
              {intl.formatMessage({ id: 'pages.login.welcomeDesc' })}
            </Typography.Text>
          </div>
          <LoginForm
            // width 必须走 contentStyle：LoginForm 把 `width: 328px` 写成内联样式，
            // 类选择器压不动它。contentStyle 展开在后，能盖掉。
            contentStyle={{ width: '100%', minWidth: 'auto', maxWidth: '100%' }}
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({ id: 'pages.login.submit' }),
              },
            }}
            onFinish={async (values) => {
              await handleSubmit(values as LoginRequest);
            }}
          >
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.username.placeholder',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage id="pages.login.username.required" />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage id="pages.login.password.required" />
                  ),
                },
              ]}
            />
          </LoginForm>
        </div>
      </div>
    </div>
  );
};

export default Login;
