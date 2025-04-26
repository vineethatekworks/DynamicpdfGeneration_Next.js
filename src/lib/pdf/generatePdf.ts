// deno-lint-ignore-file

import { Nomination_valid } from "@/types/nomination";
import fs from "node:fs";
import { PDFDocument } from "pdf-lib";
export async function generateNominationPDF(nomination: Nomination_valid): Promise<Uint8Array> {
  try {
    // Load the template PDF
    const templateBytes = fs.readFileSync("multiformpdftemplate (1).pdf");
    console.log(templateBytes);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    const fields = form.getFields();
    console.log("Fields:", fields);
    fields.forEach((field: { getName: () => any; }) => {
      const fieldName = field.getName();
      console.log("Field name:", fieldName); // Check this log to verify the field names
    });

    // Make sure the field names below match the actual field names in the PDF template
    form.getTextField("Text1").setText(nomination.name);
    form.getTextField("Text2").setText(nomination.fatherName);
    form.getTextField("Text3").setText(nomination.name);
    form.getTextField("Text4").setText(nomination.fatherName);
    form.getTextField("Text5").setText(nomination.age.toString());
    form.getTextField("Text6").setText(nomination.designation);
    form.getTextField("Text7").setText(nomination.residentialAddr);
    form.getTextField("Text8").setText(nomination.postalAddr);
    form.getTextField("Text9").setText(nomination.phoneNumber);
    form.getTextField("Text10").setText(nomination.aadhaarNumber);

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;

  } catch (error) {
    console.error("[PDF GENERATION ERROR]", error);
    throw new Error("Failed to generate PDF");
  }
}

