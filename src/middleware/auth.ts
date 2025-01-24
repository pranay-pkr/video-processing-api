import { Request, Response, NextFunction } from "express";
import { constants } from "../constants";

const staticApiToken = constants.API_TOKEN;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7); // Extract the token from the Bearer header

  if (token !== staticApiToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export default authMiddleware;
