import {
  CopyOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import type { CheckboxOptionType } from 'antd/es/checkbox/Group';
import { useMemo, useState } from 'react';
import {
  buildBugRemarkFromStep,
  buildDefectTitleFromError,
  buildReproduceStepsFromError,
} from '../data/defect';
import { buildRoomLink } from '../data/feedback';
import type { ExecutionStep, ExecutionStepType, ExecutionTask, RoomInfo } from '../types';
import type { BugFormValues } from '../types/feedback';
import { filterExecutionSteps } from '../utils/filterExecutionSteps';
import { CreateDefectModal } from './CreateDefectModal';
import { MediaThumb } from './MediaThumb';

const filterOptions: CheckboxOptionType<ExecutionStepType>[] = [
  { label: '权益扣减/回退', value: 'credit' },
  { label: 'AIGC 工具调用', value: 'aigc' },
  { label: '大模型调用', value: 'llm' },
  { label: '其他步骤', value: 'other' },
];

interface ExecutionFlowPanelProps {
  room: RoomInfo;
  tasks: ExecutionTask[];
  totalDuration: string;
  outputFileCount: number;
  filters: ExecutionStepType[];
  expandedTaskIds: string[];
  onFiltersChange: (next: ExecutionStepType[]) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleTask: (taskId: string) => void;
}

function statusTag(status: ExecutionStep['status']) {
  if (status === 'success') return <Tag color="success">成功</Tag>;
  if (status === 'error') return <Tag color="error">失败</Tag>;
  if (status === 'cancelled') return <Tag color="warning">取消</Tag>;
  return <Tag color="processing">进行中</Tag>;
}

export function ExecutionFlowPanel({
  room,
  tasks,
  totalDuration,
  outputFileCount,
  filters,
  expandedTaskIds,
  onFiltersChange,
  onExpandAll,
  onCollapseAll,
  onToggleTask,
}: ExecutionFlowPanelProps) {
  const roomLink = buildRoomLink(room.roomId);
  const [defectOpen, setDefectOpen] = useState(false);
  const [defectInitial, setDefectInitial] = useState<Partial<BugFormValues>>({});

  const errors = useMemo(
    () =>
      tasks.flatMap((task) =>
        task.steps
          .filter((s) => s.status === 'error' || Boolean(s.errorCode) || Boolean(s.errorMessage))
          .map((step) => ({ step, taskId: task.taskId })),
      ),
    [tasks],
  );

  const openDefect = (taskId: string, step: ExecutionStep) => {
    setDefectInitial({
      title: buildDefectTitleFromError(step),
      reproduceSteps: buildReproduceStepsFromError({
        roomId: room.roomId,
        roomLink,
        taskId,
        step,
      }),
      remark: buildBugRemarkFromStep({
        roomId: room.roomId,
        taskId,
        step,
      }),
    });
    setDefectOpen(true);
  };

  return (
    <div className="split-panel execution-panel">
      <div className="split-panel-header">
        <div className="split-panel-title">
          <Typography.Text strong>服务端执行流程</Typography.Text>
          <Typography.Text type="secondary" className="split-panel-meta">
            总耗时 {totalDuration}
          </Typography.Text>
        </div>
      </div>

      <div className="execution-toolbar">
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          title="执行记录仅保留 30 天，过期后将无法查询。"
          className="execution-alert"
        />

        <div className="filter-row">
          <Typography.Text type="secondary">只显示</Typography.Text>
          <Checkbox.Group
            options={filterOptions}
            value={filters}
            onChange={(vals) => onFiltersChange(vals as ExecutionStepType[])}
          />
        </div>

        <div className="execution-actions">
          <Space>
            <Typography.Link onClick={onExpandAll}>展开全部</Typography.Link>
            <Typography.Link onClick={onCollapseAll}>收起全部</Typography.Link>
          </Space>
          <Button size="small">查看全部输出文件 ({outputFileCount})</Button>
        </div>
      </div>

      <div className="split-panel-body">
        {errors.length > 0 && (
          <div className="error-banner">
            <div className="error-banner-header">
              <Button
                danger
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  const text = errors
                    .map(
                      (e) =>
                        `[${e.step.errorCode}] ${e.step.title}: ${e.step.errorMessage}`,
                    )
                    .join('\n');
                  void navigator.clipboard.writeText(text);
                  message.success(`已复制 ${errors.length} 个错误`);
                }}
              >
                复制 {errors.length} 个错误
              </Button>
            </div>
            <div className="error-list">
              {errors.map(({ step, taskId }) => (
                <div key={step.id} className="error-item">
                  <div className="error-item-top">
                    <Space wrap size={6}>
                      <Tag color="error">AIGC工具调用</Tag>
                      <Typography.Text type="danger" strong>
                        code {step.errorCode}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                        task {taskId.slice(0, 10)}...
                      </Typography.Text>
                    </Space>
                    <Typography.Link
                      onClick={() => openDefect(taskId, step)}
                    >
                      提缺陷
                    </Typography.Link>
                  </div>
                  <div className="error-message">
                    {step.errorCode != null && <>code:{step.errorCode}</>}
                    {step.errorType && <> | type:{step.errorType}</>}
                    {' '}
                    失败原因：{step.errorMessage}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.map((task) => {
          const expanded = expandedTaskIds.includes(task.id);
          const visibleSteps = filterExecutionSteps(task.steps, filters);

          return (
            <div key={task.id} className="exec-task">
              <div
                className="exec-task-header"
                onClick={() => onToggleTask(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onToggleTask(task.id);
                }}
                role="button"
                tabIndex={0}
              >
                <Space>
                  <Typography.Text strong>
                    {expanded ? '▼' : '▶'} {task.taskId.slice(0, 14)}...
                  </Typography.Text>
                  <Tag>{task.stepCount} 步</Tag>
                </Space>
              </div>

              {expanded && (
                <div className="exec-steps">
                  {visibleSteps.length === 0 ? (
                    <Typography.Text type="secondary">
                      当前筛选下无步骤
                    </Typography.Text>
                  ) : (
                    visibleSteps.map((step) => (
                      <div key={step.id} className="exec-step">
                        <div className="exec-step-main">
                          <div className="exec-step-title-row">
                            <Typography.Text strong>
                              {step.index}. {step.title}
                            </Typography.Text>
                            {step.agentTag && <Tag>{step.agentTag}</Tag>}
                            {step.subTag && (
                              <Tag color="purple">{step.subTag}</Tag>
                            )}
                            {statusTag(step.status)}
                          </div>
                          <div className="exec-step-meta">
                            <Typography.Text type="secondary">
                              {step.startTime} → {step.endTime}
                            </Typography.Text>
                            <Typography.Text>
                              {step.duration}
                              {step.percent ? ` · ${step.percent}` : ''}
                            </Typography.Text>
                          </div>
                          {step.preview && (
                            <div className="exec-preview">
                              <MediaThumb
                                asset={step.preview}
                                size="sm"
                                showActions={false}
                              />
                              <Space orientation="vertical" size={0}>
                                <Typography.Text>
                                  {step.preview.label}
                                </Typography.Text>
                                <Space>
                                  <Typography.Link>预览</Typography.Link>
                                  <Typography.Link>查看地址</Typography.Link>
                                </Space>
                              </Space>
                            </div>
                          )}
                          {step.errorMessage && (
                            <div className="exec-step-error">
                              {step.errorCode != null && (
                                <>code:{step.errorCode}</>
                              )}
                              {step.errorType && (
                                <> | type:{step.errorType}</>
                              )}{' '}
                              失败原因：{step.errorMessage}
                            </div>
                          )}
                          <div className="exec-step-actions">
                            <Typography.Link>详情</Typography.Link>
                            {step.subTag && (
                              <Typography.Link>{step.subTag}</Typography.Link>
                            )}
                            {step.type === 'aigc' && (
                              <Typography.Link>AIGC(子)</Typography.Link>
                            )}
                            {!step.errorMessage && (
                              <Typography.Link>对话日志</Typography.Link>
                            )}
                            {step.errorMessage && (
                              <Typography.Link
                                onClick={() => openDefect(task.taskId, step)}
                              >
                                提缺陷
                              </Typography.Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CreateDefectModal
        key={`${defectInitial.title}-${defectInitial.remark?.slice(0, 24) ?? ''}`}
        open={defectOpen}
        title="提缺陷"
        requireAssignee
        initialValues={defectInitial}
        onCancel={() => setDefectOpen(false)}
      />
    </div>
  );
}
