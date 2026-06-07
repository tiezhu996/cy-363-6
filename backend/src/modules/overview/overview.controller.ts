import type { Request, Response } from "express";
import { OverviewService } from "./overview.service";

const service = new OverviewService();

export async function getOverview(_request: Request, response: Response) {
  try {
    const data = await service.getOverview();
    response.json(data);
  } catch (error) {
    response.status(500).json({ error: "Failed to fetch overview" });
  }
}
