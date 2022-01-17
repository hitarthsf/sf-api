import puppeteer from "puppeteer";
import fs from "fs"
import hbs from "handlebars"
import { renderTemplate } from "../render-templates.js"

export const generateReportPdf = async (req, res) => {
  // launch a new chrome instance
  const browser = await puppeteer.launch({
    headless: true,
  });

  // create a new page
  const page = await browser.newPage();

  // set your html as the pages content
  const htmlContent = renderTemplate(res.body, 'pdfs/report')  
  await page.setContent(htmlContent, {
    waitUntil: "domcontentloaded",
  });

  // create a pdf buffer
  const pdfBuffer = await page.pdf({
    format: 'A4'
  })

  // or a .pdf file
  await page.pdf({
    format: 'A4',
    path: process.cwd()+'/my-report.pdf'
  })

  // close the browser
  await browser.close()

  res.status(201).json('PDF created');
};
