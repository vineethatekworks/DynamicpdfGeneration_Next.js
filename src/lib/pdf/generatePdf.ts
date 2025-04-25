import fs from "node:fs";
import { Nomination_valid } from "../../types/nomination.ts";
const { PDFDocument } = require("pdf-lib");
export async function generateNominationPDF(nomination: Nomination_valid): Promise<Uint8Array> {
  try {
    // Load the template PDF
    const templateBytes = fs.readFileSync("multiformpdftemplate.pdf");
    console.log(templateBytes);
    const pdfDoc = await PDFDocument.load(templateBytes);
    console.log("pdfDoc",pdfDoc);
    const form = pdfDoc.getForm();

    console.log("form",form);
    // Log the form field names to debug
    const fields = form.getFields();
    console.log("Fields:", fields);
    fields.forEach((field: { getName: () => any; }) => {
      const fieldName = field.getName();
      console.log("Field name:", fieldName); // Check this log to verify the field names
    });

    // Make sure the field names below match the actual field names in the PDF template
    form.getTextField("Text1").setText(nomination.name);
    form.getTextField("fatherName").setText(nomination.fatherName);
    form.getTextField("age").setText(nomination.age.toString());
    form.getTextField("email").setText(nomination.email);
    form.getTextField("designation").setText(nomination.designation);
    form.getTextField("residentialAddr").setText(nomination.residentialAddr);
    form.getTextField("postalAddr").setText(nomination.postalAddr);
    form.getTextField("phoneNumber").setText(nomination.phoneNumber);
    form.getTextField("aadhaarNumber").setText(nomination.aadhaarNumber);

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;

  } catch (error) {
    console.error("[PDF GENERATION ERROR]", error);
    throw new Error("Failed to generate PDF");
  }
}

