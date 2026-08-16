import { SearchOutlined } from '@ant-design/icons';
import type { ActionType, ProTableProps } from '@ant-design/pro-components';
import { FooterToolbar, ProTable } from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Input, message, Popconfirm, Typography } from 'antd';
import type React from 'react';
import { useCallback, useImperativeHandle, useRef, useState } from 'react';

/** 列表接口的返回值。 */
export type DataTableResult<T> = {
  data: T[];
  success: boolean;
  /** 还有记录没取回来时置 true，footer 会改成「仅显示最近 N 条」。 */
  hasMore?: boolean;
};

export type DataTableRef<T> = {
  /** 重新拉取列表。表单提交成功后调它。 */
  reload: () => void;
  /** 删除若干行，逐行串行执行。行内的删除按钮用它。 */
  remove: (rows: T[]) => void;
};

type OwnProps<T, P> = {
  ref?: React.Ref<DataTableRef<T>>;
  /**
   * 列表接口。搜索词在 `params.keyword` 里，由本组件维护，页面不必自己管 state。
   */
  request?: (params: P & { keyword?: string }) => Promise<DataTableResult<T>>;
  /** 传了就在工具栏渲染搜索框。 */
  searchPlaceholder?: string;
  /**
   * 怎么删掉一行。传了就渲染批量删除工具栏和行选择；串行删除、失败上报、
   * 列表与选中态的重置都在内部处理。
   */
  onDelete?: (row: T) => Promise<unknown>;
  /** 一次取回的上限，只用于 footer 的提示文案。 */
  pageSize?: number;
};

type DataTableProps<T, P> = Omit<
  ProTableProps<T, P & { keyword?: string }>,
  'request' | 'rowSelection' | 'footer' | 'toolbar' | 'actionRef' | 'ref'
> &
  OwnProps<T, P>;

/**
 * 列表页的表格。除了统一样式约定，它还封掉了 CRUD 列表页每次都要重写的那几段：
 * 搜索框、批量删除、条数提示。这几段各自带一个容易抄错的细节，注释里逐条标了。
 *
 * 只传 columns + dataSource 时它就退化成一个普通表格（概览页那样）。
 */
function DataTable<
  // 约束与 ProTable 自身一致。
  T extends Record<string, any>,
  P extends Record<string, unknown> = Record<string, unknown>,
>(props: DataTableProps<T, P>) {
  const { ref, request, searchPlaceholder, onDelete, pageSize, ...rest } = props;

  const actionRef = useRef<ActionType | null>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [footerInfo, setFooterInfo] = useState({ total: 0, hasMore: false });
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();

  const handleDelete = useCallback(
    async (rows: T[]) => {
      if (!onDelete) return;
      setDeleting(true);
      try {
        for (const row of rows) {
          await onDelete(row);
        }
        messageApi.success(
          intl.formatMessage({ id: 'pages.searchTable.deleteSuccess' }),
        );
      } catch {
        // 失败已由 requestErrorConfig 全局上报。这里不 return：部分成功时列表和
        // 选中态同样需要重置，否则再次点击会对着已删除的行重试并永久失败。
      } finally {
        setSelectedRows([]);
        actionRef.current?.reloadAndRest?.();
        setDeleting(false);
      }
    },
    [intl, messageApi, onDelete],
  );

  useImperativeHandle(ref, () => ({
    reload: () => actionRef.current?.reload(),
    remove: (rows: T[]) => {
      handleDelete(rows);
    },
  }));

  const handleRequest = useCallback(
    async (params: P & { keyword?: string }) => {
      if (!request) return { data: [], success: true };
      const res = await request(params);
      setFooterInfo({
        total: res.data.length,
        hasMore: Boolean(res.hasMore),
      });
      return res;
    },
    [request],
  );

  const deleteConfirm = {
    title: intl.formatMessage({ id: 'pages.searchTable.deleteConfirm.title' }),
    description: intl.formatMessage({
      id: 'pages.searchTable.deleteConfirm.description',
    }),
  };

  return (
    <>
      {contextHolder}
      <ProTable<T, P & { keyword?: string }>
        actionRef={actionRef}
        // 所有资源的主键都叫 id（proto 里是服务端生成的 UUID）。
        rowKey="id"
        // 不用展开式查询表单：字段少的时候，工具栏里一个搜索框更快也更省版面。
        search={false}
        // 内容区与卡片都是浅色，没有边框就看不出表格的边界。
        cardBordered
        // 后端是游标分页（nextPageToken），和 ProTable 的页码模型对不上，渲染分页器
        // 只会得到一个点不动的控件。条数与范围放在 footer 里说明。
        pagination={false}
        // 密度切换会打乱固定的行节奏；列设置对字段不多的表格是多余入口。
        options={{
          density: false,
          fullScreen: false,
          reload: true,
          setting: false,
        }}
        // 选中提示用下面的 FooterToolbar 渲染，不用它顶部那条浮层。
        tableAlertRender={false}
        {...(request ? { request: handleRequest } : {})}
        {...(searchPlaceholder
          ? {
              toolbar: {
                // 传 React 元素而非配置对象：后者会渲染成 Input.Search，尾部多一个
                // 独立的放大镜按钮，在只有一个筛选条件的页面上显得突兀。
                search: (
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder={searchPlaceholder}
                    allowClear
                    style={{ width: 280 }}
                    defaultValue={keyword}
                    onPressEnter={(e) =>
                      setKeyword(e.currentTarget.value.trim())
                    }
                    onChange={(e) => {
                      // 只处理清空：allowClear 的叉号走这里，不然清完还留着旧结果。
                      if (!e.target.value) setKeyword('');
                    }}
                  />
                ),
              },
            }
          : {})}
        {...(onDelete
          ? {
              rowSelection: {
                // 勾选列的宽度只认这里：antd 把它写进 <colgroup>，CSS 上的 width
                // 改不动。默认 32px 装不下 global.less 给首列的 24px 起始内边距，
                // checkbox 会溢出到名称列。
                columnWidth: 60,
                onChange: (_: React.Key[], rows: T[]) => setSelectedRows(rows),
              },
            }
          : {})}
        {...(request
          ? {
              // 固定给出条数，取满时说明还有更多 —— 不谎报一个接口给不出的总数。
              footer: () => (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {footerInfo.hasMore
                    ? intl.formatMessage(
                        { id: 'pages.searchTable.hasMore' },
                        { count: pageSize },
                      )
                    : intl.formatMessage(
                        { id: 'pages.searchTable.totalCount' },
                        { count: footerInfo.total },
                      )}
                </Typography.Text>
              ),
            }
          : {})}
        {...rest}
        // 必须排在 rest 之后：keyword 走 params 传给 request（ProTable 的
        // useFetchData 把 params 放进了依赖，值一变就自动重新请求）。若被调用方
        // 传入的 params 覆盖掉，搜索就会静默失效。
        params={{ ...rest.params, keyword } as P & { keyword?: string }}
      />
      {onDelete && selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" />{' '}
              <span style={{ fontWeight: 600 }}>{selectedRows.length}</span>{' '}
              <FormattedMessage id="pages.searchTable.item" />
            </div>
          }
        >
          <Popconfirm
            {...deleteConfirm}
            onConfirm={() => handleDelete(selectedRows)}
          >
            <Button loading={deleting}>
              <FormattedMessage id="pages.searchTable.batchDeletion" />
            </Button>
          </Popconfirm>
        </FooterToolbar>
      )}
    </>
  );
}

export default DataTable;
