// deno-lint-ignore-file
import jwt from "jsonwebtoken";
import { createResponse } from "../utils/responseHelper.ts";

export async function verifyToken(req: Request) {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return createResponse("Unauthorized or missing token", 401 );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    if (!decoded) { 
        return createResponse("Invalid or expired token", 401 );
    }
    return {user: decoded};
}