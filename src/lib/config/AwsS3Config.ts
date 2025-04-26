import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import process from "node:process";


// Directly provide AWS credentials and region in the code
const s3 = new S3Client({
    region: "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const BUCKET_NAME = "s3-nomination-forms";

export async function uploadAndGetPdfUrl(pdfBuffer: Buffer, formId: string): Promise<void> {
    const key = `pdfs/${formId}.pdf`;

    try {
        // Upload the PDF to the S3 bucket
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                Body: pdfBuffer,
                ContentType: "application/pdf",
            })
        );

    } catch (error) {
        console.error("Error uploading PDF to S3:", error);
        throw new Error("Failed to upload PDF to S3");
    }
}

export async function getPDFFromS3(formId: string): Promise<Buffer | null> {
  const pdfKey = `pdfs/${formId}.pdf`;

  try {
    const command = new GetObjectCommand({
      Bucket: "s3-nomination-forms",
      Key: pdfKey,
    });

    const response = await s3.send(command);
    const stream = response.Body as Readable;

    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks); 
  } catch (err) {
    console.error("Failed to download PDF:", err);
    return null; 
  }
}