import {
  CloseCircleFilled,
  DownOutlined,
  ExclamationCircleFilled,
  RightOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { Button, Typography } from 'antd';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { summarizeExecFailures } from '../../data/groupMessage';
import type { MediaAsset, RoomInfo } from '../../types';
import type {
  FeedbackExecutionTask,
  FeedbackIoTask,
  FeedbackType,
  HandleMethod,
} from '../../types/feedback';
import { feedbackTypeLabel, FEEDBACK_CARD_HEADER, FEEDBACK_TYPE_THEME } from '../../types/feedback';
import { CardMediaButtons } from './CardMediaPreview';

export interface GroupChatCardProps {
  room: RoomInfo;
  feedbackType?: FeedbackType;
  description: string;
  ioTasks: FeedbackIoTask[];
  execTasks: FeedbackExecutionTask[];
  methods?: HandleMethod[];
  reporter?: string;
  edited?: boolean;
}

const METHOD_STATUS: Partial<Record<HandleMethod, string>> = {
  bug: '已提缺陷',
  requirement_table: '已同步需求表',
};

function truncate(text: string, max = 160) {
  const t = text.trim().replace(/\s+/g, ' ');
  if (!t) return '（未填写）';
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function cleanUserInput(text: string) {
  return text
    .replace(/\[@[^\]]+\]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function ExpandableText({
  label,
  text,
  previewMax = 100,
  expandLabel = '查看完整',
}: {
  label: string;
  text: string;
  previewMax?: number;
  expandLabel?: string;
}) {
  const [full, setFull] = useState(false);
  const cleaned = cleanUserInput(text) || text.trim() || '（未填写）';
  const needsExpand = cleaned.replace(/\s+/g, ' ').length > previewMax;
  const shown = full ? cleaned : truncate(cleaned, previewMax);

  return (
    <div className="alert-prompt-section">
      <div className="alert-prompt-role">{label}</div>
      <div className={full ? 'alert-prompt-full' : 'alert-prompt-preview'}>{shown}</div>
      {needsExpand && (
        <Typography.Link className="alert-prompt-toggle" onClick={() => setFull((v) => !v)}>
          {full ? '收起' : expandLabel}
        </Typography.Link>
      )}
    </div>
  );
}

function RelatedAccordionRow({
  open,
  onToggle,
  title,
  summary,
  badge,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  summary: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={`alert-accordion ${open ? 'is-open' : ''}`}>
      <button type="button" className="alert-accordion-head" onClick={onToggle}>
        <span className="alert-accordion-arrow">
          {open ? <DownOutlined /> : <RightOutlined />}
        </span>
        <span className="alert-accordion-main">
          <span className="alert-accordion-title">
            {title}
            {badge}
          </span>
          {!open && <span className="alert-accordion-summary">{summary}</span>}
        </span>
      </button>
      {open && <div className="alert-accordion-body">{children}</div>}
    </div>
  );
}

function IoDetailBody({
  userInput,
  agentReplies,
  inputMedia,
}: {
  userInput: string;
  agentReplies: FeedbackIoTask['agentReplies'];
  inputMedia: MediaAsset[];
}) {
  return (
    <>
      <ExpandableText label="用户输入" text={userInput} expandLabel="查看完整 Prompt" />
      <CardMediaButtons assets={inputMedia} title="输入媒体" />
      {agentReplies.length === 0 ? (
        <ExpandableText label="Agent 回复" text="（无）" />
      ) : (
        agentReplies.map((reply, index) => (
          <div key={reply.id}>
            <ExpandableText
              label={`Agent 回复 ${index + 1}${reply.agent ? `（${reply.agent}）` : ''}${reply.contentType ? ` · ${reply.contentType}` : ''}`}
              text={reply.content}
              previewMax={80}
              expandLabel="查看完整回复"
            />
            <CardMediaButtons
              assets={reply.media}
              title={reply.media.length ? `输出媒体 ${index + 1}` : undefined}
            />
          </div>
        ))
      )}
    </>
  );
}

export function GroupChatCard({
  room,
  feedbackType,
  description,
  ioTasks,
  execTasks,
  methods = [],
  reporter = '杨馨然',
  edited = false,
}: GroupChatCardProps) {
  const typeLabel = feedbackTypeLabel(feedbackType) || '未分类';
  const typeTheme = feedbackType
    ? FEEDBACK_TYPE_THEME[feedbackType]
    : { accent: '#8a8f98', soft: '#f4f5f6', text: '#5c616a' };
  const relatedCount = ioTasks.length + execTasks.length;

  /** 多条时默认收起关联列表；展开后完整展示，不设内部滚动 */
  const [listOpen, setListOpen] = useState(relatedCount <= 1);
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (relatedCount === 1) {
      return ioTasks[0]?.id ?? execTasks[0]?.id ?? null;
    }
    const firstFail = execTasks.find((t) => summarizeExecFailures(t).length > 0);
    return firstFail?.id ?? null;
  });

  const syncTags = useMemo(
    () =>
      methods
        .filter((m) => m === 'bug' || m === 'requirement_table')
        .map((m) => METHOD_STATUS[m])
        .filter((x): x is string => Boolean(x)),
    [methods],
  );
  const showFlowStatus = syncTags.length > 0;

  const failLines = useMemo(
    () => execTasks.flatMap((t) => summarizeExecFailures(t)),
    [execTasks],
  );
  const execHasError = failLines.length > 0;

  const toggleRow = (id: string) => {
    setActiveId((cur) => (cur === id ? null : id));
  };

  return (
    <div className="feishu-chat">
      <div className="feishu-chat-header">
        <div className="feishu-bot-avatar">测</div>
        <div>
          <div className="feishu-bot-name">测试反馈</div>
          <div className="feishu-bot-sub">Case 走查同步</div>
        </div>
      </div>

      <div className="alert-card">
        <div
          className="alert-card-header"
          style={
            {
              background: FEEDBACK_CARD_HEADER,
              ['--type-accent' as string]: typeTheme.accent,
            } as CSSProperties
          }
        >
          <div className="alert-card-title-row">
            <span className="alert-card-title">
              【{typeLabel === '未分类' ? '未分类问题' : `${typeLabel}问题`}】
            </span>
            {execHasError && (
              <span className="alert-pill alert-pill-danger">含 Error</span>
            )}
            {syncTags.map((tag) => (
              <span key={tag} className="alert-pill alert-pill-soft">
                {tag}
              </span>
            ))}
          </div>
          <div className="alert-card-sub">
            {showFlowStatus ? '需要继续跟进 · 已同步到其他系统' : '无需额外跟进 · 仅群内记录'}
          </div>
        </div>

        <div className="alert-card-body">
          <div className="alert-panel">
            {execHasError && (
              <div className="alert-warn">
                <ExclamationCircleFilled />
                <span>执行链路存在失败步骤，详情以房间执行流程为准</span>
              </div>
            )}

            <div className="alert-kicker">问题描述</div>
            <div className="alert-main-text">{truncate(description, 240)}</div>

            {relatedCount > 0 && (
              <>
                <div className="alert-kicker">关联内容</div>
                <div className="alert-related-summary">
                  {ioTasks.length > 0 && (
                    <span className="alert-meta-chip">输入输出 ×{ioTasks.length}</span>
                  )}
                  {execTasks.length > 0 && (
                    <span className="alert-meta-chip">
                      服务端执行 ×{execTasks.length}
                    </span>
                  )}
                  {execHasError && (
                    <span className="alert-meta-chip alert-meta-chip-danger">
                      <CloseCircleFilled /> 含失败步骤
                    </span>
                  )}
                </div>

                <Typography.Link
                  className="alert-toggle"
                  onClick={() => setListOpen((v) => !v)}
                >
                  {listOpen ? (
                    <>
                      收起关联列表 <UpOutlined />
                    </>
                  ) : (
                    <>
                      展开关联列表（{relatedCount}） <DownOutlined />
                    </>
                  )}
                </Typography.Link>

                {listOpen && (
                  <div className="alert-detail-list">
                    {ioTasks.map((task, i) => {
                      const mediaCount =
                        task.inputMedia.length + task.outputMedia.length;
                      const summary = truncate(
                        cleanUserInput(task.userInput) || task.userInput,
                        42,
                      );
                      return (
                        <RelatedAccordionRow
                          key={task.id}
                          open={activeId === task.id}
                          onToggle={() => toggleRow(task.id)}
                          title={`输入输出 ${i + 1} · ${task.taskId.slice(0, 10)}…`}
                          summary={
                            [
                              summary,
                              task.agentReplies.length > 1
                                ? `回复 ×${task.agentReplies.length}`
                                : '',
                              mediaCount > 0 ? `媒体 ${mediaCount}` : '',
                            ]
                              .filter(Boolean)
                              .join(' · ')
                          }
                        >
                          <IoDetailBody
                            userInput={task.userInput}
                            agentReplies={task.agentReplies}
                            inputMedia={task.inputMedia}
                          />
                        </RelatedAccordionRow>
                      );
                    })}
                    {execTasks.map((task) => {
                      const fails = summarizeExecFailures(task);
                      const summary =
                        fails.length > 0
                          ? `失败 ${fails.length} 步 · ${truncate(fails[0], 36)}`
                          : `无明确 Error · ${task.stepCount} 步`;
                      return (
                        <RelatedAccordionRow
                          key={task.id}
                          open={activeId === task.id}
                          onToggle={() => toggleRow(task.id)}
                          title={`执行 · ${task.taskId.slice(0, 10)}…（${task.stepCount} 步）`}
                          summary={summary}
                          badge={
                            fails.length > 0 ? (
                              <CloseCircleFilled className="feishu-error-x" />
                            ) : undefined
                          }
                        >
                          {fails.length > 0 ? (
                            fails.map((f) => (
                              <div key={f} className="feishu-fail-item">
                                {f}
                              </div>
                            ))
                          ) : (
                            <div className="alert-prompt-preview">
                              失败步骤：无明确 Error（完整链路请前往房间查看）
                            </div>
                          )}
                          <CardMediaButtons assets={task.media} title="执行产出" />
                        </RelatedAccordionRow>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="alert-footer-meta">
            <div>
              <span className="alert-footer-strong">反馈人：</span>
              {reporter}
            </div>
            <div>
              <span className="alert-footer-strong">Room ID: </span>
              <code className="alert-room-id">{room.roomId}</code>
            </div>
          </div>
        </div>

        <div className="alert-card-actions">
          <Button className="alert-btn-outline">查看房间详情</Button>
          {edited && <span className="feishu-edited">已编辑</span>}
        </div>
      </div>
    </div>
  );
}
