import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
});

export const parseMarkdown = async (content: string): Promise<string> => {
  return marked(content);
};
