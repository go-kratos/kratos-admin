import { type Admin, type AdminSet, services } from '@/services';
import { DataTable } from '@/components';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { FormattedMessage, Link, useRequest } from '@umijs/max';
import { Card, Col, Row, Statistic, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { adminStatusColumn } from './admins/columns';

/**
 * ListAdmins 只返回一页数据加一个 nextPageToken，没有总数字段。所以这里拉一个
 * 足够大的窗口，所有统计都从这一批算出来，再用 nextPageToken 判断这批是否覆盖了
 * 全表：覆盖不到时数字渲染成 "N+"，页面不去暗示一个接口给不出的语义。
 */
const STATS_WINDOW = 100;

const RECENT_DAYS = 7;

const Overview: React.FC = () => {
  const { token } = theme.useToken();

  // umi 的 useRequest 默认按 `{ data }` 形状解包响应，而 ListAdmins 直接返回
  // AdminSet，所以用 formatResult 原样透传。
  const { data, loading, error } = useRequest(
    () =>
      services.admin.ListAdmins({
        pageSize: STATS_WINDOW,
        pageToken: undefined,
        filter: undefined,
        orderBy: 'created_at desc',
      }),
    { formatResult: (res: AdminSet) => res },
  );

  const admins = data?.admins ?? [];
  // 非空说明窗口被填满且后面还有记录，这批只是最近的一部分。
  const capped = Boolean(data?.nextPageToken);

  const activeCount = admins.filter((a) => a.status === 'ACTIVE').length;
  const inactiveCount = admins.filter((a) => a.status === 'INACTIVE').length;

  const since = dayjs().subtract(RECENT_DAYS, 'day');
  const recentCount = admins.filter(
    (a) => a.createdAt && dayjs(a.createdAt).isAfter(since),
  ).length;
  // 窗口按 created_at desc 排序，所以只要窗口里最老的一条早于 7 天前，整个 7 天
  // 区间就完整落在窗口内、计数精确；否则区间被窗口截断了。
  const oldest = admins[admins.length - 1]?.createdAt;
  const recentExact =
    !capped || (oldest ? dayjs(oldest).isBefore(since) : true);

  /**
   * 打满窗口时数字只是下界，用 "+" 标出来。请求失败时显示 "-" —— 此时 admins 是
   * 空数组，渲染成 0 会把「加载失败」说成「一条都没有」。
   */
  const approx = (value: number, exact = !capped) => {
    if (error) return '-';
    return exact ? `${value}` : `${value}+`;
  };

  const columns: ProColumns<Admin>[] = [
    {
      title: <FormattedMessage id="pages.searchTable.title.name" />,
      dataIndex: 'name',
    },
    {
      title: <FormattedMessage id="pages.searchTable.title.email" />,
      dataIndex: 'email',
    },
    adminStatusColumn,
    {
      title: <FormattedMessage id="pages.searchTable.title.createdAt" />,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
  ];

  const stats: {
    key: string;
    id: string;
    value: string;
    values?: Record<string, number>;
    color?: string;
  }[] = [
    {
      key: 'total',
      id: 'pages.overview.stat.total',
      value: approx(admins.length),
    },
    {
      key: 'active',
      id: 'pages.overview.stat.active',
      value: approx(activeCount),
      color: token.colorSuccess,
    },
    {
      key: 'inactive',
      id: 'pages.overview.stat.inactive',
      value: approx(inactiveCount),
    },
    {
      key: 'recent',
      id: 'pages.overview.stat.recent',
      value: approx(recentCount, recentExact),
      values: { days: RECENT_DAYS },
    },
  ];

  return (
    // 头部不重复当前用户的信息：side 布局把头像、用户名放在侧栏底部了。
    <PageContainer title={<FormattedMessage id="pages.overview.title" />}>
      <Row gutter={[16, 16]}>
        {stats.map((stat) => (
          <Col key={stat.key} xs={24} sm={12} xl={6}>
            <Card loading={loading}>
              <Statistic
                title={<FormattedMessage id={stat.id} values={stat.values} />}
                value={stat.value}
                styles={
                  stat.color ? { content: { color: stat.color } } : undefined
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 12, marginBottom: 16, fontSize: 12 }}
      >
        {capped ? (
          <FormattedMessage
            id="pages.overview.scope.capped"
            values={{ window: STATS_WINDOW }}
          />
        ) : (
          <FormattedMessage
            id="pages.overview.scope.exact"
            values={{ total: admins.length }}
          />
        )}
      </Typography.Paragraph>

      <DataTable<Admin>
        headerTitle={<FormattedMessage id="pages.overview.recent.title" />}
        columns={columns}
        dataSource={admins.slice(0, 5)}
        loading={loading}
        // 这里只是概览里的一小段摘要，连刷新按钮都不需要。
        options={false}
        toolBarRender={() => [
          <Link key="all" to="/admins">
            <FormattedMessage id="pages.overview.recent.viewAll" />
          </Link>,
        ]}
      />
    </PageContainer>
  );
};

export default Overview;
