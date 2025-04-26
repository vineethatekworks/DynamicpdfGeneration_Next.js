import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/dbconfig/prisma";
import { generateNominationPDF } from "@/lib/pdf/generatePdf";
import { Nomination } from "@/types/nomination";
import { createResponse } from "@/utils/responseHelper";


export async function GET(req: Request, { params }: { params: { id: string } }) {
  const authResult = await verifyToken(req);
  if (authResult instanceof Response) return authResult;

  // Get nomination for this user
  const nomination = await prisma.nomination.findUnique({
    where: { id: params.id },
  });

  if (!nomination) {
    return createResponse("Nomination not found", 404);
  }

  // validate all feilds after getting
  const validated_nomination_data = Nomination.safeParse(nomination);
  if (!validated_nomination_data.success) {
    return createResponse("Validation Error", 400, validated_nomination_data.error.errors.map((e) => e.message).join(", "));
  }

  const pdfBytes = await generateNominationPDF(validated_nomination_data.data);

  return new Response(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=nomination.pdf",
    },
  });
}
