import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/config/prisma";
import { step1Schema } from "@/types/nomination";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/form/start:
 *   post:
 *     summary: Submit Step 1 of Nomination
 *     description: Creates a nomination record with basic details like name, father name, age, and email.
 *     tags:
 *       - Nomination
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fatherName:
 *                 type: string
 *               age:
 *                 type: integer
 *               email:
 *                 type: string
 *             required:
 *               - name
 *               - fatherName
 *               - age
 *               - email
 *     responses:
 *       201:
 *         description: Nomination Step 1 saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     nominationid:
 *                       type: string
 *       400:
 *         description: Validation error in input fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error while saving nomination
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

export async function POST(req: NextRequest) {
    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    try {
        const data = await req.json();

        const validated_data = step1Schema.safeParse(data);
        if (!validated_data.success) {
            return createResponse("Validation Error", 400, validated_data.error.errors.map((e) => e.message).join(", "));
        }

        const { name, fatherName, age, email } = validated_data.data;

        const nomination = await prisma.nomination.create({
            data: {
                name,
                fatherName,
                age,
                email,
            },
        });

        return createResponse("Fill the next fields to complete nomination", 201, { nominationid: nomination.id });
    } catch (error) {
        return createResponse("Something went wrong", 500, { error: error });
    }
}
