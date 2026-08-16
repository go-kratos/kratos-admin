import { configUmiAlias, createConfig } from '@umijs/max/test.js';

export default async (): Promise<any> => {
  const config = await configUmiAlias({
    ...createConfig({
      target: 'browser',
    }),
  });
  return {
    ...config,
    testEnvironmentOptions: {
      ...(config?.testEnvironmentOptions || {}),
      url: 'http://localhost:8000',
    },
    setupFiles: [...(config.setupFiles || []), './tests/setupTests.jsx'],
    globals: {
      ...config.globals,
      localStorage: null,
      // @umijs/test 的 esbuild transformer 只吃 format/target/sourcemap，不读
      // tsconfig，所以 `jsx: "react-jsx"` 对测试无效，JSX 会被编译成 classic 的
      // React.createElement，未 import React 的组件在测试里就抛 ReferenceError。
      // 这个 key 是 transformer 留的透传口，配置项与 esbuild 一致。
      'jest-esbuild': { jsx: 'automatic' },
    },
  };
};
