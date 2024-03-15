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

interface Level {
  levelData: PageData;
  words: Sentence[];
}

export default class JsonLoader {
  private url: string;

  private levels: Level[] = [];

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
      .then((data: { rounds: Level[] }) => {
        this.levels = data.rounds;
      });
  }

  public getLevelData(pageNumber: number): PageData {
    const levelData = this.levels[pageNumber]?.levelData;

    if (!levelData) {
      throw new Error(`Can't find level data for level number ${pageNumber}`);
    }

    return levelData;
  }

  public getSentences(pageNumber: number): Sentence[] {
    const sentenceData = this.levels[pageNumber]?.words;

    if (!sentenceData) {
      throw new Error(`Can't find sentences for level number ${pageNumber}`);
    }

    return sentenceData;
  }
}
