import { verifyToken } from '@/auth/verifyToken';
import { uploadAndGetPdfUrl } from '@/lib/config/AwsS3Config';
import { prisma } from '@/lib/config/prisma';
import { generatePdf } from '@/lib/pdf/generatepdfhtml';
import { Nomination } from '@/types/nomination';
import { createResponse } from '@/utils/responseHelper';

export async function GET(req: Request, context: { params: { id: string } }) {
   
  
    try {
        const { id } = context.params;
        const authResult = await verifyToken(req);
        if (authResult instanceof Response) return authResult;

        // Get nomination for this user
        const nomination = await prisma.nomination.findUnique({where: { id:id }});

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
        
        console.log('uploading to s3...');
        uploadAndGetPdfUrl(pdfBuffer, id)
            .then(() => console.log('PDF uploaded to S3'))
            .catch((error) => console.error('Failed to upload PDF to S3:', error));

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
