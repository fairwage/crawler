import axios, { AxiosResponse } from 'axios';
const BASE_URL = 'https://stackoverflow.com';

export async function request(url) {
  const req: AxiosResponse = await axios(`${BASE_URL}${url}`);

  if (req.status === 200) {
    return Promise.resolve(req.data);
  }

  return Promise.resolve(null);
}

export async function requestListPage(country): Promise<string> {
  const reqUrl = `/jobs?l=${country}`;
  return request(reqUrl);
}
