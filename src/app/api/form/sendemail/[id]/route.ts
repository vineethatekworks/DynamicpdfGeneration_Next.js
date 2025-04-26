import { verifyToken } from "@/auth/verifyToken";
import { getPDFFromS3 } from "@/lib/config/AwsS3Config";
import { sendMailWithPDF } from "@/lib/config/mailconfig";
import { prisma } from "@/lib/config/prisma";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const authResult= await verifyToken(req);
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
    return createResponse("Server error", 500, {error: error});}
}