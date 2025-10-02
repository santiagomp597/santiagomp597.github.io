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
  gameTime: string;
}

export interface SnakeGameSection {
  message: string;
  description: string;
}

export interface ExperienceItem {
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
  sectionTitles: SectionTitles;
  experienceItems: ExperienceItem[];
  technologyItems: TechnologyItem[];
  textAboutMe: string;
  snakeGameSection: SnakeGameSection;
  footerNote: string;
}
