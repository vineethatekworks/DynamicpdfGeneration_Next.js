import { verifyToken } from "@/auth/verifyToken";
import { getPDFFromS3 } from "@/lib/config/AwsS3Config";
import { sendMailWithPDF } from "@/lib/config/mailconfig";
import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/form/sendemail/{id}:
 *  post:
 *     summary: Send Nomination PDF via Email
 *     description: Sends the nomination PDF as an email attachment to the authenticated user.
 *     tags:
 *       - Nomination
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the nomination form
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email sending initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
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
 *         description: Server error during email sending
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

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    const email = authResult.email;
    console.log("email:", email);

    const { id: formId } = await context.params;

    const formData = await prisma.nomination.findUnique({
      where: { id: formId },
    });

    if (!formData) {
      return createResponse("Nomination not found", 404);
    }

    const pdfData = await getPDFFromS3(formId);
    if (!pdfData) {
      return createResponse("Failed to fetch PDF", 500);
    }

    sendMailWithPDF(pdfData, email)
      .then(() => console.log("Email sent"))
      .catch((error) => console.error("Failed to send email:", error));

    return createResponse("We are sending your email!", 200);

  } catch (error) {
    console.error("Server error:", error);
    return createResponse("Server error", 500, { error: error });
  }
}
