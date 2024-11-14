import * as cheerio from 'cheerio';

// gets the appliance parts information from the partselect website
export async function getAppliancePartsInformation(args: { input: string }) {

  // fetches the html content from the partselect website
  const response = await fetch(
    `https://www.partselect.com/api/search/?searchterm=${args.input}`
  );
  const htmlContent = await response.text();
  const $ = cheerio.load(htmlContent);
  // a lot of unnecessary html content, so we only get the main div with the parts information
  const mainDiv = $('main.container').html();
  
  return mainDiv || htmlContent; // Fallback to full content if div not found
}
