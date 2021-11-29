import axios, { AxiosResponse } from 'axios';

const BASE_URL = 'https://stackoverflow.com';
export const PROMISE_TIMEOUT = 2000;

export async function request(url) {
  try {
    console.log('[+] gonna fetch ', url);
    const req: AxiosResponse = await axios(`${BASE_URL}${url}`);

    if (req.status === 200) {
      return Promise.resolve(req.data);
    }
  } catch (err) {
    console.error('axios error: '), err;
    return Promise.resolve(null);
  }
}

export async function requestListPage(
  country: string,
  offset = 1,
): Promise<string> {
  const reqUrl = `/jobs?l=${country}&pg=${offset}`;
  return request(reqUrl);
}

export function delayedPromise(cb, timeout = PROMISE_TIMEOUT) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const res = await cb();

      if (res) {
        resolve(res);
      }
    }, timeout);
  });
}
