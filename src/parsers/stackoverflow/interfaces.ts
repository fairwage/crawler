export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  salary: Array<string>;
  currency: string;
  mainTechnologies: Array<string>;
  country: string;
  description?: string;
  jobLevel?: string;
}
