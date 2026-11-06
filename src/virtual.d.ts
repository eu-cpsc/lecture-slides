declare module 'virtual:lecture-slides/config' {
  const config: {
    course: {
      code: string;
      title: string;
      term: string;
      instructor: string;
      blurb: string;
      links: { label: string; href: string }[];
    };
    brand: string;
    logo: string | null;
    logoOnDark: string | null;
    favicon: string | null;
  };
  export default config;
}
declare module 'virtual:lecture-slides/custom-css' {}
