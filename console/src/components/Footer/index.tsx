import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="Powered by Kratos"
      links={[
        {
          key: 'kratos',
          title: 'Kratos',
          href: 'https://go-kratos.dev',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/go-kratos/kratos-admin',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
