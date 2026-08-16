/**
 * loading 占位
 * 解决首次加载时白屏的问题
 */
(function () {
  const _root = document.querySelector('#root');
  if (_root && _root.innerHTML === '') {
    _root.innerHTML = `
      <style>
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        .page-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 362px;
          /* 与 config/theme.ts 的 colorBgLayout 保持一致，
             避免首屏到应用挂载之间闪一下白。 */
          background-color: #fdfdfd;
          font-family:
            Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
            'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
        }

        .page-loading-logo {
          width: 48px;
          height: 48px;
        }

        .page-loading-title {
          margin-top: 20px;
          font-size: 14px;
          color: #505456;
        }
      </style>

      <div class="page-loading">
        <!-- 内联而非引用 public/logo.svg：这段占位的存在就是为了消除白屏，
             再等一次网络请求会自相矛盾。改 logo 时两处都要动。 -->
        <svg class="page-loading-logo" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" rx="44" fill="#7624F4"/>
          <g fill="#FFFFFF">
            <rect x="52" y="46" width="26" height="108" rx="6"/>
            <path d="M132 46h30l-58 54 58 54h-32l-52-50v-8z"/>
          </g>
        </svg>
        <div class="page-loading-title">正在加载</div>
      </div>
    `;
  }
})();
