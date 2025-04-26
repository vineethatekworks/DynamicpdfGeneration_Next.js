import { verifyToken } from "@/auth/verifyToken";
import { prisma } from "@/lib/config/prisma";
import { step1Schema } from "@/types/nomination";
import { createResponse } from "@/utils/responseHelper";

export async function POST(req: Request) {
    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    try {
        const data = await req.json();

        // Zod Validation
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

        return createResponse("Fill the next feilds to complete nomination", 201, { nominationid: nomination.id });
    } catch (error) {
        return createResponse("Something went wrong", 500,{error:error});
    }
}
