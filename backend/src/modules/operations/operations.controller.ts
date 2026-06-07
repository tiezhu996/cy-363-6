import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { OperationsService } from "./operations.service";

const service = new OperationsService();

export const updateOperationValidators = [
  body("id").isInt().withMessage("任务ID必须为整数"),
  body("owner_name").optional().isString().isLength({ min: 1, max: 80 }).withMessage("负责人名称长度需在1-80字符"),
  body("status").optional().isString().isLength({ min: 1, max: 40 }).withMessage("状态长度需在1-40字符"),
  body("priority").optional().isIn(["高", "中", "低"]).withMessage("优先级必须为 高/中/低"),
  body("deadline").optional().custom((value) => {
    if (value === null) return true;
    if (typeof value !== "string") return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(value);
  }).withMessage("截止日期格式必须为 YYYY-MM-DD 或 null"),
];

export async function getOperations(_request: Request, response: Response) {
  try {
    const records = await service.getAllRecords();
    response.json({ success: true, data: records });
  } catch (error) {
    response.status(500).json({ success: false, message: "获取任务列表失败", error: (error as Error).message });
  }
}

export async function updateOperation(request: Request, response: Response) {
  try {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ success: false, message: "参数校验失败", errors: errors.array() });
    }

    const { id, owner_name, status, priority, deadline } = request.body;

    await service.updateRecord({
      id,
      owner_name,
      status,
      priority,
      deadline,
    });

    const records = await service.getAllRecords();
    response.json({ success: true, message: "任务更新成功", data: records });
  } catch (error) {
    response.status(500).json({ success: false, message: "任务更新失败", error: (error as Error).message });
  }
}
