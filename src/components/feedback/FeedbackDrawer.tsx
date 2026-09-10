import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Steps,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  autoBugTitle,
  autoReproduceSteps,
  buildExecutionFeedbackTasks,
  buildIoTasks,
  buildRoomLink,
  defaultBugForm,
} from '../../data/feedback';
import { GroupChatCard } from './GroupChatCard';
import {
  DEFECT_ASSIGNEE_OPTIONS,
  DEFECT_FIXED,
  DEFECT_PRIORITY_OPTIONS,
  DEFECT_PROBABILITY_OPTIONS,
  DEFECT_SEVERITY_OPTIONS,
  DEFAULT_REPORTER,
  PERSON_OPTIONS,
  filterPersonOption,
  personDisplayName,
} from '../../data/defect';
import type { RoomInfo } from '../../types';
import type {
  FeedbackExecutionTask,
  FeedbackFormState,
  FeedbackIoTask,
  HandleMethod,
  SubmitTargetResult,
} from '../../types/feedback';
import {
  FEEDBACK_TYPE_OPTIONS,
  FEEDBACK_TYPE_THEME,
  HANDLE_METHOD_OPTIONS,
  handleMethodLabel,
} from '../../types/feedback';
import { MediaGrid } from '../MediaThumb';

interface FeedbackDrawerProps {
  open: boolean;
  room: RoomInfo;
  onClose: () => void;
}

const emptyForm = (): FeedbackFormState => ({
  selectedIoIds: [],
  selectedExecIds: [],
  feedbackType: undefined,
  description: '',
  reporter: DEFAULT_REPORTER,
  methods: ['group'],
  bug: defaultBugForm(),
  requirement: { description: '', remark: '' },
});

function HoverClampText({ text, label }: { text: string; label: string }) {
  const content = text.trim() || '-';
  const long = content.length > 80 || content.includes('\n');

  if (!long) {
    return <div className="clamp-2">{content}</div>;
  }

  return (
    <Tooltip
      title={
        <div className="feedback-hover-full">
          <div className="feedback-hover-full-label">{label}</div>
          <div className="feedback-hover-full-body">{content}</div>
        </div>
      }
      placement="topLeft"
      mouseEnterDelay={0.25}
      styles={{ root: { maxWidth: 420 } }}
    >
      <div className="clamp-2 feedback-clamp-hover">{content}</div>
    </Tooltip>
  );
}

function IoCard({
  task,
  checked,
  onChange,
}: {
  task: FeedbackIoTask;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const replyCount = task.agentReplies.length;

  return (
    <label className={`feedback-select-card ${checked ? 'is-checked' : ''}`}>
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="feedback-select-body">
        <div className="feedback-select-top">
          <Space size={8} wrap>
            <Tag color="blue">输入输出任务</Tag>
            {replyCount > 1 && <Tag color="geekblue">Agent 回复 ×{replyCount}</Tag>}
          </Space>
          <Typography.Text type="secondary">{task.time}</Typography.Text>
        </div>
        <Typography.Text code>{task.taskId}</Typography.Text>

        <div className="feedback-io-user">
          <Typography.Text type="secondary">用户输入</Typography.Text>
          <HoverClampText text={task.userInput || '-'} label="完整 Prompt" />
          <MediaGrid
            assets={task.inputMedia}
            title={
              task.inputMedia.length
                ? `输入媒体 (${task.inputMedia.length})`
                : undefined
            }
            size="sm"
          />
        </div>

        <div className="feedback-io-replies">
          <Typography.Text type="secondary">
            Agent 回复{replyCount > 0 ? `（${replyCount}）` : ''}
          </Typography.Text>
          {replyCount === 0 ? (
            <div className="clamp-2">-</div>
          ) : (
            <div className="feedback-reply-list">
              {task.agentReplies.map((reply, index) => (
                <div key={reply.id} className="feedback-reply-item">
                  <div className="feedback-reply-meta">
                    <span>回复 {index + 1}</span>
                    {reply.contentType && <Tag>{reply.contentType}</Tag>}
                    {reply.agent && <Tag color="green">Agent: {reply.agent}</Tag>}
                    {reply.status && <Tag>status: {reply.status}</Tag>}
                    <Typography.Text type="secondary">{reply.time}</Typography.Text>
                  </div>
                  <HoverClampText text={reply.content || '-'} label={`回复 ${index + 1}`} />
                  <MediaGrid
                    assets={reply.media}
                    title={
                      reply.media.length
                        ? `输出媒体 (${reply.media.length})`
                        : undefined
                    }
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <Space size={8} wrap>
          <Tag color="cyan">
            输入 {task.inputMedia.length} · 输出媒体 {task.outputMedia.length} · 回复{' '}
            {replyCount}
          </Tag>
          <Typography.Text type="secondary">
            一次用户输入与其全部 Agent 回复绑定选择
          </Typography.Text>
        </Space>
      </div>
    </label>
  );
}

function ExecCard({
  task,
  checked,
  onChange,
}: {
  task: FeedbackExecutionTask;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const statusTag =
    task.status === 'failed' ? (
      <Tag color="error">失败</Tag>
    ) : task.status === 'partial' ? (
      <Tag color="warning">部分取消</Tag>
    ) : (
      <Tag color="success">成功</Tag>
    );

  return (
    <label className={`feedback-select-card ${checked ? 'is-checked' : ''}`}>
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="feedback-select-body">
        <div className="feedback-select-top">
          <Tag color="purple">服务端执行任务</Tag>
          {statusTag}
        </div>
        <Typography.Text code>{task.taskId}</Typography.Text>
        <Space size={8} wrap>
          <Tag>{task.stepCount} 步</Tag>
          {task.agents.map((a) => (
            <Tag key={a}>{a}</Tag>
          ))}
        </Space>
        {task.errorSummary && (
          <div className="feedback-error-line">{task.errorSummary}</div>
        )}
        <MediaGrid
          assets={task.media}
          title={task.media.length ? `执行产出 (${task.media.length})` : undefined}
          size="sm"
        />
      </div>
    </label>
  );
}

export function FeedbackDrawer({ open, room, onClose }: FeedbackDrawerProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FeedbackFormState>(() => emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SubmitTargetResult[] | null>(null);

  const ioTasks = useMemo(() => buildIoTasks(), []);
  const execTasks = useMemo(() => buildExecutionFeedbackTasks(), []);
  const roomLink = buildRoomLink(room.roomId);

  const selectedIo = ioTasks.filter((t) => form.selectedIoIds.includes(t.id));
  const selectedExec = execTasks.filter((t) =>
    form.selectedExecIds.includes(t.id),
  );
  const selectedCount = selectedIo.length + selectedExec.length;

  const bulkMode = useMemo(() => {
    const allIo = ioTasks.length > 0 && selectedIo.length === ioTasks.length;
    const allExec =
      execTasks.length > 0 && selectedExec.length === execTasks.length;
    const noneIo = selectedIo.length === 0;
    const noneExec = selectedExec.length === 0;
    if (noneIo && noneExec) return 'none';
    if (allIo && allExec) return 'all';
    if (allIo && noneExec) return 'io';
    if (noneIo && allExec) return 'exec';
    return 'custom';
  }, [ioTasks.length, execTasks.length, selectedIo.length, selectedExec.length]);

  const applyBulkMode = (mode: string | number) => {
    if (mode === 'all') {
      patch({
        selectedIoIds: ioTasks.map((t) => t.id),
        selectedExecIds: execTasks.map((t) => t.id),
      });
      return;
    }
    if (mode === 'io') {
      patch({
        selectedIoIds: ioTasks.map((t) => t.id),
        selectedExecIds: [],
      });
      return;
    }
    if (mode === 'exec') {
      patch({
        selectedIoIds: [],
        selectedExecIds: execTasks.map((t) => t.id),
      });
    }
  };

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setForm(emptyForm());
    setResults(null);
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    if (form.feedbackType !== 'requirement') return;
    setForm((prev) => {
      if (prev.methods.includes('requirement_table')) return prev;
      return {
        ...prev,
        methods: [...prev.methods, 'requirement_table'],
        requirement: {
          ...prev.requirement,
          description: prev.requirement.description || prev.description,
        },
      };
    });
  }, [form.feedbackType]);

  const patch = (partial: Partial<FeedbackFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const goNextFromSelect = () => {
    if (selectedCount < 1) {
      message.warning('请至少选择 1 条反馈内容');
      return;
    }
    setStep(1);
  };

  const goNextFromInfo = () => {
    if (!form.feedbackType) {
      message.warning('请选择反馈类型');
      return;
    }
    if (!form.description.trim()) {
      message.warning('请填写问题描述');
      return;
    }
    if (form.description.trim().length < 10) {
      message.warning('问题描述过短，请补充到至少 10 个字，便于群内定位问题');
      return;
    }
    if (!form.reporter.trim()) {
      message.warning('请选择反馈人');
      return;
    }
    setForm((prev) => ({
      ...prev,
      bug: {
        ...prev.bug,
        // 进入处理方式步时按当前类型/描述/所选 Case 重算，避免返回修改后仍用旧自动填充
        title: autoBugTitle(prev.feedbackType, prev.description),
        reproduceSteps: autoReproduceSteps({
          roomId: room.roomId,
          uid: room.uid,
          roomLink,
          ioTasks: selectedIo,
          execTasks: selectedExec,
          description: prev.description,
        }),
      },
      requirement: {
        ...prev.requirement,
        description: prev.requirement.description || prev.description,
      },
    }));
    setStep(2);
  };

  const validateMethods = () => {
    if (form.methods.length < 1) {
      message.warning('请至少选择 1 项处理方式');
      return false;
    }
    if (form.methods.includes('bug')) {
      if (!form.bug.assignee) {
        message.warning('请选择经办人');
        return false;
      }
      const required: Array<keyof typeof form.bug> = [
        'title',
        'priority',
        'severity',
        'probability',
        'reproduceSteps',
      ];
      const missing = required.find((k) => !String(form.bug[k] ?? '').trim());
      if (missing) {
        message.warning('请完整填写缺陷必填字段');
        return false;
      }
    }
    if (form.methods.includes('requirement_table') && !form.requirement.description.trim()) {
      message.warning('请填写需求/优化描述');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validateMethods()) return;
    setSubmitting(true);
    setStep(3);

    // 各目标独立执行（演示：同步表偶发失败）
    const nextResults: SubmitTargetResult[] = [];
    for (const method of form.methods) {
      await new Promise((r) => setTimeout(r, 350));
      if (method === 'requirement_table' && Math.random() < 0.35) {
        nextResults.push({
          method,
          status: 'failed',
          message: '写入需求优化表失败（演示）',
        });
      } else {
        nextResults.push({
          method,
          status: 'success',
          message:
            method === 'group'
              ? '已上报到群'
              : method === 'bug'
                ? '已创建缺陷'
                : '已同步需求优化表',
        });
      }
      setResults([...nextResults]);
    }
    setSubmitting(false);
  };

  const retryFailed = async (method: HandleMethod) => {
    setResults((prev) =>
      (prev ?? []).map((r) =>
        r.method === method
          ? { ...r, status: 'pending', message: '重试中…' }
          : r,
      ),
    );
    await new Promise((r) => setTimeout(r, 500));
    setResults((prev) =>
      (prev ?? []).map((r) =>
        r.method === method
          ? {
              ...r,
              status: 'success',
              message:
                method === 'group'
                  ? '已上报到群'
                  : method === 'bug'
                    ? '已创建缺陷'
                    : '已同步需求优化表',
            }
          : r,
      ),
    );
    message.success(`${handleMethodLabel(method)} 重试成功`);
  };

  const toggleMethod = (method: HandleMethod, checked: boolean) => {
    if (
      method === 'requirement_table' &&
      !checked &&
      form.feedbackType === 'requirement'
    ) {
      message.info('反馈类型为「需求优化」时建议保留同步需求优化表');
      // 文档：建议默认保留；一期允许取消但给出提示
    }
    setForm((prev) => ({
      ...prev,
      methods: checked
        ? [...new Set([...prev.methods, method])]
        : prev.methods.filter((m) => m !== method),
    }));
  };

  const footer = (
    <div className="feedback-footer">
      <Button onClick={onClose}>关闭</Button>
      <div className="feedback-footer-actions">
        {step > 0 && step < 3 && (
          <Button onClick={() => setStep((s) => s - 1)}>上一步</Button>
        )}
        {step === 0 && (
          <Button type="primary" onClick={goNextFromSelect}>
            下一步
          </Button>
        )}
        {step === 1 && (
          <Button type="primary" onClick={goNextFromInfo}>
            下一步
          </Button>
        )}
        {step === 2 && (
          <Button type="primary" loading={submitting} onClick={() => void submit()}>
            提交反馈
          </Button>
        )}
        {step === 3 && (
          <Button type="primary" onClick={onClose}>
            完成
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Drawer
      title="用户 Case 反馈"
      width={720}
      open={open}
      onClose={onClose}
      destroyOnHidden
      footer={footer}
      className="feedback-drawer"
    >
      <Steps
        size="small"
        current={step}
        className="feedback-steps"
        items={[
          { title: '选择内容' },
          { title: '填写信息' },
          { title: '处理方式' },
          { title: '提交结果' },
        ]}
      />

      <Alert
        type="info"
        showIcon
        className="feedback-room-alert"
        title={
          <Space wrap size={12}>
            <span>UID：{room.uid}</span>
            <span>Room：{room.roomId.slice(0, 16)}…</span>
            <Typography.Link href={roomLink} target="_blank">
              Room 链接
            </Typography.Link>
            <span>反馈时间将自动记录</span>
          </Space>
        }
      />

      {step === 0 && (
        <div className="feedback-step">
          <Typography.Paragraph type="secondary">
            输入输出任务与服务端执行任务为平级对象，可独立或组合多选；至少选择 1
            条后进入下一步。一次用户输入与其全部 Agent 回复（可能多条）绑定为一个整体。
          </Typography.Paragraph>

          <div className="feedback-bulk-bar">
            <div className="feedback-bulk-left">
              <span className="feedback-bulk-label">快捷选择</span>
              <Space wrap size={8}>
                <Button size="small" onClick={() => applyBulkMode('all')}>
                  全部
                </Button>
                <Button size="small" onClick={() => applyBulkMode('io')}>
                  仅输入输出
                </Button>
                <Button size="small" onClick={() => applyBulkMode('exec')}>
                  仅执行流程
                </Button>
              </Space>
            </div>
            <div className="feedback-bulk-right">
              <span className="feedback-bulk-count">
                已选 <strong>{selectedCount}</strong> 项
                <span className="feedback-bulk-count-split">
                  输入输出 {selectedIo.length} · 执行 {selectedExec.length}
                </span>
              </span>
              <Typography.Link
                className="feedback-bulk-clear"
                disabled={selectedCount === 0}
                onClick={() =>
                  patch({
                    selectedIoIds: [],
                    selectedExecIds: [],
                  })
                }
              >
                清空
              </Typography.Link>
            </div>
          </div>

          <div className="feedback-section-title">
            输入输出任务
            <Typography.Text type="secondary">
              已选 {selectedIo.length}/{ioTasks.length}
            </Typography.Text>
          </div>
          <div className="feedback-select-list">
            {ioTasks.map((task) => (
              <IoCard
                key={task.id}
                task={task}
                checked={form.selectedIoIds.includes(task.id)}
                onChange={(checked) =>
                  patch({
                    selectedIoIds: checked
                      ? [...form.selectedIoIds, task.id]
                      : form.selectedIoIds.filter((id) => id !== task.id),
                  })
                }
              />
            ))}
          </div>

          <div className="feedback-section-title">
            服务端执行任务
            <Typography.Text type="secondary">
              已选 {selectedExec.length}/{execTasks.length}（不随输入输出自动勾选）
            </Typography.Text>
          </div>
          <div className="feedback-select-list">
            {execTasks.map((task) => (
              <ExecCard
                key={task.id}
                task={task}
                checked={form.selectedExecIds.includes(task.id)}
                onChange={(checked) =>
                  patch({
                    selectedExecIds: checked
                      ? [...form.selectedExecIds, task.id]
                      : form.selectedExecIds.filter((id) => id !== task.id),
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="feedback-step">
          <Form layout="vertical">
            <Form.Item label="反馈类型" required>
              <div className="feedback-type-grid">
                {FEEDBACK_TYPE_OPTIONS.map((opt) => {
                  const theme = FEEDBACK_TYPE_THEME[opt.value];
                  const active = form.feedbackType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`feedback-type-card ${active ? 'is-active' : ''}`}
                      style={
                        {
                          '--type-accent': theme.accent,
                          '--type-soft': theme.soft,
                          '--type-text': theme.text,
                        } as CSSProperties
                      }
                      onClick={() => patch({ feedbackType: opt.value })}
                    >
                      <span className="feedback-type-card-dot" />
                      <span className="feedback-type-card-main">
                        <span className="feedback-type-card-title">{opt.label}</span>
                        <span className="feedback-type-card-desc">{opt.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Form.Item>

            <Form.Item label="问题描述" required>
              <Input.TextArea
                rows={5}
                value={form.description}
                placeholder="补充后台字段无法表达的产品判断，例如：用户连续两次 Recreate，人物一致性正常，但主要武打动作始终没有复刻出来。"
                onChange={(e) => patch({ description: e.target.value })}
              />
            </Form.Item>

            <Form.Item
              label="反馈人"
              required
              extra="输入姓名、邮箱或工号关键字"
            >
              <Select
                showSearch
                allowClear
                placeholder="输入姓名、邮箱或工号关键字"
                value={form.reporter || undefined}
                options={[...PERSON_OPTIONS]}
                filterOption={filterPersonOption}
                onChange={(reporter) => patch({ reporter: reporter ?? '' })}
              />
            </Form.Item>

            <Alert
              type="success"
              showIcon
              title={`已选 ${selectedCount} 条反馈内容（${selectedIo.length} 输入输出 · ${selectedExec.length} 执行任务），Room / Task / 输入输出将自动带出，无需重复手填。`}
            />
          </Form>
        </div>
      )}

      {step === 2 && (
        <div className="feedback-step">
          <Form layout="vertical">
            <Form.Item label="处理方式" required>
              <Space orientation="vertical" size={12} className="feedback-method-group">
                {HANDLE_METHOD_OPTIONS.map((opt) => (
                  <Checkbox
                    key={opt.value}
                    checked={form.methods.includes(opt.value)}
                    onChange={(e) => toggleMethod(opt.value, e.target.checked)}
                  >
                    <div>
                      <div>
                        {opt.label}
                        {form.feedbackType === 'requirement' &&
                          opt.value === 'requirement_table' && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              需求优化已自动勾选
                            </Tag>
                          )}
                      </div>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        {opt.desc}
                      </Typography.Text>
                    </div>
                  </Checkbox>
                ))}
              </Space>
            </Form.Item>

            {form.methods.includes('bug') && (
              <div className="feedback-subform">
                <Typography.Title level={5}>缺陷信息</Typography.Title>

                <Form.Item
                  label="经办人"
                  required
                  extra="输入姓名、邮箱或工号关键字"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="输入姓名、邮箱或工号关键字"
                    value={form.bug.assignee || undefined}
                    options={[...DEFECT_ASSIGNEE_OPTIONS]}
                    filterOption={filterPersonOption}
                    onChange={(assignee) =>
                      patch({
                        bug: { ...form.bug, assignee: assignee ?? '' },
                      })
                    }
                  />
                </Form.Item>

                <div className="feedback-field-block">
                  <div className="feedback-field-block-title">自动填充</div>
                  <Form.Item
                    label="缺陷名称"
                    required
                    extra="规则：反馈类型 + 问题描述，可编辑"
                  >
                    <Input
                      value={form.bug.title}
                      onChange={(e) =>
                        patch({ bug: { ...form.bug, title: e.target.value } })
                      }
                    />
                  </Form.Item>
                  <div className="feedback-fixed-grid">
                    <Form.Item label="Bug 平台" extra="默认 Web，不可编辑">
                      <Input value={DEFECT_FIXED.platform} disabled />
                    </Form.Item>
                    <Form.Item label="Bug 发现阶段" extra="默认上线遗漏，不可编辑">
                      <Input value={DEFECT_FIXED.discoverStage} disabled />
                    </Form.Item>
                    <Form.Item label="Bug 如何发现" extra="默认无，不可编辑">
                      <Input value={DEFECT_FIXED.discoverHow} disabled />
                    </Form.Item>
                    <Form.Item label="Bug 类型" extra="默认需求缺陷，不可编辑">
                      <Input value={DEFECT_FIXED.bugType} disabled />
                    </Form.Item>
                  </div>
                  <Form.Item
                    label="重现步骤"
                    required
                    extra="规则：基于所选 Case 自动拼装，可编辑"
                  >
                    <Input.TextArea
                      rows={8}
                      value={form.bug.reproduceSteps}
                      onChange={(e) =>
                        patch({
                          bug: { ...form.bug, reproduceSteps: e.target.value },
                        })
                      }
                    />
                  </Form.Item>
                </div>

                <div className="feedback-field-block">
                  <div className="feedback-field-block-title">需要手动选择</div>
                  <div className="feedback-manual-grid">
                    <Form.Item label="优先级" required>
                      <Select
                        value={form.bug.priority}
                        onChange={(priority) =>
                          patch({ bug: { ...form.bug, priority } })
                        }
                        options={DEFECT_PRIORITY_OPTIONS.map((v) => ({
                          value: v,
                          label: v,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item label="严重程度" required>
                      <Select
                        value={form.bug.severity}
                        onChange={(severity) =>
                          patch({ bug: { ...form.bug, severity } })
                        }
                        options={DEFECT_SEVERITY_OPTIONS.map((v) => ({
                          value: v,
                          label: v,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item label="出现概率" required>
                      <Select
                        value={form.bug.probability}
                        onChange={(probability) =>
                          patch({ bug: { ...form.bug, probability } })
                        }
                        options={DEFECT_PROBABILITY_OPTIONS.map((v) => ({
                          value: v,
                          label: v,
                        }))}
                      />
                    </Form.Item>
                  </div>
                </div>

                <Form.Item label="备注" extra="可选">
                  <Input.TextArea
                    rows={3}
                    value={form.bug.remark}
                    placeholder="可选"
                    onChange={(e) =>
                      patch({ bug: { ...form.bug, remark: e.target.value } })
                    }
                  />
                </Form.Item>
              </div>
            )}

            {form.methods.includes('requirement_table') && (
              <div className="feedback-subform">
                <Typography.Title level={5}>需求优化表</Typography.Title>
                <Form.Item label="需求 / 优化描述" required>
                  <Input.TextArea
                    rows={4}
                    value={form.requirement.description}
                    onChange={(e) =>
                      patch({
                        requirement: {
                          ...form.requirement,
                          description: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Item>
                <Form.Item label="备注（可选）">
                  <Input.TextArea
                    rows={2}
                    value={form.requirement.remark}
                    onChange={(e) =>
                      patch({
                        requirement: {
                          ...form.requirement,
                          remark: e.target.value,
                        },
                      })
                    }
                  />
                </Form.Item>
                <Typography.Text type="secondary">
                  来源固定为「Roboneo 后台走查」；UID / Room / 关联任务将自动写入。
                </Typography.Text>
              </div>
            )}

            {form.methods.includes('group') && (
              <div className="feedback-subform">
                <Typography.Title level={5}>群消息卡片示意</Typography.Title>
                <Alert
                  type="info"
                  showIcon
                  className="feedback-proto-hint"
                  title="仅原型示意：正式流程提交后会直接发到群里，不会单独出现此预览页。"
                />
                <GroupChatCard
                  room={room}
                  feedbackType={form.feedbackType}
                  description={form.description}
                  ioTasks={selectedIo}
                  execTasks={selectedExec}
                  methods={form.methods}
                  reporter={
                    form.reporter
                      ? personDisplayName(form.reporter)
                      : personDisplayName(DEFAULT_REPORTER)
                  }
                />
              </div>
            )}
          </Form>
        </div>
      )}

      {step === 3 && (
        <div className="feedback-step">
          <Typography.Title level={5}>提交结果</Typography.Title>
          <Typography.Paragraph type="secondary">
            各流转目标独立执行：某一项失败不影响其他已成功结果，失败项可重试。
          </Typography.Paragraph>
          <div className="feedback-result-list">
            {(results ?? []).map((r) => (
              <div key={r.method} className={`feedback-result-item is-${r.status}`}>
                <div>
                  <Typography.Text strong>
                    {r.status === 'success' && '✓ '}
                    {r.status === 'failed' && '× '}
                    {r.status === 'pending' && '… '}
                    {r.message}
                  </Typography.Text>
                  <div>
                    <Typography.Text type="secondary">
                      {handleMethodLabel(r.method)}
                    </Typography.Text>
                  </div>
                </div>
                {r.status === 'failed' && (
                  <Button size="small" onClick={() => void retryFailed(r.method)}>
                    重试
                  </Button>
                )}
              </div>
            ))}
            {submitting && (!results || results.length < form.methods.length) && (
              <Typography.Text type="secondary">正在提交…</Typography.Text>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
