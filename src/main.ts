/* eslint-disable @typescript-eslint/no-unused-vars */
//import * as cron from 'node-cron';
/* import { fetchOffersList } from './parsers/stackoverflow';
import { delayedPromise } from './helpers/request';
import { PROMISE_TIMEOUT } from './helpers/request'; */
import * as db from './db';

export const AVAILABLE_COUNTRIES = ['germany', 'france'];

/* async function run() {
  const requests = AVAILABLE_COUNTRIES.map((country, i) =>
    delayedPromise(
      () => fetchOffersList({ country, pages: 1 }),
      PROMISE_TIMEOUT * (i + 1),
    ),
  );

  const results = await Promise.all(requests);

  console.log('##offers', JSON.stringify(results));
} */

//run();
db.connectDb();
/* cron.schedule('* * * * *', async function () {
  const jobs = await requestPage('germany');

  console.log('##jobs', jobs);
});
 */
