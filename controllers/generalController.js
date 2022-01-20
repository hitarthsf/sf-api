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
    path: process.cwd()+'/my-report.pdf',
    displayHeaderFooter: true,
    headerTemplate: '<div style="padding-right:15px;font-weight:bold;-webkit-print-color-adjust: exact; width:100%"><p style="font-size:12px; color: black; float:right;">MONTHLY DATA REPORT<br><span style="font-size:10px;--tw-text-opacity:1;color:rgba(110,37,127,var(--tw-text-opacity));font-weight:bold;">September 2021</span></p></div>',
    footerTemplate: '<div style="font-size: 5px; margin-left: 10px;" class="pageNumber"></div>',
    margin: {
      bottom: 70, // minimum required for footer msg to display
      // left: 25,
      // right: 25,
      top: 72,
    }
  })

  // close the browser
  await browser.close()

  res.status(201).json('PDF created');
};
