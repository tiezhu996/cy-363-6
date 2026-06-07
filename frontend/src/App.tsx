import { useEffect, useState, useCallback, useRef } from "react";
import { Button, ConfigProvider, Layout, Typography, theme, Badge, Space } from "antd";
import { ApiOutlined, SyncOutlined } from "@ant-design/icons";
import { fetchOverview, fetchOperations } from "./api/client";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse, OperationRecord } from "./types";
import { FeatureStrip } from "./components/FeatureStrip";
import { MetricGrid } from "./components/MetricGrid";
import { OperationsTable } from "./components/OperationsTable";

const { Header, Content } = Layout;

const POLL_INTERVAL = 5000;

export default function App() {
  const [overview, setOverview] = useState<OverviewResponse>(createFallbackOverview());
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [overviewData, operationsData] = await Promise.all([
        fetchOverview(),
        fetchOperations().catch(() => null),
      ]);

      const mergedData = operationsData
        ? { ...overviewData, records: operationsData }
        : overviewData;

      setOverview(mergedData);
      setNotice("后端服务已联通，当前展示实时接口数据。");
      setLastUpdateTime(new Date().toLocaleTimeString("zh-CN"));
    } catch {
      setNotice(REQUEST_MESSAGES.overviewFallback);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [loadData]);

  const handleRecordsUpdate = useCallback((records: OperationRecord[]) => {
    setOverview((prev) => ({ ...prev, records }));
    setLastUpdateTime(new Date().toLocaleTimeString("zh-CN"));
  }, []);

  useEffect(() => {
    loadData();

    pollTimerRef.current = setInterval(() => {
      loadData();
    }, POLL_INTERVAL);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [loadData]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: APP_THEME.accent,
          colorText: APP_THEME.ink,
          colorBgBase: APP_THEME.paper,
          borderRadius: 8,
        },
      }}
    >
      <Layout className="app-shell">
        <Header className="topbar">
          <div className="brand-block">
            <span className="brand-code">{APP_CODE}</span>
            <h1 className="brand-title">{APP_NAME}</h1>
          </div>
          <Space>
            {lastUpdateTime && (
              <Badge status="processing" text={`实时更新 · ${lastUpdateTime}`} />
            )}
            <Button
              icon={<SyncOutlined spin={isRefreshing} />}
              onClick={handleRefresh}
              loading={isRefreshing}
            >
              刷新
            </Button>
            <Button type="primary" icon={<ApiOutlined />} href={REQUEST_MESSAGES.healthPath}>API Health</Button>
          </Space>
        </Header>
        <Content className="workspace">
          <section className="lead-grid">
            <article className="hero-panel">
              <span className="pill">{notice}</span>
              <Typography.Title level={2}>{overview.appName}</Typography.Title>
              <p>{overview.description}</p>
            </article>
            <MetricGrid items={overview.kpis} />
          </section>
          <FeatureStrip items={overview.features} />
          <section className="work-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Typography.Title level={3} style={{ margin: 0 }}>运营任务流</Typography.Title>
              <Space size="small">
                <Badge status="processing" text="每5秒自动刷新" />
              </Space>
            </div>
            <OperationsTable records={overview.records} onRecordsUpdate={handleRecordsUpdate} />
          </section>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}
