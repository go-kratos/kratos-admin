import { TestBrowser } from '@@/testBrowser';
import { render } from '@testing-library/react';
import React from 'react';

// 这里只验证登录页能渲染出表单，不驱动登录流程：提交需要真实的 Kratos 服务，
// 断言一套 mock 契约反而会和后端悄悄漂移。
describe('Login Page', () => {
  it('should show login form', async () => {
    const historyRef = React.createRef<any>();
    const rootContainer = render(
      <TestBrowser
        historyRef={historyRef}
        location={{
          pathname: '/user/login',
        }}
      />,
    );

    // 标题是硬编码的，不随 locale 变化。
    await rootContainer.findAllByText('Kratos Admin');

    // 用 id 而非 placeholder 定位，这样改文案不会打破测试。
    const { baseElement } = rootContainer;
    expect(baseElement.querySelector('#username')).toBeTruthy();
    expect(baseElement.querySelector('#password')).toBeTruthy();
    // LoginForm 的提交按钮是 antd 的 type="primary"，DOM 上没有 type="submit"。
    expect(baseElement.querySelector('button.ant-btn-primary')).toBeTruthy();

    expect(rootContainer.asFragment()).toMatchSnapshot();

    rootContainer.unmount();
  });
});
