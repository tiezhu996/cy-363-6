import { Router } from "express";
import { getOperations, updateOperation, updateOperationValidators } from "./operations.controller";

export const operationsRouter = Router();

operationsRouter.get("/operations", getOperations);
operationsRouter.put("/operations", updateOperationValidators, updateOperation);
