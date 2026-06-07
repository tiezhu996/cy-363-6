import { useState, useEffect } from "react";
import { Table, Tag, Button, Modal, Form, Select, DatePicker, message, Space, Tooltip } from "antd";
import { EditOutlined, ReloadOutlined, UserOutlined, FlagOutlined, CalendarOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import type { OperationRecord } from "../types";
import { updateOperation, fetchOperations } from "../api/client";

const { Option } = Select;

interface OperationsTableProps {
  records: OperationRecord[];
  onRecordsUpdate?: (records: OperationRecord[]) => void;
}

const STATUS_OPTIONS = ["已上线", "排期中", "巡检中", "优化中", "可导出", "已完成", "待处理", "进行中"];
const PRIORITY_OPTIONS = ["高", "中", "低"];
const OWNER_OPTIONS = ["运营组", "管理员", "服务台", "财务组", "审核组", "技术组", "市场组"];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "高":
      return "red";
    case "中":
      return "orange";
    case "低":
      return "green";
    default:
      return "default";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "已上线":
    case "已完成":
      return "success";
    case "排期中":
    case "进行中":
      return "processing";
    case "巡检中":
    case "优化中":
      return "warning";
    case "可导出":
      return "cyan";
    case "待处理":
      return "error";
    default:
      return "default";
  }
};

const isOverdue = (deadline: string | null): boolean => {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  return deadlineDate < today;
};

export function OperationsTable({ records, onRecordsUpdate }: OperationsTableProps) {
  const [dataSource, setDataSource] = useState<OperationRecord[]>(records);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OperationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setDataSource(records);
  }, [records]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const newRecords = await fetchOperations();
      setDataSource(newRecords);
      onRecordsUpdate?.(newRecords);
      message.success("数据已刷新");
    } catch (error) {
      message.error("刷新失败: " + (error as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEdit = (record: OperationRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      id: record.id,
      owner_name: record.owner,
      status: record.status,
      priority: record.priority,
      deadline: record.deadline ? dayjs(record.deadline) : null,
    });
    setIsModalOpen(true);
  };

  const formatDate = (date: Dayjs | null): string | null => {
    if (!date) return null;
    const year = date.year();
    const month = String(date.month() + 1).padStart(2, "0");
    const day = String(date.date()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData = {
        id: values.id,
        owner_name: values.owner_name,
        status: values.status,
        priority: values.priority,
        deadline: formatDate(values.deadline as Dayjs | null),
      };

      const newRecords = await updateOperation(updateData);
      setDataSource(newRecords);
      onRecordsUpdate?.(newRecords);
      message.success("任务更新成功");
      setIsModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      if ((error as Error).message.includes("validate")) {
        return;
      }
      message.error("更新失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const columns: ColumnsType<OperationRecord> = [
    {
      title: "模块",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: string, record) => {
        const overdue = isOverdue(record.deadline);
        return (
          <span style={{ fontWeight: overdue ? 600 : 400, color: overdue ? "#ff4d4f" : "inherit" }}>
            {text}
          </span>
        );
      },
    },
    {
      title: "负责人",
      dataIndex: "owner",
      key: "owner",
      width: 120,
      render: (text: string) => (
        <Tag icon={<UserOutlined />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: string) => <Tag color={getStatusColor(value)}>{value}</Tag>,
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (value: string) => (
        <Tag icon={<FlagOutlined />} color={getPriorityColor(value)}>
          {value}
        </Tag>
      ),
    },
    {
      title: "截止日期",
      dataIndex: "deadline",
      key: "deadline",
      width: 140,
      render: (value: string | null, record) => {
        if (!value) return <span style={{ color: "#999" }}>-</span>;
        const overdue = isOverdue(value);
        return (
          <Space>
            <CalendarOutlined style={{ color: overdue ? "#ff4d4f" : "#52c41a" }} />
            <span style={{ color: overdue ? "#ff4d4f" : "inherit", fontWeight: overdue ? 600 : 400 }}>
              {value}
              {overdue && <span style={{ marginLeft: 4, color: "#ff4d4f" }}>(逾期)</span>}
            </span>
          </Space>
        );
      },
    },
    {
      title: "指标",
      dataIndex: "metric",
      key: "metric",
      width: 100,
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Tooltip title="编辑任务">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
        </Tooltip>
      ),
    },
  ];

  const rowClassName = (record: OperationRecord) => {
    return isOverdue(record.deadline) ? "overdue-row" : "";
  };

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          刷新数据
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey="key"
        rowClassName={rowClassName}
        scroll={{ x: 900 }}
      />
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>编辑任务 - {editingRecord?.name}</span>
          </Space>
        }
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="id" hidden>
            <input type="hidden" />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                <UserOutlined />
                <span>改派负责人</span>
              </Space>
            }
            name="owner_name"
            rules={[{ required: true, message: "请选择负责人" }]}
          >
            <Select placeholder="请选择负责人">
              {OWNER_OPTIONS.map((owner) => (
                <Option key={owner} value={owner}>
                  {owner}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <Space>
                <FlagOutlined />
                <span>切换状态</span>
              </Space>
            }
            name="status"
            rules={[{ required: true, message: "请选择状态" }]}
          >
            <Select placeholder="请选择状态">
              {STATUS_OPTIONS.map((status) => (
                <Option key={status} value={status}>
                  <Tag color={getStatusColor(status)}>{status}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <Space>
                <FlagOutlined />
                <span>设置优先级</span>
              </Space>
            }
            name="priority"
            rules={[{ required: true, message: "请选择优先级" }]}
          >
            <Select placeholder="请选择优先级">
              {PRIORITY_OPTIONS.map((priority) => (
                <Option key={priority} value={priority}>
                  <Tag color={getPriorityColor(priority)}>{priority}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <Space>
                <CalendarOutlined />
                <span>设置截止日期</span>
              </Space>
            }
            name="deadline"
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" placeholder="请选择截止日期" allowClear />
          </Form.Item>
        </Form>
      </Modal>
      <style>{`
        .overdue-row > td {
          background-color: #fff1f0 !important;
        }
        .overdue-row:hover > td {
          background-color: #ffccc7 !important;
        }
      `}</style>
    </>
  );
}
