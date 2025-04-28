// deno-lint-ignore-file

import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/config/prisma";
import { step2Schema } from "@/types/nomination";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/form/update/{id}:
 *   put:
 *     summary: Submit Step 2 of Nomination
 *     description: Updates an existing nomination with additional details like designation, address, phone number, and Aadhaar number.
 *     tags:
 *       - Nomination
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the nomination to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               designation:
 *                 type: string
 *               residentialAddr:
 *                 type: string
 *               postalAddr:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               aadhaarNumber:
 *                 type: string
 *             required:
 *               - designation
 *               - residentialAddr
 *               - postalAddr
 *               - phoneNumber
 *               - aadhaarNumber
 *     responses:
 *       200:
 *         description: Nomination updated successfully
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
 *       404:
 *         description: Nomination not found
 *       500:
 *         description: Server error while updating nomination
 *     security:
 *       - bearerAuth: []
 */

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResult = await verifyToken(req);
        if (authResult instanceof Response) return authResult;

        const { id: nominationid } =  params;
        
        const data = await req.json();

        const validated_data = step2Schema.safeParse(data);

        if (!validated_data.success) {
            return createResponse("Validation Error", 400, validated_data.error.errors.map((e) => e.message).join(", "));
        }

        const { designation, residentialAddr, postalAddr, phoneNumber, aadhaarNumber } = validated_data.data;

        const updatedNomination = await prisma.nomination.update({
            where: { id: nominationid },
            data: {
                designation,
                residentialAddr,
                postalAddr,
                phoneNumber,
                aadhaarNumber,
            },
        });

        return createResponse("Nomination updated successfully, you can preview or generate PDF now", 200, { nominationid: updatedNomination.id });

    } catch (error) {
        console.error("[UPDATE ERROR]", error);
        return createResponse("Nomination update failed", 500);
    }
}
