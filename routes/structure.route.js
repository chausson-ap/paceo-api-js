import { Router } from "express";
import {
  getStructures,
  getStructureById,
  createStructure,
  updateStructure,
  deleteStructure,
} from "../controllers/structure.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

/* GET */
router.get("/", getStructures);
router.get("/:id", getStructureById);

/* POST */
router.post("/", createStructure);

/* PUT */
router.put("/:id", updateStructure);

/* DELETE */
router.delete("/:id", deleteStructure);

export default router;
