export interface Presentation {
  greeting: string;
  subtitle: string;
  linkedIn: string;
  cvDownload: string;
}
export interface SectionTitles {
  professionalExperience: string;
  technologies: string;
  aboutMe: string;
}

export interface ExperienceItemI {
  date: string;
  title: string;
  company: string;
  companyDescription: string;
  image: string;
  imageAlt: string;
  jobDescription: string;
}
export interface TechnologyItem {
  id: string;
  descriptionItems: string[];
}

export interface Translation {
  seo: { title: string; description: string };
  presentation: Presentation;
  sectionTittles: SectionTitles;
  experienceItems: ExperienceItemI[];
  technologyItems: TechnologyItem[];
  textAboutMe: string;
  footerNote: string;
}
