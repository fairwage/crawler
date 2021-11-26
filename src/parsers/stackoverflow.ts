import cheerio, { CheerioAPI, Cheerio, Node } from 'cheerio';
import { requestListPage, request } from '../helpers/request';

const JOB_LIST_SELECTOR = '.listResults > .js-result';

// TODO move constants into a separate file
const CURRENCIES = { '€': 'EUR', '£': 'LB' };

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  salary: Array<string>;
  currency: string;
  mainTechnologies: Array<string>;
  description?: string;
  jobLevel?: string;
}

function findDescriptionInfo(offer: Cheerio<Node>) {
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

function findTechStack($: CheerioAPI, offer: Cheerio<Node>) {
  const mainTechnologies = [];
  offer.find('.ps-relative > a').each((_, item) => {
    const tech = $(item).text();
    mainTechnologies.push(tech);
  });

  return { mainTechnologies };
}

export function parseListPage(page: string): JobOffer[] {
  const $: CheerioAPI = cheerio.load(page);
  const _elements = $(JOB_LIST_SELECTOR);
  const jobList = [];

  _elements.each((_, val) => {
    const el = $(val);
    const descriptionInfo = findDescriptionInfo(el);
    const mainTechnologies = findTechStack($, el);
    jobList.push({ ...descriptionInfo, ...mainTechnologies });
  });

  return jobList;
}

function parseSinglePage(
  page: string,
  offer: JobOffer,
): { description: string; jobLevel: string } {
  const $: CheerioAPI = cheerio.load(page);

  const jobContent = $('#overview-items');
  const description = jobContent.find('.mb32.fc-medium.fs-body2').text().trim();
  const levelsRegex = `(JUNIOR|SENIOR|MID|LEAD)`;

  const jobLevel = offer.title.toUpperCase().match(levelsRegex);

  return {
    description,
    jobLevel: jobLevel?.[0],
  };
}

export async function fetchSingleOffer(offer: JobOffer) {
  const singlePage = await request(offer.link);
  const parsedInfo = parseSinglePage(singlePage, offer);

  return {
    ...offer,
    ...parsedInfo,
  };
}

// This method fetches stackoverflow's job homepage.
// and it also fetches the job offer single page
// in order to get the description and the job level
export async function fetchOffersList(country: string): Promise<JobOffer[]> {
  const page = await requestListPage(country);
  const list = parseListPage(page);

  // We can't make a mapping callback async,
  // so we turn the list into an array of promises
  const offersList = await Promise.all(
    list.map(async (item) => {
      const single = await fetchSingleOffer(item);

      return {
        ...item,
        ...single,
      };
    }),
  );

  return offersList;
}
