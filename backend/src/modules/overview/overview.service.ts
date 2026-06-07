import { overviewData } from "./overview.data";
import { OperationRecord } from "../../models/OperationRecord";

export class OverviewService {
  async getOverview() {
    try {
      const records = await OperationRecord.findAll({
        order: [["updated_at", "DESC"]],
      });

      const formattedRecords = records.map((record) => ({
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

      return {
        ...overviewData,
        records: formattedRecords.length > 0 ? formattedRecords : overviewData.records,
      };
    } catch (error) {
      console.error(`[OverviewService] Failed to fetch records from database, using fallback: ${(error as Error).message}`);
      return overviewData;
    }
  }
}
