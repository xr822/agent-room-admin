import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import {
  DEFECT_ASSIGNEE_OPTIONS,
  DEFECT_FIXED,
  DEFECT_PRIORITY_OPTIONS,
  DEFECT_PROBABILITY_OPTIONS,
  DEFECT_SEVERITY_OPTIONS,
  defaultBugForm,
  filterPersonOption,
} from '../data/defect';
import type { BugFormValues } from '../types/feedback';

export interface CreateDefectModalProps {
  open: boolean;
  title?: string;
  initialValues?: Partial<BugFormValues>;
  /** 执行流入口要求经办人必填 */
  requireAssignee?: boolean;
  onCancel: () => void;
  onSubmit?: (values: BugFormValues) => void;
}

export function CreateDefectModal({
  open,
  title = '提缺陷',
  initialValues,
  requireAssignee = true,
  onCancel,
  onSubmit,
}: CreateDefectModalProps) {
  const [form, setForm] = useState<BugFormValues>(defaultBugForm());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...defaultBugForm(),
      ...initialValues,
      platform: DEFECT_FIXED.platform,
      discoverStage: DEFECT_FIXED.discoverStage,
      discoverHow: DEFECT_FIXED.discoverHow,
      bugType: DEFECT_FIXED.bugType,
    });
    // 仅在打开时用初始值灌入，避免父组件每次渲染重置表单
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const patch = (partial: Partial<BugFormValues>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleOk = async () => {
    if (!form.title.trim()) {
      message.warning('请填写缺陷名称');
      return;
    }
    if (!form.priority || !form.severity || !form.probability) {
      message.warning('请选择优先级、严重程度、出现概率');
      return;
    }
    if (!form.reproduceSteps.trim()) {
      message.warning('请填写重现步骤');
      return;
    }
    if (requireAssignee && !form.assignee) {
      message.warning('请选择经办人');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitting(false);
    onSubmit?.(form);
    message.success('缺陷已创建（演示）');
    onCancel();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      width={640}
      destroyOnHidden
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            className="btn-purple"
            loading={submitting}
            onClick={() => void handleOk()}
          >
            确定
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" className="defect-modal-form">
        <Form.Item
          label="经办人"
          required={requireAssignee}
          extra="输入姓名、邮箱或工号关键字"
        >
          <Select
            showSearch
            allowClear
            placeholder="输入姓名、邮箱或工号关键字"
            value={form.assignee || undefined}
            options={[...DEFECT_ASSIGNEE_OPTIONS]}
            filterOption={filterPersonOption}
            onChange={(assignee) => patch({ assignee: assignee ?? '' })}
          />
        </Form.Item>

        <Form.Item label="缺陷名称" required>
          <Input
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </Form.Item>

        <Space wrap size={12} style={{ width: '100%' }}>
          <Form.Item label="Bug 平台">
            <Input value={form.platform} disabled style={{ width: 140 }} />
          </Form.Item>
          <Form.Item label="Bug 发现阶段">
            <Input value={form.discoverStage} disabled style={{ width: 140 }} />
          </Form.Item>
          <Form.Item label="Bug 如何发现">
            <Input value={form.discoverHow} disabled style={{ width: 140 }} />
          </Form.Item>
          <Form.Item label="Bug 类型">
            <Input value={form.bugType} disabled style={{ width: 140 }} />
          </Form.Item>
        </Space>

        <Space wrap size={12}>
          <Form.Item label="优先级" required>
            <Select
              value={form.priority}
              style={{ width: 140 }}
              options={DEFECT_PRIORITY_OPTIONS.map((v) => ({
                value: v,
                label: v,
              }))}
              onChange={(priority) => patch({ priority })}
            />
          </Form.Item>
          <Form.Item label="严重程度" required>
            <Select
              value={form.severity}
              style={{ width: 140 }}
              options={DEFECT_SEVERITY_OPTIONS.map((v) => ({
                value: v,
                label: v,
              }))}
              onChange={(severity) => patch({ severity })}
            />
          </Form.Item>
          <Form.Item label="出现概率" required>
            <Select
              value={form.probability}
              style={{ width: 140 }}
              options={DEFECT_PROBABILITY_OPTIONS.map((v) => ({
                value: v,
                label: v,
              }))}
              onChange={(probability) => patch({ probability })}
            />
          </Form.Item>
        </Space>

        <Form.Item label="重现步骤" required>
          <Input.TextArea
            rows={5}
            value={form.reproduceSteps}
            onChange={(e) => patch({ reproduceSteps: e.target.value })}
          />
        </Form.Item>

        <Form.Item label="备注">
          <Input.TextArea
            rows={4}
            value={form.remark}
            placeholder="可选"
            onChange={(e) => patch({ remark: e.target.value })}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
