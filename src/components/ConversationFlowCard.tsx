import { ExportOutlined, FormOutlined } from '@ant-design/icons';
import { Button, Card, Segmented, Space, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import {
  conversations,
  executionTasks,
  outputFileCount,
  totalDuration,
} from '../data/mock';
import type { ExecutionStepType, RoomInfo } from '../types';
import { ConversationPanel } from './ConversationPanel';
import { ExecutionFlowPanel } from './ExecutionFlowPanel';
import { FeedbackDrawer } from './feedback/FeedbackDrawer';

interface ConversationFlowCardProps {
  room: RoomInfo;
}

export function ConversationFlowCard({ room }: ConversationFlowCardProps) {
  const allTaskIds = useMemo(
    () => [...new Set(conversations.map((m) => m.taskId))],
    [],
  );

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'task' | 'timeline'>('task');
  const [msgExpanded, setMsgExpanded] = useState<string[]>(
    conversations.map((m) => m.id),
  );
  const [execExpanded, setExecExpanded] = useState<string[]>(
    executionTasks.map((t) => t.id),
  );
  const [filters, setFilters] = useState<ExecutionStepType[]>([]);

  const userInputCount = conversations.filter((m) => m.role === 'user').length;
  const expandedTaskCount = useMemo(() => {
    const taskIds = new Set(
      conversations
        .filter((m) => msgExpanded.includes(m.id))
        .map((m) => m.taskId),
    );
    return taskIds.size;
  }, [msgExpanded]);

  const enterExportMode = () => {
    setExportMode(true);
    setSelectedTaskIds(allTaskIds);
  };

  const exitExportMode = () => {
    setExportMode(false);
    setSelectedTaskIds([]);
  };

  const confirmExport = () => {
    if (selectedTaskIds.length === 0) {
      message.warning('请先勾选要导出的任务');
      return;
    }
    message.success(`已导出 ${selectedTaskIds.length} 个任务的分析记录`);
    exitExportMode();
  };

  return (
    <>
      <Card
        className="section-card flow-card"
        title="会话与执行流程"
        extra={
          <Space wrap size="middle">
            {exportMode ? (
              <>
                <Typography.Text type="secondary">
                  已选 {selectedTaskIds.length} 个任务
                </Typography.Text>
                <Button
                  size="small"
                  onClick={() => setSelectedTaskIds(allTaskIds)}
                >
                  全选
                </Button>
                <Button size="small" onClick={() => setSelectedTaskIds([])}>
                  清空
                </Button>
                <Button
                  size="small"
                  type="primary"
                  className="btn-purple"
                  onClick={confirmExport}
                >
                  导出所选
                </Button>
                <Button size="small" onClick={exitExportMode}>
                  取消
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  icon={<FormOutlined />}
                  onClick={() => setFeedbackOpen(true)}
                >
                  反馈
                </Button>
                <Button icon={<ExportOutlined />} onClick={enterExportMode}>
                  导出分析记录
                </Button>
              </>
            )}
            <Segmented
              value={viewMode}
              onChange={(v) => setViewMode(v as 'task' | 'timeline')}
              options={[
                { label: '按任务聚合', value: 'task' },
                { label: '按时间线', value: 'timeline' },
              ]}
            />
          </Space>
        }
      >
        <div className="flow-split">
          <ConversationPanel
            messages={conversations}
            selectable={exportMode}
            selectedTaskIds={selectedTaskIds}
            expandedIds={msgExpanded}
            headerMeta={`${userInputCount} 条用户输入 · ${expandedTaskCount}/${allTaskIds.length} 个任务已展开`}
            onToggleTask={(taskId, checked) => {
              setSelectedTaskIds((prev) =>
                checked
                  ? [...new Set([...prev, taskId])]
                  : prev.filter((id) => id !== taskId),
              );
            }}
            onExpandAll={() =>
              setMsgExpanded(conversations.map((m) => m.id))
            }
            onCollapseAll={() => setMsgExpanded([])}
            onToggleExpand={(id) =>
              setMsgExpanded((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id],
              )
            }
          />
          <ExecutionFlowPanel
            room={room}
            tasks={executionTasks}
            totalDuration={totalDuration}
            outputFileCount={outputFileCount}
            filters={filters}
            expandedTaskIds={execExpanded}
            onFiltersChange={setFilters}
            onExpandAll={() =>
              setExecExpanded(executionTasks.map((t) => t.id))
            }
            onCollapseAll={() => setExecExpanded([])}
            onToggleTask={(id) =>
              setExecExpanded((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
          />
        </div>
        {viewMode === 'timeline' && (
          <Typography.Paragraph type="secondary" className="timeline-hint">
            时间线模式：左右两侧按时间交错展示（当前为演示态，数据与任务聚合相同）。
          </Typography.Paragraph>
        )}
      </Card>

      <FeedbackDrawer
        open={feedbackOpen}
        room={room}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
