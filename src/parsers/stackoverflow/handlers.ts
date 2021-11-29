import cheerio, { CheerioAPI, Cheerio, Node } from 'cheerio';
import { CURRENCIES, JOB_LIST_SELECTOR } from './constants';
import { JobOffer } from './interfaces';

export function findDescriptionInfo(offer: Cheerio<Node>) {
  const id = `SO-${offer.data('jobid')}`;
  const title = offer.find('h2').text().trim();
  const link = offer.find('h2').find('a')[0].attribs.href;
  const [company, , , , location] = offer.find('h3').text().trim().split(`\n`);
  const salaryBlock = offer.find('.fs-caption ').text().trim().split(/(€|£)/);
  const salaryRange = salaryBlock[2] ? salaryBlock[2].split('\n')[0] : null;
  const currency = salaryRange && CURRENCIES[salaryBlock[1]];
  const salary = salaryRange
    ? salaryRange.split('–').map((item) => item.replace(/\D/g, ''))
    : null;

  return {
    id,
    title,
    company,
    location,
    link,
    salary,
    currency,
  };
}

export function findTechStack($: CheerioAPI, offer: Cheerio<Node>) {
  const mainTechnologies = [];
  offer.find('.ps-relative > a').each((_, item) => {
    const tech = $(item).text();
    mainTechnologies.push(tech);
  });

  return { mainTechnologies };
}

export function parseListPage(page: string, country: string): JobOffer[] {
  const $: CheerioAPI = cheerio.load(page);
  const _elements = $(JOB_LIST_SELECTOR);
  const jobList = [];

  _elements.each((_, val) => {
    const el = $(val);
    const descriptionInfo = findDescriptionInfo(el);
    const mainTechnologies = findTechStack($, el);
    jobList.push({ ...descriptionInfo, ...mainTechnologies, country });
  });

  return jobList;
}

export function parseSinglePage(
  page: string,
  offer: JobOffer,
): { description: string; jobLevel: string } {
  const $: CheerioAPI = cheerio.load(page);
  const jobContent = $('#overview-items');
  const description = jobContent.find('.mb32.fc-medium.fs-body2').text().trim();
  const levelsRegex = `(JUNIOR|SENIOR|MID|LEAD|MANAGER|HEAD|VP|CTO)`;
  const jobLevel = offer.title.toUpperCase().match(levelsRegex);

  return {
    description,
    jobLevel: jobLevel?.[0],
  };
}
