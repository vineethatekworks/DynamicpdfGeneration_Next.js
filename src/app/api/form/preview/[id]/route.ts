import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/dbconfig/prisma";
import { createResponse } from "@/utils/responseHelper";


export async function GET(req: Request, { params }: { params: { id: string } }) {
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
