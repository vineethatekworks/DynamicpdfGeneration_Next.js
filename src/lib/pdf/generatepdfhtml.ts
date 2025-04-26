import fs from "node:fs/promises";
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { Buffer } from 'node:buffer'; // Important for correct Buffer usage

export const generatePdf = async (data: any): Promise<Buffer> => {
  try {
    const templateHtml = await fs.readFile('src/templates/template.html', 'utf8');
    const template = Handlebars.compile(templateHtml);
    const html = template(data);
   
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
   
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    return Buffer.from(pdf) as Buffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF generation failed.');
  }
};
