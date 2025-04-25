import { verifyToken } from "../../../../auth/verifyToken.ts";
import { prisma } from "../../../../lib/dbconfig/prisma.ts";
import { step1Schema } from "../../../../types/nomination.ts";
import { createResponse } from "../../../../utils/responseHelper.ts";


export async function POST(req: Request) {
    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    let data;
    try {
        data = await req.json();
    } catch {
        return createResponse("Invalid JSON", 400);
    }


    // Zod Validation
    const validated_data = step1Schema.safeParse(data);


    if (!validated_data.success) {
        return createResponse("Validation Error",400,validated_data.error.errors.map((e) => e.message).join(", "));   
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

    return createResponse("Fill the next feilds to complete nomination", 201, {nominationid: nomination.id});
}
