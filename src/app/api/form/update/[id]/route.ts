// deno-lint-ignore-file


import { verifyToken } from "../../../../../auth/verifyToken.ts";
import { prisma } from "../../../../../lib/dbconfig/prisma.ts";
import { step2Schema } from "../../../../../types/nomination.ts";
import { createResponse } from "../../../../../utils/responseHelper.ts";

export async function PUT(req: Request, { params }: { params: { id: string } }) {

    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    const nominationid = params.id;

    let data;
    try {
        data = await req.json();
    } catch {
        return createResponse("Invalid JSON", 400);
    }

    // Validate input using Zod
    const validated_data = step2Schema.safeParse(data);

    if (!validated_data.success) {
        return createResponse("Validation Error", 400, validated_data.error.errors.map((e) => e.message).join(", "));
    }

    const { designation, residentialAddr, postalAddr, phoneNumber, aadhaarNumber } = validated_data.data;

    try {
        const updatedNomination = await prisma
            .nomination
            .update({
                where: { id: nominationid },
                data: {
                    designation,
                    residentialAddr,
                    postalAddr,
                    phoneNumber,
                    aadhaarNumber,
                },
            });

        return createResponse("Nomination updated successfully u can preview or generate pdf now", 200, {nominationid:updatedNomination.id});

    } catch (error) {
        console.error("[UPDATE ERROR]", error);
        return createResponse("Nomination update failed", 500);
    }
}
