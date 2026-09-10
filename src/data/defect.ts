import type { BugFormValues } from '../types/feedback';
import type { ExecutionStep } from '../types';

/** 与「提缺陷」规则对齐的固定值（不可编辑） */
export const DEFECT_FIXED = {
  platform: 'Web',
  discoverStage: '上线遗漏',
  discoverHow: '无',
  bugType: '需求缺陷',
} as const;

export const DEFECT_PRIORITY_OPTIONS = ['高', '中', '低', '极低'] as const;
export const DEFECT_SEVERITY_OPTIONS = [
  '严重',
  '重要',
  '一般',
  '次要',
  '微小',
] as const;
export const DEFECT_PROBABILITY_OPTIONS = [
  '必现',
  '中高概率',
  '低概率',
  '单次',
] as const;

/** 演示用人员列表（反馈人 / 经办人共用，支持姓名、邮箱、工号检索） */
export const PERSON_OPTIONS = [
  {
    value: 'yxr1',
    label: '杨馨然（yxr1）',
    searchText: '杨馨然 yxr1 yxr1@meitu.com',
  },
  {
    value: 'zhangsan',
    label: '张三（zhangsan）',
    searchText: '张三 zhangsan zhangsan@meitu.com',
  },
  {
    value: 'lisi',
    label: '李四（lisi）',
    searchText: '李四 lisi lisi@meitu.com',
  },
  {
    value: 'wangwu',
    label: '王五（wangwu）',
    searchText: '王五 wangwu wangwu@meitu.com',
  },
  {
    value: 'chenliu',
    label: '陈六（chenliu）',
    searchText: '陈六 chenliu chenliu@meitu.com',
  },
] as const;

/** @deprecated 与 PERSON_OPTIONS 相同，保留别名兼容经办人调用 */
export const DEFECT_ASSIGNEE_OPTIONS = PERSON_OPTIONS;

export function filterPersonOption(
  input: string,
  option?: { label?: string; searchText?: string; value?: string },
) {
  const q = input.trim().toLowerCase();
  if (!q) return true;
  const hay = `${option?.searchText ?? ''} ${option?.label ?? ''} ${option?.value ?? ''}`.toLowerCase();
  return hay.includes(q);
}

/** 展示用短名：优先取括号前的姓名 */
export function personDisplayName(value: string) {
  const hit = PERSON_OPTIONS.find((o) => o.value === value);
  if (!hit) return value;
  return hit.label.replace(/（[^）]*）$/, '');
}

export const DEFAULT_REPORTER = 'yxr1';

export const defaultBugForm = (): BugFormValues => ({
  title: '',
  platform: DEFECT_FIXED.platform,
  priority: '中',
  severity: '一般',
  discoverStage: DEFECT_FIXED.discoverStage,
  discoverHow: DEFECT_FIXED.discoverHow,
  bugType: DEFECT_FIXED.bugType,
  probability: '必现',
  reproduceSteps: '',
  assignee: '',
  remark: '',
});

/** 复用原「提 Bug」备注规则：自动拼装 room / task / step / error 上下文 */
export function buildBugRemarkFromStep(params: {
  roomId: string;
  taskId: string;
  step: ExecutionStep;
}): string {
  return [
    'room trace 步骤异常',
    `room_id: ${params.roomId}`,
    `task_id: ${params.taskId}`,
    `step: ${params.step.title}`,
    `error: ${params.step.errorMessage ?? '-'}`,
    params.step.errorCode != null ? `error_code: ${params.step.errorCode}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/** 从 error 文案中提取「失败原因」；没有前缀时用整段 errorMessage */
export function extractFailureReason(step: ExecutionStep): string {
  const raw = (step.errorMessage ?? '').trim();
  if (!raw) return step.title;
  const matched = raw.match(/失败原因[:：]\s*(.+)$/);
  if (matched?.[1]) return matched[1].trim();
  // 兼容「code:xx | type:yy 失败原因：zzz」整段
  const pipeIdx = raw.lastIndexOf('失败原因');
  if (pipeIdx >= 0) {
    return raw
      .slice(pipeIdx)
      .replace(/^失败原因[:：]\s*/, '')
      .trim();
  }
  return raw;
}

/** 缺陷名称：【Agent Bug】（固定）+ 失败原因（自动填充） */
export function buildDefectTitleFromError(step: ExecutionStep): string {
  const reason = extractFailureReason(step).slice(0, 80);
  return `【Agent Bug】${reason}`;
}

export function buildReproduceStepsFromError(params: {
  roomId: string;
  roomLink: string;
  taskId: string;
  step: ExecutionStep;
}): string {
  const reason = extractFailureReason(params.step);
  return [
    `1. 打开 Room：${params.roomLink}`,
    `2. 定位 task_id=${params.taskId}`,
    `3. 查看执行步骤：${params.step.title}`,
    `4. 失败原因：${reason}`,
  ].join('\n');
}
