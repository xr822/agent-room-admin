import { conversations, executionTasks, roomInfo } from './mock';
import type { MediaAsset } from '../types';
import type {
  BugFormValues,
  FeedbackAgentReply,
  FeedbackExecutionTask,
  FeedbackIoTask,
  FeedbackType,
} from '../types/feedback';
import { feedbackTypeLabel } from '../types/feedback';

export { defaultBugForm } from './defect';
export type { BugFormValues };

function summarizeAgentReplies(replies: FeedbackAgentReply[]) {
  if (!replies.length) return '';
  if (replies.length === 1) return replies[0].content;
  return replies
    .map((r, i) => `[回复 ${i + 1}] ${r.content}`)
    .join('\n');
}

function flattenOutputMedia(replies: FeedbackAgentReply[]) {
  return replies.flatMap((r) => r.media);
}

export function buildIoTasks(): FeedbackIoTask[] {
  const byTask = new Map<string, FeedbackIoTask>();

  for (const msg of conversations) {
    let existing = byTask.get(msg.taskId);
    if (!existing) {
      existing = {
        id: `io-${msg.taskId}`,
        taskId: msg.taskId,
        userInput: '',
        agentReply: '',
        time: msg.time,
        mediaCount: 0,
        inputMedia: [],
        outputMedia: [],
        agentReplies: [],
      };
      byTask.set(msg.taskId, existing);
    }

    if (msg.role === 'user') {
      existing.userInput = msg.content;
      existing.time = msg.time;
      existing.inputMedia = [...(msg.media ?? [])];
    } else {
      const reply: FeedbackAgentReply = {
        id: msg.id,
        content: msg.content,
        time: msg.time,
        agent: msg.agent,
        contentType: msg.contentType,
        status: msg.status,
        media: [...(msg.media ?? [])],
      };
      existing.agentReplies.push(reply);
      existing.agent = msg.agent ?? existing.agent;
      existing.agentReply = summarizeAgentReplies(existing.agentReplies);
      existing.outputMedia = flattenOutputMedia(existing.agentReplies);
    }

    existing.mediaCount =
      existing.inputMedia.length + existing.outputMedia.length;
  }

  return [...byTask.values()];
}

export function buildExecutionFeedbackTasks(): FeedbackExecutionTask[] {
  return executionTasks.map((task) => {
    const hasError = task.steps.some(
      (s) => s.status === 'error' || Boolean(s.errorCode),
    );
    const hasCancel = task.steps.some((s) => s.status === 'cancelled');
    const agents = [
      ...new Set(
        task.steps
          .map((s) => s.agentTag)
          .filter((x): x is string => Boolean(x)),
      ),
    ];
    const error = task.steps.find((s) => s.errorMessage)?.errorMessage;
    const durations = task.steps.map((s) => s.duration);
    const media: MediaAsset[] = task.steps
      .map((s) => s.preview)
      .filter((p): p is MediaAsset => Boolean(p));
    return {
      id: `exec-${task.id}`,
      taskId: task.taskId,
      stepCount: task.stepCount,
      status: hasError ? 'failed' : hasCancel ? 'partial' : 'success',
      durationHint: durations[durations.length - 1] ?? '-',
      errorSummary: error,
      agents,
      media,
    };
  });
}

export function buildRoomLink(roomId = roomInfo.roomId) {
  return `https://roboneo.example.com/room/${roomId}`;
}

export function autoBugTitle(type: FeedbackType | undefined, description: string) {
  const summary = description.trim().slice(0, 40) || '未填写问题描述';
  return `【${feedbackTypeLabel(type) || 'Case反馈'}】${summary}`;
}

export function autoReproduceSteps(params: {
  roomId: string;
  uid: string;
  roomLink: string;
  ioTasks: FeedbackIoTask[];
  execTasks: FeedbackExecutionTask[];
  description: string;
}) {
  const ioLines = params.ioTasks
    .map((t, i) => {
      const replyLines = t.agentReplies.length
        ? t.agentReplies
            .map(
              (r, ri) =>
                `   Agent 回复 ${ri + 1}${r.agent ? `（${r.agent}）` : ''}：${r.content.slice(0, 100)}`,
            )
            .join('\n')
        : `   Agent：${t.agentReply.slice(0, 120) || '（无）'}`;
      const mediaNames = [...t.inputMedia, ...t.outputMedia]
        .map((m) => m.name)
        .join(', ');
      return `${i + 1}. 输入输出任务 ${t.taskId}\n   用户输入：${t.userInput.slice(0, 120)}\n${replyLines}${mediaNames ? `\n   媒体：${mediaNames}` : ''}`;
    })
    .join('\n');
  const execLines = params.execTasks
    .map(
      (t, i) =>
        `${i + 1}. 服务端执行任务 ${t.taskId}（${t.stepCount} 步，状态 ${t.status}）${t.errorSummary ? `\n   Error：${t.errorSummary}` : ''}`,
    )
    .join('\n');

  return [
    `1. 打开 Room：${params.roomLink}`,
    `2. UID=${params.uid}，Room ID=${params.roomId}`,
    `3. 问题现象：${params.description || '（待补充）'}`,
    params.ioTasks.length ? `4. 关联输入输出任务：\n${ioLines}` : '',
    params.execTasks.length
      ? `${params.ioTasks.length ? '5' : '4'}. 关联服务端执行任务：\n${execLines}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}
