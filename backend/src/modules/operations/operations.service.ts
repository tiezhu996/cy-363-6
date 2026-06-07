import { OperationRecord } from "../../models/OperationRecord";

export interface UpdateOperationRequest {
  id: number;
  owner_name?: string;
  status?: string;
  priority?: string;
  deadline?: string | null;
}

export class OperationsService {
  async getAllRecords() {
    const records = await OperationRecord.findAll({
      order: [["updated_at", "DESC"]],
    });
    return records.map((record) => ({
      key: `ldescaperoom-${record.id}`,
      id: record.id,
      name: record.module_name,
      owner: record.owner_name,
      status: record.status,
      metric: record.metric,
      priority: record.priority,
      deadline: record.deadline ? record.deadline.toISOString().split("T")[0] : null,
      updated_at: record.updated_at,
    }));
  }

  async updateRecord(updateData: UpdateOperationRequest) {
    const record = await OperationRecord.findByPk(updateData.id);
    if (!record) {
      throw new Error("任务记录不存在");
    }

    if (updateData.owner_name !== undefined) {
      record.owner_name = updateData.owner_name;
    }
    if (updateData.status !== undefined) {
      record.status = updateData.status;
    }
    if (updateData.priority !== undefined) {
      record.priority = updateData.priority;
    }
    if (updateData.deadline !== undefined) {
      record.deadline = updateData.deadline ? new Date(updateData.deadline) : null;
    }

    await record.save();
    return record;
  }
}
