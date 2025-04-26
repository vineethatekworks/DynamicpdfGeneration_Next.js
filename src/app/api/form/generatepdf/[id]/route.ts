import { verifyToken } from "@/auth/verifyToken";
import { uploadAndGetPdfUrl } from "@/lib/config/AwsS3Config";
import { prisma } from "@/lib/config/prisma";
import { generateNominationPDF } from "@/lib/pdf/generatePdf";
import { Nomination } from "@/types/nomination";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyToken(req);
  if (authResult instanceof Response) return authResult;

  try {
    // Get nomination for this user
    const nomination = await prisma.nomination.findUnique({
      where: { id: params.id },
    });

    if (!nomination) {
      return createResponse("Nomination not found", 404);
    }

    // validate all fields after getting
    const validated_nomination_data = Nomination.safeParse(nomination);
    if (!validated_nomination_data.success) {
      return createResponse(
        "Validation Error",
        400,
        validated_nomination_data.error.errors.map((e) => e.message).join(", ")
      );
    }

    const pdfBytes = await generateNominationPDF(validated_nomination_data.data);
    uploadAndGetPdfUrl(Buffer.from(pdfBytes), params.id);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=nomination.pdf",
      },
    });
  } catch (error) {
    return createResponse("Something went wrong", 500, { error: error });
  }
}
