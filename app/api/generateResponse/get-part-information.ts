
import * as cheerio from 'cheerio';

// gets the part information from the partselect website
export async function getPartInformation(args: {part_identifier: string}) {

  // fetches the html content from the partselect website
  const response = await fetch(
    `https://www.partselect.com/api/search/?searchterm=${args.part_identifier}`
  );
  const htmlContent = await response.text();
  const $ = cheerio.load(htmlContent);
  // a lot of unnecessary html content, so we only get the main div with the parts information
  const mainDiv = $('#main[role="main"][itemtype="http://schema.org/Product"]').html();

  return mainDiv || htmlContent; // Fallback to full content if div not found
}
