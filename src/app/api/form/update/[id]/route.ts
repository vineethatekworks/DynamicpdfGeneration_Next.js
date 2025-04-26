// deno-lint-ignore-file

import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/config/prisma";
import { step2Schema } from "@/types/nomination";
import { createResponse } from "@/utils/responseHelper";
import { NextRequest } from "next/server";



export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const authResult = await verifyToken(req);
        if (authResult instanceof Response) return authResult;

        const nominationid = params.id;

        let data;

        data = await req.json();

        // Validate input using Zod
        const validated_data = step2Schema.safeParse(data);

        if (!validated_data.success) {
            return createResponse("Validation Error", 400, validated_data.error.errors.map((e) => e.message).join(", "));
        }

        const { designation, residentialAddr, postalAddr, phoneNumber, aadhaarNumber } = validated_data.data;

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

        return createResponse("Nomination updated successfully u can preview or generate pdf now", 200, { nominationid: updatedNomination.id });

    } catch (error) {
        console.error("[UPDATE ERROR]", error);
        return createResponse("Nomination update failed", 500);
    }
}
