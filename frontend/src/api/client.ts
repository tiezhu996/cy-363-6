import { API_BASE_URL } from "../constants/app";
import type { OverviewResponse, OperationRecord } from "../types";

export interface OperationsResponse {
  success: boolean;
  data: OperationRecord[];
  message?: string;
}

export interface UpdateOperationRequest {
  id: number;
  owner_name?: string;
  status?: string;
  priority?: string;
  deadline?: string | null;
}

export async function fetchOverview(): Promise<OverviewResponse> {
  const response = await fetch(`${API_BASE_URL}/overview`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Overview request failed: ${response.status}`);
  }

  return response.json() as Promise<OverviewResponse>;
}

export async function fetchOperations(): Promise<OperationRecord[]> {
  const response = await fetch(`${API_BASE_URL}/operations`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Operations request failed: ${response.status}`);
  }

  const result = (await response.json()) as OperationsResponse;
  if (!result.success) {
    throw new Error(result.message || "获取任务列表失败");
  }

  return result.data;
}

export async function updateOperation(request: UpdateOperationRequest): Promise<OperationRecord[]> {
  const response = await fetch(`${API_BASE_URL}/operations`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Update operation failed: ${response.status}`);
  }

  const result = (await response.json()) as OperationsResponse;
  if (!result.success) {
    throw new Error(result.message || "任务更新失败");
  }

  return result.data;
}
