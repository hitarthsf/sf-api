import fs from "fs";
import hbs from "handlebars";

//Render HTML template with given data and return the HTML string
export function renderTemplate(data, templateName) {
  const html = fs.readFileSync(
    process.cwd() + "/templates/"+templateName+".hbs",
    "utf8"
  );

  //Create Handlebar template object
  const template = hbs.compile(html);
  
  //Render HTML template with given data
  const rendered = template(data);

  return rendered;
}