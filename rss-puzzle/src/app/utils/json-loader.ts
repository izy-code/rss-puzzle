export const BASE_URL = 'https://raw.githubusercontent.com/rolling-scopes-school/rss-puzzle-data/main/';

export interface PageData {
  id: string;
  name: string;
  imageSrc: string;
  cutSrc: string;
  author: string;
  year: string;
}

export interface Sentence {
  audioExample: string;
  textExample: string;
  textExampleTranslate: string;
  id: number;
  word: string;
  wordTranslate: string;
}

interface Page {
  levelData: PageData;
  words: Sentence[];
}

export default class JsonLoader {
  private url: string;

  private pages: Page[] = [];

  constructor(levelNumber: number) {
    this.url = `${BASE_URL}/data/wordCollectionLevel${levelNumber + 1}.json`;
  }

  public loadPages(): Promise<void> {
    return fetch(this.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load JSON: ${response.statusText}`);
        }

        return response.json();
      })
      .then((levelData: { rounds: Page[] }) => {
        this.pages = levelData.rounds;
      });
  }

  public getPagesCount(): number {
    return this.pages.length;
  }

  public getPageData(pageNumber: number): PageData {
    const pageData = this.pages[pageNumber]?.levelData;

    if (!pageData) {
      throw new Error(`Can't find data for page number ${pageNumber}`);
    }

    return pageData;
  }

  public getSentences(pageNumber: number): Sentence[] {
    const sentenceData = this.pages[pageNumber]?.words;

    if (!sentenceData) {
      throw new Error(`Can't find sentences for page number ${pageNumber}`);
    }

    return sentenceData;
  }
}
