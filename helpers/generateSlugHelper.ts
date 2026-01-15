export const generateSlug = (text: string) => {
  const date = new Date();
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
  return text + "-" + date;
};
