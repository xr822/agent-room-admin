import type { ExecutionStep, ExecutionStepType } from '../types';

/** 未勾选任何类型时，视为不过滤，展示全部步骤 */
export function filterExecutionSteps(
  steps: ExecutionStep[],
  filters: ExecutionStepType[],
): ExecutionStep[] {
  if (!filters || filters.length === 0) {
    return steps;
  }
  return steps.filter((s) => filters.includes(s.type));
}
