import { verifyToken } from '@/auth/verifyToken';
import { prisma } from '@/lib/dbconfig/prisma';
import { generatePdf } from '@/lib/pdf/generatepdfhtml';
import { Nomination } from '@/types/nomination';
import { createResponse } from '@/utils/responseHelper';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {

        const authResult = await verifyToken(req);
        if (authResult instanceof Response) return authResult;

        // Get nomination for this user
        const nomination = await prisma.nomination.findUnique({where: { id: params.id }});

        if (!nomination) {
            return createResponse("Nomination not found", 404);
        }

        // Validate all fields after getting
        const validated_nomination_data = Nomination.safeParse(nomination);
        if (!validated_nomination_data.success) {
            return createResponse("Validation Error", 400, validated_nomination_data.error.errors.map((e) => e.message).join(", "));
        }

        const data = validated_nomination_data.data;
        const pdfBuffer = await generatePdf(data);

        console.log('Sending PDF response...');
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="nomination.pdf"',
                'Content-Length': pdfBuffer.length.toString(),
            },
            status: 200,
        });
    } catch (error) {
        return createResponse('PDF generation failed', 500, error as string);
    }
}
