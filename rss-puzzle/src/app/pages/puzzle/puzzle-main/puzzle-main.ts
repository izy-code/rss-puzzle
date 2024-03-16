import './puzzle-main.scss';
import BaseComponent from '@/app/components/base-component';
import { div, span } from '@/app/components/tags';
import type Router from '@/app/router/router';
import type { Sentence } from '@/app/utils/json-loader';
import type JsonLoader from '@/app/utils/json-loader';
import type LocalStorage from '@/app/utils/local-storage';
import PuzzleCard from './puzzle-card/puzzle-card';
import { assertIsDefined, getClosestFromEventTarget } from '@/app/utils';
import ButtonComponent from '@/app/components/button/button';
import { Pages } from '@/app/router/pages';

const START_OPACITY_TRANSITION_TIME_MS = 600;
const SENTENCE_OPACITY_TRANSITION_TIME_MS = 100;

export default class PuzzleMainComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private sentences: Sentence[];

  private currentSentenceNumber = 0;

  private listeners: Record<string, EventListener> = {};

  private rows: BaseComponent<HTMLDivElement>[];

  private board: BaseComponent<HTMLDivElement>;

  private source = div({ className: 'main__source main__source--start' });

  private currentRow = new BaseComponent<HTMLDivElement>({});

  private continueButton = ButtonComponent({
    className: 'main__continue-button button',
    textContent: 'Continue',
    buttonType: 'button',
  });

  private cards: PuzzleCard[] = [];

  private resizeObserver: ResizeObserver | null = null;

  private isCardsSizeSet = false;

  private pageNumber: number;

  private levelNumber: number;

  constructor(router: Router, storage: LocalStorage, loader: JsonLoader, levelNumber: number, pageNumber: number) {
    super({ className: 'puzzle-page__main main', tag: 'main' });

    this.router = router;
    this.storage = storage;
    this.pageNumber = pageNumber;
    this.levelNumber = levelNumber;

    this.sentences = loader.getSentences(pageNumber);
    this.rows = this.createRows();
    this.board = div({ className: 'main__board' }, ...this.rows);

    const rowNumbers = div({ className: 'main__row-numbers' }, ...this.createRowNumbers());
    const buttonsContainer = div({ className: 'main__buttons-container' });

    this.continueButton.setAttribute('disabled', '');
    buttonsContainer.append(this.continueButton);

    this.appendChildren([rowNumbers, this.board, this.source, buttonsContainer]);

    setTimeout(() => this.showSentence(this.currentSentenceNumber), START_OPACITY_TRANSITION_TIME_MS);

    this.continueButton.addListener('click', this.onContinueButtonClick);
  }

  private showSentence(sentenceNumber: number): void {
    if (this.listeners.onSourceClick && this.listeners.onCurrentRowClick) {
      this.source.removeListener('click', this.listeners.onSourceClick);
      this.currentRow.removeListener('click', this.listeners.onCurrentRowClick);
    }

    this.source.addClass('main__source--start');

    const currentRow = this.rows[sentenceNumber];

    assertIsDefined(currentRow);
    this.currentRow = currentRow;
    this.cards = this.createCards(sentenceNumber);
    this.createCardPlaces();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.setCardsWidth();
    this.resizeObserver = new ResizeObserver(this.handleBoardResize.bind(this));
    this.resizeObserver?.observe(this.board.getNode());

    this.listeners.onSourceClick = this.createCardMovementCurryHandler(this.source, this.currentRow);
    this.listeners.onCurrentRowClick = this.createCardMovementCurryHandler(this.currentRow, this.source);

    this.source.addListener('click', this.listeners.onSourceClick);
    this.currentRow.addListener('click', this.listeners.onCurrentRowClick);
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
    this.source.removeNodeChildren();

    this.getShuffledCards().forEach((card) => {
      this.currentRow.append(div({ className: 'main__row-place' }));

      this.source.append(div({ className: 'main__source-place' }, card));
    });
  }

  private setCardsWidth(): void {
    const cardWidths = this.cards.map((card) => card.getNode().offsetWidth);
    const boardWidth = this.board.getNode().offsetWidth;

    this.cards.forEach((card, index) => {
      const cardWidth = cardWidths[index];

      if (!cardWidth) {
        return;
      }

      const currentCardNode = card.getNode();

      currentCardNode.style.width = `${cardWidths[index]}px`;
      card.setRelativeWidth(cardWidth / boardWidth);
    });

    this.source.removeClass('main__source--start');
    this.isCardsSizeSet = true;
  }

  private createCardMovementCurryHandler =
    (source: BaseComponent, target: BaseComponent): EventListener =>
    (evt: Event) => {
      const card = this.getMovedCard(evt, source);

      if (!card) {
        return;
      }

      const children = target.getChildren();

      for (let i = 0; i < children.length; i += 1) {
        const place = children[i];

        if (place instanceof BaseComponent && !place.hasChildren()) {
          place.append(card);

          if (place.containsClass('main__row-place')) {
            place.addClass('main__row-place--full');

            if (this.checkSentenceOrder()) {
              this.continueButton.removeAttribute('disabled');
            }
          }

          break;
        }
      }
    };

  private getMovedCard(evt: Event, source: BaseComponent): PuzzleCard | null {
    const cardNode = getClosestFromEventTarget(evt, '.main__card');

    if (!cardNode) {
      return null;
    }

    const card = this.cards.find((cardInstance) => cardNode === cardInstance.getNode());

    if (!card) {
      throw new Error(`Can't find card`);
    }

    source.getChildren().forEach((place) => {
      if (place instanceof BaseComponent && place.hasChild(card)) {
        place.removeChild(card);

        if (place.containsClass('main__row-place')) {
          place.removeClass('main__row-place--full');
          this.continueButton.setAttribute('disabled', '');
        }
      }
    });

    return card;
  }

  private checkSentenceOrder(): boolean {
    const cardPlaces = this.currentRow.getChildren();

    for (let index = 0; index < cardPlaces.length; index += 1) {
      const place = cardPlaces[index];

      if (!(place instanceof BaseComponent) || !place.containsClass('main__row-place--full')) {
        return false;
      }

      const cardInPlace = place.getChildren()[0];

      if (!(cardInPlace instanceof PuzzleCard) || cardInPlace.getOrder() !== index) {
        return false;
      }
    }

    return true;
  }

  private handleBoardResize(entries: ResizeObserverEntry[]): void {
    if (!entries[0] || !this.isCardsSizeSet) {
      return;
    }

    const boardWidth = entries[0].contentRect.width;

    this.handleFilledSentences(boardWidth);

    let sumWidth = 0;

    this.cards.forEach((card) => {
      const newCardWidth = Math.floor(boardWidth * card.getRelativeWidth());
      const currentCardNode = card.getNode();

      sumWidth += newCardWidth;
      currentCardNode.style.width = `${newCardWidth}px`;

      if (this.cards.at(-1) === card) {
        currentCardNode.style.width = `${newCardWidth + (boardWidth - sumWidth)}px`;
      }
    });
  }

  private handleFilledSentences = (boardWidth: number): void => {
    for (let sentenceNumber = 0; sentenceNumber < this.currentSentenceNumber; sentenceNumber += 1) {
      const row = this.rows[sentenceNumber];
      let sumWidth = 0;

      row?.getChildren().forEach((place) => {
        if (!(place instanceof BaseComponent)) {
          throw new TypeError(`Wrong place type`);
        }

        const card = place.getChildren()[0];

        if (!(card instanceof PuzzleCard)) {
          throw new TypeError(`Wrong card type`);
        }

        const calculatedWidth = Math.floor(boardWidth * card.getRelativeWidth());

        card.getNode().style.width = `${calculatedWidth}px`;
        sumWidth += calculatedWidth;

        if (row?.getChildren().at(-1) === place) {
          card.getNode().style.width = `${calculatedWidth + (boardWidth - sumWidth)}px`;
        }
      });
    }
  };

  private onContinueButtonClick = (): void => {
    if (this.currentSentenceNumber === this.sentences.length - 1) {
      this.router.navigate(`${Pages.PUZZLE}-${this.levelNumber + 1}-${this.pageNumber + 2}`);
      return;
    }

    this.currentSentenceNumber += 1;

    this.currentRow.getChildren().forEach((place) => {
      if (!(place instanceof BaseComponent)) {
        throw new TypeError(`Wrong place type`);
      }

      place.getChildren().forEach((card) => {
        if (card instanceof PuzzleCard) {
          card.removeClass('card--active');
        }
      });
    });

    setTimeout(() => this.showSentence(this.currentSentenceNumber), SENTENCE_OPACITY_TRANSITION_TIME_MS);
    this.continueButton.setAttribute('disabled', '');
  };
}
