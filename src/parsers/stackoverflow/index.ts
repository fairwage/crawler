import {
  requestListPage,
  request,
  delayedPromise,
  PROMISE_TIMEOUT,
} from '../../helpers/request';
import { JobOffer } from './interfaces';
import { parseSinglePage, parseListPage } from './handlers';

// Enhances the job offer with extra fields
// that can only be found in the offer single page.
export async function fetchSingleOffer(offer: JobOffer): Promise<JobOffer> {
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
export async function fetchOffersList({
  country,
  pages,
}: {
  country: string;
  pages: number;
}): Promise<JobOffer[]> {
  const fetchPage = async (offset) => {
    const page = await requestListPage(country, offset);
    const list = parseListPage(page, country);

    // We can't make a mapping callback async,
    // so we turn the list into an array of promises
    const offersList = (await Promise.all(
      list.map(async (item, i) =>
        // Makes sure to delay the requests
        // so we don't hit the rate limit wall
        delayedPromise(() => fetchSingleOffer(item), PROMISE_TIMEOUT * (i + 1)),
      ),
    )) as JobOffer[];

    return Promise.resolve(offersList);
  };

  // Calls all page fetching promises
  const list = await Promise.all(
    [...new Array(pages)].map(async (_, offset) => fetchPage(offset + 1)),
  );

  return Promise.resolve(list.flat());
}
