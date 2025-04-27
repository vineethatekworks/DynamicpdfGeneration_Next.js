import { verifyToken } from '@/auth/verifyToken';
import { uploadAndGetPdfUrl } from '@/lib/config/AwsS3Config';
import { prisma } from '@/lib/config/prisma';
import { generatePdf } from '@/lib/pdf/generatepdfhtml';
import { Nomination } from '@/types/nomination';
import { createResponse } from '@/utils/responseHelper';
import { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/form/htmlpdf/{id}:
 *   get:
 *     summary: Generate and download Nomination PDF
 *     description: Fetch a nomination by ID, validate it, generate a PDF, upload it to S3 asynchronously, and return the PDF as response.
 *     tags:
 *       - Nomination
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the nomination
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF generated and returned successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Validation error in nomination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Nomination not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error during PDF generation or upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *     security:
 *       - bearerAuth: []
 */

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const authResult = await verifyToken(req);
    if (authResult instanceof Response) return authResult;

    // Get nomination for this user
    const nomination = await prisma.nomination.findUnique({ where: { id: id } });

    if (!nomination) {
      return createResponse("Nomination not found", 404);
    }

    // Validate all fields after getting
    const validated_nomination_data = Nomination.safeParse(nomination);
    if (!validated_nomination_data.success) {
      return createResponse(
        "Validation Error",
        400,
        validated_nomination_data.error.errors.map((e) => e.message).join(", ")
      );
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
