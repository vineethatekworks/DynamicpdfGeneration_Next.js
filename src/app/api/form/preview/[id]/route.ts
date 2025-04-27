import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/form/preview/{id}:
 *   get:
 *     summary: Fetch Nomination Preview
 *     description: Retrieve a nomination by ID for preview purposes. Authentication required.
 *     tags:
 *       - Nomination
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the nomination
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Nomination fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Nomination not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error while fetching nomination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *     security:
 *       - bearerAuth: []
 */

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    const nomination = await prisma.nomination.findFirst({
      where: { id: params.id },
    });

    if (!nomination) {
      return createResponse("No nomination found for this user", 404);
    }

    return createResponse("Nomination fetched successfully", 200, nomination);
  } catch (error) {
    console.error("[NOMINATION PREVIEW ERROR]", error);
    return createResponse("Failed to fetch nomination preview", 500);
  }
}
