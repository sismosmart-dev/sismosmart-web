export type PageMeta = {
  title: string;
  description: string;
};

export type PageCard = {
  title: string;
  description: string;
};

export type PageStat = {
  label: string;
  value: string;
};

export type ComparisonRow = {
  label: string;
  sismosmart: string;
  traditional: string;
  mobile: string;
};

export type TimelineItem = {
  period: string;
  title: string;
  description: string;
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export type ContactChannel = {
  title: string;
  description: string;
  value: string;
  href: string;
};

export type ContactFormCopy = {
  nameLabel: string;
  emailLabel: string;
  subjectLabel: string;
  messageLabel: string;
  buttonLabel: string;
  consentLabel: string;
  note: string;
  loadingLabel: string;
  successMessage: string;
  errorMessage: string;
  missingEndpointMessage: string;
  rateLimitedMessage: string;
};

export type ProductPageCopy = {
  meta: PageMeta;
  eyebrow: string;
  title: string;
  description: string;
  deviceDescription: string;
  meterTopLabel: string;
  meterTopValue: string;
  meterBottomLabel: string;
  meterBottomValue: string;
  imageAlt: string;
  specs: PageStat[];
  useCases: PageCard[];
  comparisonTitle: string;
  comparisonDescription: string;
  comparisonRows: ComparisonRow[];
  ctaLabel: string;
  ctaHref: string;
};

export type HowItWorksPageCopy = {
  meta: PageMeta;
  eyebrow: string;
  title: string;
  description: string;
  flow: PageCard[];
  signals: PageCard[];
  network: PageCard[];
};

export type AboutPageCopy = {
  meta: PageMeta;
  eyebrow: string;
  title: string;
  description: string;
  story: string[];
  principles: PageCard[];
  timeline: TimelineItem[];
  team: TeamMember[];
};

export type ContactPageCopy = {
  meta: PageMeta;
  eyebrow: string;
  title: string;
  description: string;
  channels: ContactChannel[];
  form: ContactFormCopy;
};

export type InfoPageCopy = {
  meta: PageMeta;
  eyebrow: string;
  title: string;
  description: string;
  sections: PageCard[];
  links?: Array<PageCard & { href: string }>;
};

export type BaseRoutePagesCopy = {
  product: ProductPageCopy;
  howItWorks: HowItWorksPageCopy;
  about: AboutPageCopy;
  contact: ContactPageCopy;
  privacy: InfoPageCopy;
  terms: InfoPageCopy;
  press: InfoPageCopy;
};

export type RoutePagesCopy = BaseRoutePagesCopy & {
  technology: InfoPageCopy;
  pilotProgram: InfoPageCopy;
  investors: InfoPageCopy;
  faq: InfoPageCopy;
  security: InfoPageCopy;
  glossary: InfoPageCopy;
};
