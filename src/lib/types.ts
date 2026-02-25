export type LanguageId = 'typescript' | 'markdown' | 'plaintext';

export interface Tab {
  id: string;
  title: string;
  content: string;
  language: LanguageId;
}

export function createTab(index: number): Tab {
  return {
    id: crypto.randomUUID(),
    title: `untitled-${index}`,
    content: '',
    language: 'plaintext',
  };
}
