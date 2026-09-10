import type { MediaAsset } from '../types';

export type FeedbackType =
  | 'generation'
  | 'agent'
  | 'experience'
  | 'requirement'
  | 'other';

export type HandleMethod = 'group' | 'bug' | 'requirement_table';

export type FeedbackContentKind = 'io' | 'execution';

export interface FeedbackAgentReply {
  id: string;
  content: string;
  time: string;
  agent?: string;
  contentType?: string;
  status?: string;
  media: MediaAsset[];
}

export interface FeedbackIoTask {
  id: string;
  taskId: string;
  userInput: string;
  /** @deprecated 用 agentReplies；保留首条/摘要兼容旧展示 */
  agentReply: string;
  time: string;
  mediaCount: number;
  agent?: string;
  inputMedia: MediaAsset[];
  /** 汇总所有回复的输出媒体，便于计数 */
  outputMedia: MediaAsset[];
  /** 一次用户输入可能对应多条 Agent 回复 */
  agentReplies: FeedbackAgentReply[];
}

export interface FeedbackExecutionTask {
  id: string;
  taskId: string;
  stepCount: number;
  status: 'success' | 'partial' | 'failed';
  durationHint: string;
  errorSummary?: string;
  agents: string[];
  media: MediaAsset[];
}

export interface BugFormValues {
  title: string;
  platform: string;
  priority: string;
  severity: string;
  discoverStage: string;
  discoverHow: string;
  bugType: string;
  probability: string;
  reproduceSteps: string;
  /** 经办人（执行流「提缺陷」必填；反馈流程可选按入口要求） */
  assignee: string;
  /** 备注（可选，复用原提 Bug 备注规则） */
  remark: string;
}

export interface RequirementTableValues {
  description: string;
  remark: string;
}

export interface FeedbackFormState {
  selectedIoIds: string[];
  selectedExecIds: string[];
  feedbackType?: FeedbackType;
  description: string;
  /** 反馈人 */
  reporter: string;
  methods: HandleMethod[];
  bug: BugFormValues;
  requirement: RequirementTableValues;
}

export type SubmitTargetStatus = 'pending' | 'success' | 'failed';

export interface SubmitTargetResult {
  method: HandleMethod;
  status: SubmitTargetStatus;
  message: string;
}

export const FEEDBACK_TYPE_OPTIONS: Array<{
  value: FeedbackType;
  label: string;
  desc: string;
}> = [
  {
    value: 'generation',
    label: '生成效果',
    desc: '任务正常产出，但人物/动作/风格/画质/参考遵循等不符合预期',
  },
  {
    value: 'agent',
    label: 'Agent 响应',
    desc: '理解、回复、上下文承接或行为选择不符合预期',
  },
  {
    value: 'experience',
    label: '产品体验',
    desc: '用户在理解或使用过程中明显受阻',
  },
  {
    value: 'requirement',
    label: '需求优化',
    desc: '当前能力未覆盖或值得增强的产品需求/优化点',
  },
  {
    value: 'other',
    label: '其他',
    desc: '暂时无法归入以上类型',
  },
];

/** 反馈类型色：统一克制，卡片头不换色，仅用点缀区分 */
export const FEEDBACK_TYPE_THEME: Record<
  FeedbackType,
  { accent: string; soft: string; text: string }
> = {
  generation: { accent: '#b7791f', soft: '#fff8eb', text: '#8a5b12' },
  agent: { accent: '#3b6fd9', soft: '#eef3ff', text: '#2450b5' },
  experience: { accent: '#5a6a88', soft: '#f1f3f7', text: '#3e4c66' },
  requirement: { accent: '#3f8f73', soft: '#eef8f3', text: '#2b6a54' },
  other: { accent: '#8a8f98', soft: '#f4f5f6', text: '#5c616a' },
};

/** 群卡片深色头统一，不随类型换彩虹渐变 */
export const FEEDBACK_CARD_HEADER =
  'linear-gradient(135deg, #3a4556 0%, #2c3442 100%)';

export const HANDLE_METHOD_OPTIONS: Array<{
  value: HandleMethod;
  label: string;
  desc: string;
}> = [
  { value: 'group', label: '上报到群', desc: '同步给相关产研，带上 Room 与选中 Case' },
  { value: 'bug', label: '提缺陷', desc: '创建缺陷单，需补充缺陷系统必填字段' },
  {
    value: 'requirement_table',
    label: '同步需求优化表',
    desc: '沉淀真实用户需求证据，供产品后续判断',
  },
];

export function feedbackTypeLabel(type?: FeedbackType) {
  return FEEDBACK_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? '';
}

export function handleMethodLabel(method: HandleMethod) {
  return HANDLE_METHOD_OPTIONS.find((o) => o.value === method)?.label ?? method;
}
