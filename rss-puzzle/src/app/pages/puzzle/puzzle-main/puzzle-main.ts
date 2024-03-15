import './puzzle-main.scss';
import BaseComponent from '@/app/components/base-component';
import { div, span } from '@/app/components/tags';
import type Router from '@/app/router/router';
import type { Sentence } from '@/app/utils/json-loader';
import type JsonLoader from '@/app/utils/json-loader';
import type LocalStorage from '@/app/utils/local-storage';
import PuzzleCard from './puzzle-card/puzzle-card';
import { getClosestFromEventTarget } from '@/app/utils';

export default class PuzzleMainComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private board: BaseComponent<HTMLDivElement>;

  private source: BaseComponent<HTMLDivElement>;

  private sentences: Sentence[];

  private rows: BaseComponent<HTMLDivElement>[];

  private cards: PuzzleCard[];

  private currentRow: BaseComponent<HTMLDivElement> | undefined;

  private cardRelativeWidths: number[] = [];

  private resizeObserver: ResizeObserver | null = null;

  constructor(router: Router, storage: LocalStorage, loader: JsonLoader, pageNumber: number) {
    super({ className: 'puzzle-page__main main', tag: 'main' });

    this.router = router;
    this.storage = storage;
    this.sentences = loader.getSentences(pageNumber);

    const rowNumbers = div({ className: 'main__row-numbers' }, ...this.createRowNumbers());

    this.rows = this.createRows();
    [this.currentRow] = this.rows;
    this.board = div({ className: 'main__board' }, ...this.rows);
    this.cards = this.createCards(0);
    this.source = div({ className: 'main__source main__source--start' });
    this.createCardPlaces();
    this.addCardHandlers();

    this.appendChildren([rowNumbers, this.board, this.source]);

    this.setCardsWidth();
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.board.getNode());
  }

  private createRows(): BaseComponent<HTMLDivElement>[] {
    return this.sentences.map(() => div({ className: 'main__row' }));
  }

  private createRowNumbers(): BaseComponent<HTMLSpanElement>[] {
    return this.sentences.map((_, index) => span({ className: 'main__row-number', textContent: `${index + 1}` }));
  }

  private createCards(sentenceNumber: number): PuzzleCard[] {
    const sentence = this.sentences[sentenceNumber]?.textExample;

    if (!sentence) {
      throw new Error(`Can't find sentence number ${sentenceNumber}`);
    }

    const sentenceWords = sentence.split(' ');

    return sentenceWords.map((word, index) => new PuzzleCard(word, index, 'main__card card--active'));
  }

  private getShuffledCards(): PuzzleCard[] {
    const cardsArray = this.cards;

    for (let index = cardsArray.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const currentCard = cardsArray[index];
      const randomCard = cardsArray[randomIndex];

      if (!currentCard || !randomCard) {
        throw new Error(`Can't find card number ${index} or ${randomIndex}`);
      }

      [cardsArray[index], cardsArray[randomIndex]] = [randomCard, currentCard];
    }

    return cardsArray;
  }

  private createCardPlaces(): void {
    this.getShuffledCards().forEach((card) => {
      this.currentRow?.append(div({ className: 'main__row-place' }));

      this.source.append(div({ className: 'main__source-place' }, card));
    });
  }

  private setCardsWidth(): void {
    setTimeout(() => {
      const boardWidth = this.board.getNode().offsetWidth;
      const cardWidths = this.cards.map((card) => card.getNode().offsetWidth);
      this.cardRelativeWidths = cardWidths.map((cardWidth) => cardWidth / boardWidth);

      this.cards.forEach((card, index) => {
        const currentCardNode = card.getNode();

        currentCardNode.style.width = `${cardWidths[index]}px`;
      });

      this.source.removeClass('main__source--start');
    }, 0);
  }

  private addCardHandlers(): void {
    this.source.addListener('click', (evt) => {
      const cardNode = getClosestFromEventTarget(evt, '.main__card');

      if (cardNode) {
        const card = this.cards.find((cardInstance) => cardNode === cardInstance.getNode());

        if (!card) {
          throw new Error(`Can't find card`);
        }

        this.source.getChildren().forEach((place) => {
          if (place instanceof BaseComponent && place.hasChild(card)) {
            place.removeChild(card);
          }
        });

        if (!this.currentRow) {
          throw new Error(`Can't find current row`);
        }

        const children = this.currentRow.getChildren();

        for (let i = 0; i < children.length; i += 1) {
          const place = children[i];

          if (place instanceof BaseComponent && !place.hasChildren()) {
            place.append(card);
            place.addClass('main__row-place--full');
            break;
          }
        }
      }
    });
  }

  private handleResize = (entries: ResizeObserverEntry[]): void => {
    if (!entries[0]) {
      return;
    }

    const boardWidth = entries[0].contentRect.width;

    this.cards.forEach((card, index) => {
      const cardRelativeWidth = this.cardRelativeWidths[index];

      if (cardRelativeWidth) {
        const newCardWidth = boardWidth * cardRelativeWidth;
        const currentCardNode = card.getNode();

        currentCardNode.style.width = `${newCardWidth}px`;
      }
    });
  };
}
