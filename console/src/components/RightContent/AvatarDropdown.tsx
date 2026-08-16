import { services } from "@/services";
import { LogoutOutlined } from "@ant-design/icons";
import { history, useIntl, useModel } from "@umijs/max";
import type { MenuProps } from "antd";
import { Dropdown, Spin } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import { flushSync } from "react-dom";

export type GlobalHeaderRightProps = {
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel("@@initialState");
  const { currentUser } = initialState || {};
  // 不要用 antd 的 anticon 类：它带 vertical-align:-0.125em 和 line-height:0，
  // 那是给图标对齐文字基线用的，套在纯文本上会把用户名往下压半个字。
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      {currentUser?.name}
    </span>
  );
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: "flex",
      height: "48px",
      marginLeft: "auto",
      overflow: "hidden",
      alignItems: "center",
      padding: "0 8px",
      cursor: "pointer",
      borderRadius: token.borderRadius,
      "&:hover": {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  children,
}) => {
  const { styles } = useStyles();
  const intl = useIntl();
  const { initialState, setInitialState } = useModel("@@initialState");

  /** 退出登录，并把当前地址放进 redirect 以便登录后回到原处。 */
  const loginOut = async () => {
    await services.admin.Logout({});
    const { search, pathname } = window.location;
    const searchParams = new URLSearchParams({
      redirect: pathname + search,
    });
    history.replace({
      pathname: "/user/login",
      search: searchParams.toString(),
    });
  };

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      flushSync(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
    }
  };

  const loading = (
    <span className={styles.action}>
      <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
    </span>
  );

  if (!initialState?.currentUser?.name) {
    return loading;
  }

  return (
    <Dropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: [
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: intl.formatMessage({ id: "menu.account.logout" }),
          },
        ],
      }}
    >
      {children}
    </Dropdown>
  );
};
