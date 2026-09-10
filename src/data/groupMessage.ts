import type { RoomInfo } from '../types';
import type {
  FeedbackExecutionTask,
  FeedbackIoTask,
  FeedbackType,
} from '../types/feedback';
import { feedbackTypeLabel } from '../types/feedback';
import { executionTasks } from './mock';
import { buildRoomLink } from './feedback';

function truncate(text: string, max = 160) {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

/** 从执行任务中抽出失败步骤摘要，便于群消息精准定位 */
export function summarizeExecFailures(exec: FeedbackExecutionTask): string[] {
  const full = executionTasks.find((t) => `exec-${t.id}` === exec.id || t.taskId === exec.taskId);
  if (!full) {
    return exec.errorSummary ? [`失败：${exec.errorSummary}`] : [];
  }
  return full.steps
    .filter((s) => s.status === 'error' || Boolean(s.errorMessage))
    .map((s) => {
      const code = s.errorCode != null ? `code:${s.errorCode}` : '';
      const type = s.errorType ? `type:${s.errorType}` : '';
      const head = [code, type].filter(Boolean).join(' | ');
      return `${s.index}. ${s.title}${head ? ` · ${head}` : ''} · 失败原因：${s.errorMessage ?? '-'}`;
    });
}

export function buildGroupMessagePreview(params: {
  room: RoomInfo;
  feedbackType?: FeedbackType;
  description: string;
  ioTasks: FeedbackIoTask[];
  execTasks: FeedbackExecutionTask[];
}): string {
  const roomLink = buildRoomLink(params.room.roomId);
  const typeLabel = feedbackTypeLabel(params.feedbackType) || '未分类';
  const lines: string[] = [
    `Case 反馈 · ${typeLabel}`,
    '',
    `UID：${params.room.uid}`,
    `Room ID：${params.room.roomId}`,
    `应用 / 环境：${params.room.app} · ${params.room.clientId}`,
    `房间链接：${roomLink}`,
    '',
    `问题描述：${params.description.trim() || '（未填写）'}`,
    '',
    `已选内容 · ${params.ioTasks.length + params.execTasks.length} 项`,
  ];

  params.ioTasks.forEach((t, i) => {
    lines.push('');
    lines.push(`【输入输出 ${i + 1}】task_id=${t.taskId}`);
    lines.push(`用户输入：${truncate(t.userInput)}`);
    if (!t.agentReplies.length) {
      lines.push(`Agent 输出：${truncate(t.agentReply || '（无文本）')}`);
    } else {
      lines.push(`Agent 回复：${t.agentReplies.length} 条`);
      t.agentReplies.forEach((r, ri) => {
        lines.push(
          `- 回复 ${ri + 1}${r.agent ? `（${r.agent}）` : ''}${r.contentType ? ` · ${r.contentType}` : ''}：${truncate(r.content || '（无文本）', 120)}`,
        );
      });
    }
    if (t.inputMedia.length || t.outputMedia.length) {
      lines.push(
        `媒体：输入 ${t.inputMedia.length} · 输出 ${t.outputMedia.length}（详见房间）`,
      );
    }
    lines.push(`定位：${roomLink}?task_id=${t.taskId}`);
  });

  params.execTasks.forEach((t, i) => {
    lines.push('');
    lines.push(`【执行记录 ${i + 1}】task_id=${t.taskId}（${t.stepCount} 步 · ${t.status}）`);
    const fails = summarizeExecFailures(t);
    if (fails.length) {
      lines.push('失败步骤：');
      fails.forEach((f) => lines.push(`- ${f}`));
    } else {
      lines.push('失败步骤：无明确 Error（请结合问题描述查看完整链路）');
    }
    lines.push(`定位：${roomLink}?task_id=${t.taskId}&tab=execution`);
  });

  lines.push('');
  lines.push('操作：查看房间详情 | 定位到所选任务');

  return lines.join('\n');
}
