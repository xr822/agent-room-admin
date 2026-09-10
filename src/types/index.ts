export type StepStatus = 'success' | 'error' | 'cancelled' | 'running';

export type ExecutionStepType =
  | 'credit'
  | 'aigc'
  | 'llm'
  | 'other';

export interface MediaAsset {
  id: string;
  name: string;
  type: 'image' | 'video';
  thumbColor: string;
  label?: string;
  /** 预览地址；演示环境可用占位图 */
  url?: string;
  poster?: string;
}

export interface ConversationMessage {
  id: string;
  taskId: string;
  role: 'user' | 'assistant';
  time: string;
  content: string;
  agent?: string;
  status?: string;
  contentType?: string;
  media?: MediaAsset[];
  mediaTitle?: string;
}

export interface ExecutionStep {
  id: string;
  index: number;
  title: string;
  type: ExecutionStepType;
  startTime: string;
  endTime: string;
  duration: string;
  percent?: string;
  status: StepStatus;
  agentTag?: string;
  subTag?: string;
  preview?: MediaAsset;
  details?: string;
  errorCode?: number;
  errorType?: string;
  errorMessage?: string;
}

export interface ExecutionTask {
  id: string;
  taskId: string;
  stepCount: number;
  steps: ExecutionStep[];
}

export interface RoomInfo {
  app: string;
  roomType: string;
  status: string;
  roomId: string;
  uid: string;
  gid: string;
  clientId: string;
  createdAt: string;
  saved: boolean;
  title: string;
  credit: {
    deductTotal: number;
    refundTotal: number;
    realDeduct: number;
    manualRefund: number | null;
  };
}

export interface QueryForm {
  app: string;
  client: string;
  roomId: string;
  taskId: string;
  shortLink: string;
}
