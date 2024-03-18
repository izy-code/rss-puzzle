import './puzzle-main.scss';
import BaseComponent from '@/app/components/base-component';
import { div, p, span } from '@/app/components/tags';
import type Router from '@/app/router/router';
import { BASE_URL, type Sentence } from '@/app/utils/json-loader';
import type JsonLoader from '@/app/utils/json-loader';
import type LocalStorage from '@/app/utils/local-storage';
import PuzzleCard from './puzzle-card/puzzle-card';
import { assertIsDefined, getClosestFromEventTarget, getClosestFromTouchEventTarget } from '@/app/utils';
import ButtonComponent from '@/app/components/button/button';
import { Pages } from '@/app/router/pages';

const START_OPACITY_TRANSITION_TIME_MS = 600;
const SENTENCE_OPACITY_TRANSITION_TIME_MS = 100;
const CARD_MOVE_TRANSITION_TIME_MS = 1500;

export default class PuzzleMainComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private sentences: Sentence[];

  private currentSentenceNumber = 0;

  private listeners: Record<string, EventListener> = {};

  private sentenceTranslation: BaseComponent<HTMLParagraphElement>;

  private pronounceButton: BaseComponent<HTMLButtonElement>;

  private rows: BaseComponent<HTMLDivElement>[];

  private board: BaseComponent<HTMLDivElement>;

  private source = div({ className: 'main__source main__source--start' });

  private currentRow = new BaseComponent<HTMLDivElement>({});

  private checkButton = ButtonComponent({
    className: 'main__check-button button',
    textContent: 'Check',
    buttonType: 'button',
  });

  private completeButton = ButtonComponent({
    className: 'main__check-button button button--cancel',
    textContent: 'Auto-Complete',
    buttonType: 'button',
  });

  private cards: PuzzleCard[] = [];

  private resizeObserver: ResizeObserver | null = null;

  private isCardsSizeSet = false;

  private pageNumber: number;

  private levelNumber: number;

  private draggedCardNode: HTMLElement | null = null;

  private currentDropPlace: Element | null = null;

  private isFirstSentenceLoad = true;

  constructor(router: Router, storage: LocalStorage, loader: JsonLoader, levelNumber: number, pageNumber: number) {
    super({ className: 'puzzle-page__main main', tag: 'main' });

    this.router = router;
    this.storage = storage;
    this.pageNumber = pageNumber;
    this.levelNumber = levelNumber;

    this.sentences = loader.getSentences(pageNumber);
    this.rows = this.createRows();
    this.board = div({ className: 'main__board' }, ...this.rows);
    this.pronounceButton = this.createPronounceButton();
    this.sentenceTranslation = p({ className: 'main__translation' });

    const rowNumbers = div({ className: 'main__row-numbers' }, ...this.createRowNumbers());
    const buttonsContainer = div({ className: 'main__buttons-container' });

    this.checkButton.setAttribute('disabled', '');
    buttonsContainer.appendChildren([this.completeButton, this.checkButton]);

    this.appendChildren([
      this.pronounceButton,
      this.sentenceTranslation,
      rowNumbers,
      this.board,
      this.source,
      buttonsContainer,
    ]);

    setTimeout(() => this.showSentence(this.currentSentenceNumber), START_OPACITY_TRANSITION_TIME_MS);

    this.checkButton.addListener('click', this.onCheckButtonClick);
    this.completeButton.addListener('click', this.onCompleteButtonClick);

    this.initConstructorListeners();
  }

  private initConstructorListeners(): void {
    document.addEventListener('mousedown', this.mouseDragHandler);
    document.addEventListener('touchstart', this.touchDragHandler);
    document.addEventListener('translation-click', () => {
      if (this.storage.getField('isTranslationOn') === true) {
        this.showTranslation();
      } else {
        this.hideTranslation();
      }
    });
    document.addEventListener('pronounce-click', () => {
      if (this.storage.getField('isPronounceOn') === true) {
        this.showPronounceButton();
      } else {
        this.hidePronounceButton();
      }
    });
  }

  private showSentence(sentenceNumber: number): void {
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

    this.listeners.onSourceClick = this.createCardMovementCurryHandler(this.currentRow);
    this.listeners.onCurrentRowClick = this.createCardMovementCurryHandler(this.source);

    this.source.addListener('click', this.listeners.onSourceClick);
    this.currentRow.addListener('click', this.listeners.onCurrentRowClick);

    this.cancelCardsDragStart();

    this.handleHintsVisibility();
    this.isFirstSentenceLoad = false;
  }

  private handleHintsVisibility(): void {
    if (this.isFirstSentenceLoad && this.storage.getField('isTranslationOn') === true) {
      this.showTranslation();
    } else if (this.storage.getField('isTranslationOn') === true) {
      this.hideTranslation();

      setTimeout(() => {
        this.showTranslation();
      }, START_OPACITY_TRANSITION_TIME_MS);
    } else {
      this.hideTranslation();
    }

    if (this.storage.getField('isPronounceOn') === true) {
      this.showPronounceButton();
    } else {
      this.hidePronounceButton();
    }
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

    sentenceWords.map((word, index) => new PuzzleCard(word, index, 'main__card card--active'));

    const resultArray: PuzzleCard[] = [];

    sentenceWords.forEach((word, index) => {
      const card = new PuzzleCard(word, index, 'main__card card--active card--key card--hole');

      if (index === 0) {
        card.removeClass('card--hole');
      } else if (index === sentenceWords.length - 1) {
        card.removeClass('card--key');
      }

      resultArray.push(card);
    });

    return resultArray;
  }

  private getShuffledCards(): PuzzleCard[] {
    const cardsArray = this.cards.slice();

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
    this.source.removeChildren();

    this.getShuffledCards().forEach((card) => {
      this.currentRow.append(div({ className: 'main__row-place drop-place' }));

      const place = div({ className: 'main__source-place drop-place' }, card);
      card.setParentPlace(place);

      this.source.append(place);
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
    (target: BaseComponent): EventListener =>
    (evt: Event) => {
      const card = this.findMovedCardComponent(evt);

      if (!card) {
        return;
      }

      const children = target.getChildren();

      for (let placeNumber = 0; placeNumber < children.length; placeNumber += 1) {
        const place = children[placeNumber];

        if (place instanceof BaseComponent && !place.hasChildren()) {
          place.append(card);
          card.setParentPlace(place);

          if (place.hasClass('main__row-place')) {
            place.addClass('main__row-place--full');
            card.setIsRightPlace(placeNumber === card.getOrder());

            if (this.isRowFilled()) {
              this.checkButton.removeAttribute('disabled');
            }
          } else {
            card.setIsRightPlace(false);
          }

          break;
        }
      }
    };

  private findMovedCardComponent(evt: Event): PuzzleCard | null {
    const clickedCardNode = getClosestFromEventTarget(evt, '.main__card');

    if (!clickedCardNode) {
      return null;
    }

    const card = this.cards.find((cardsItem) => clickedCardNode === cardsItem.getNode());

    if (!card) {
      throw new Error(`Can't find card`);
    }

    const place = card.getParentPlace();

    place.removeChild(card);
    this.removeCardsClasses();

    if (place.hasClass('main__row-place')) {
      place.removeClass('main__row-place--full');
      this.checkButton.setAttribute('disabled', '');
    }

    return card;
  }

  private onCheckButtonClick = (): void => {
    const cardPlaces = this.currentRow.getChildren();
    let isRowOrdered = true;

    for (let index = 0; index < cardPlaces.length; index += 1) {
      const place = cardPlaces[index];

      if (!(place instanceof BaseComponent)) {
        throw new Error(`Wrong place type`);
      }

      const card = place.getChildren()[0];

      if (!(card instanceof PuzzleCard)) {
        throw new TypeError(`Wrong card type`);
      }

      if (!card.getIsRightPlace()) {
        card.addClass('card--wrong');
        isRowOrdered = false;
      } else {
        card.addClass('card--right');
      }
    }

    if (isRowOrdered) {
      this.handleOrderedRow();
    }
  };

  private handleOrderedRow(): void {
    this.checkButton.setTextContent('Continue');
    this.checkButton.addClass('button--continue');
    this.checkButton.removeListener('click', this.onCheckButtonClick);
    this.checkButton.addListener('click', this.onContinueButtonClick);

    if (this.listeners.onSourceClick && this.listeners.onCurrentRowClick) {
      this.source.removeListener('click', this.listeners.onSourceClick);
      this.currentRow.removeListener('click', this.listeners.onCurrentRowClick);
    }

    this.cards.forEach((card) => {
      card.removeClass('card--active');
    });

    this.currentRow.getChildren().forEach((place) => {
      if (place instanceof BaseComponent) {
        place.removeClass('drop-place');
      }
    });

    this.showTranslation();
    this.showPronounceButton();
  }

  private removeCardsClasses(): void {
    this.cards.forEach((card) => {
      card.removeClass('card--right');
      card.removeClass('card--wrong');
    });
  }

  private isRowFilled(): boolean {
    const cardPlaces = this.currentRow.getChildren();

    for (let index = 0; index < cardPlaces.length; index += 1) {
      const place = cardPlaces[index];

      if (!(place instanceof BaseComponent) || !place.hasClass('main__row-place--full')) {
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

    this.removeCardsClasses();
    this.currentSentenceNumber += 1;
    this.checkButton.setAttribute('disabled', '');
    this.completeButton.removeAttribute('disabled');
    this.checkButton.setTextContent('Check');
    this.checkButton.removeClass('button--continue');
    this.checkButton.addListener('click', this.onCheckButtonClick);
    this.checkButton.removeListener('click', this.onContinueButtonClick);
    setTimeout(() => this.showSentence(this.currentSentenceNumber), SENTENCE_OPACITY_TRANSITION_TIME_MS);
  };

  private onCompleteButtonClick = (): void => {
    let rowOffsetX = 0;

    for (let index = 0; index < this.cards.length; index += 1) {
      const card = this.cards[index];

      if (!(card instanceof PuzzleCard)) {
        throw new TypeError(`Wrong card type`);
      }

      this.moveCardToRightPlace(card, rowOffsetX);
      rowOffsetX += card.getNode().offsetWidth;
    }

    this.completeButton.setAttribute('disabled', '');
    this.changeSourcePlacesWidth();
    this.removeCardsClasses();
    setTimeout(() => {
      this.checkButton.removeAttribute('disabled');
      this.handleOrderedRow();
    }, CARD_MOVE_TRANSITION_TIME_MS + 100);
  };

  private moveCardToRightPlace = (card: PuzzleCard, rowOffsetX: number): void => {
    const rightPlace = this.currentRow.getChildren()[card.getOrder()];

    if (!(rightPlace instanceof BaseComponent)) {
      throw new Error(`Can't find place`);
    }

    if (card.getIsRightPlace()) {
      this.moveAndAppend(card, null, rowOffsetX);
    }

    this.moveAndAppend(card, rightPlace, rowOffsetX);
  };

  private moveAndAppend = (movedCard: PuzzleCard, targetPlace: BaseComponent | null, rowOffsetX: number): void => {
    const movedNode = movedCard.getNode();

    const baseRect = movedNode.getBoundingClientRect();
    const rowRect = this.currentRow.getNode().getBoundingClientRect();

    const offsetX = rowRect.left + rowOffsetX - baseRect.left;
    const offsetY = rowRect.top - baseRect.top;

    movedNode.style.transition = `transform 1500ms, background-color ${CARD_MOVE_TRANSITION_TIME_MS}ms`;
    movedNode.style.transform = `translate(${offsetX}px, ${offsetY}px`;

    movedNode.addEventListener(
      'transitionend',
      () => {
        // movedNode.style.transition = '';
        movedNode.style.transform = '';

        if (targetPlace) {
          movedCard.getParentPlace().removeChild(movedCard);
          targetPlace.addClass('main__row-place--full');
          targetPlace.append(movedCard);
          movedCard.setParentPlace(targetPlace);
        }
      },
      { once: true },
    );
  };

  private changeSourcePlacesWidth = (): void => {
    const sourcePlaces = this.source.getChildren();

    for (let i = 0; i < sourcePlaces.length; i += 1) {
      const place = sourcePlaces[i];

      if (!(place instanceof BaseComponent)) {
        throw new TypeError(`Wrong place type`);
      }

      place.getNode().style.width = `${place.getNode().offsetWidth}px`;

      setTimeout(() => {
        place.getNode().style.width = `40px`;
      }, CARD_MOVE_TRANSITION_TIME_MS);
    }
  };

  private mouseDragHandler = (evt: MouseEvent): void => {
    const initialMouseMoveHandler = this.createInitialMouseMoveHandler(evt);

    document.addEventListener(
      'mouseup',
      () => {
        document.removeEventListener('mousemove', initialMouseMoveHandler);
      },
      { once: true },
    );

    document.addEventListener('mousemove', initialMouseMoveHandler, { once: true });
  };

  private createInitialMouseMoveHandler =
    (mouseDownEvt: MouseEvent): (() => void) =>
    () => {
      this.draggedCardNode = getClosestFromEventTarget(mouseDownEvt, '.card--active');

      if (!this.draggedCardNode) {
        return;
      }

      const draggedNodeRect = this.draggedCardNode.getBoundingClientRect();
      const shiftX = mouseDownEvt.clientX - draggedNodeRect.left;
      const shiftY = mouseDownEvt.clientY - draggedNodeRect.top;
      const startingPlaceNode = this.draggedCardNode.parentElement;

      if (!startingPlaceNode) {
        return;
      }

      const startingPlaceData = this.findPlaceComponentfromNode(startingPlaceNode);

      const draggedCard = this.cards.find((cardsItem) => cardsItem.getNode() === this.draggedCardNode);

      if (!draggedCard) {
        return;
      }

      this.draggedCardNode.style.position = 'absolute';
      this.draggedCardNode.style.cursor = 'grabbing';
      this.draggedCardNode.style.zIndex = '10';
      this.draggedCardNode.style.left = `${mouseDownEvt.pageX - shiftX}px`;
      this.draggedCardNode.style.top = `${mouseDownEvt.pageY - shiftY}px`;
      document.body.append(this.draggedCardNode);
      this.currentDropPlace = null;

      this.addMouseHandlers(shiftX, shiftY, startingPlaceData, draggedCard);
    };

  private addMouseHandlers = (
    shiftX: number,
    shiftY: number,
    startingPlaceData: { place: BaseComponent | null; index: number },
    draggedCard: PuzzleCard,
  ): void => {
    if (!this.draggedCardNode) {
      return;
    }

    const onMouseMove = this.createMouseMoveHandler(shiftX, shiftY);

    document.addEventListener('mousemove', onMouseMove);

    this.draggedCardNode.addEventListener(
      'mouseup',
      () => {
        if (!this.draggedCardNode) {
          return;
        }

        if (this.currentDropPlace) {
          this.currentDropPlace.classList.remove('drop-place--hover');
        }

        this.handleDrop(startingPlaceData, draggedCard);
        this.draggedCardNode.style.cursor = '';
        document.removeEventListener('mousemove', onMouseMove);
      },
      { once: true },
    );
  };

  private handleDrop = (
    startingPlaceData: { place: BaseComponent | null; index: number },
    draggedCard: PuzzleCard,
  ): void => {
    if (!this.draggedCardNode || !startingPlaceData.place) {
      return;
    }

    if (!this.currentDropPlace || this.currentDropPlace === startingPlaceData.place.getNode()) {
      startingPlaceData.place.getNode().append(this.draggedCardNode);

      this.resetDraggedCardStyles();
    } else if (!this.currentDropPlace.hasChildNodes()) {
      this.handleDropToEmptyPlace(startingPlaceData, draggedCard);
    } else {
      this.handleDropToNonEmptyPlace(startingPlaceData, draggedCard);
    }
  };

  private handleDropToEmptyPlace = (
    startingPlaceData: { place: BaseComponent | null; index: number },
    draggedCard: PuzzleCard,
  ): void => {
    if (!this.currentDropPlace || !startingPlaceData.place) {
      return;
    }

    this.resetDraggedCardStyles();
    this.removeCardsClasses();
    startingPlaceData.place.cleanComponentChildrenList();

    if (startingPlaceData.place.hasClass('main__row-place')) {
      startingPlaceData.place.removeClass('main__row-place--full');

      if (this.currentDropPlace.classList.contains('main__source-place')) {
        this.checkButton.setAttribute('disabled', '');
      }
    }

    const { place: dropPlace, index: dropPlaceNumber } = this.findPlaceComponentfromNode(this.currentDropPlace);

    if (!dropPlace) {
      return;
    }

    dropPlace.append(draggedCard);
    draggedCard.setParentPlace(dropPlace);

    if (dropPlace.hasClass('main__row-place')) {
      dropPlace.addClass('main__row-place--full');
      draggedCard.setIsRightPlace(dropPlaceNumber === draggedCard.getOrder());

      if (this.isRowFilled()) {
        this.checkButton.removeAttribute('disabled');
      }
    } else {
      draggedCard.setIsRightPlace(false);
    }
  };

  private handleDropToNonEmptyPlace = (
    startingPlaceData: { place: BaseComponent | null; index: number },
    draggedCard: PuzzleCard,
  ): void => {
    if (!this.currentDropPlace || !startingPlaceData.place) {
      return;
    }

    this.resetDraggedCardStyles();
    this.removeCardsClasses();
    startingPlaceData.place.cleanComponentChildrenList();

    const { place: dropPlace, index: dropPlaceNumber } = this.findPlaceComponentfromNode(this.currentDropPlace);

    if (!dropPlace) {
      return;
    }

    const cardFromDropPlace = dropPlace.getChildren()[0];

    if (!(cardFromDropPlace instanceof PuzzleCard)) {
      return;
    }

    dropPlace.cleanComponentChildrenList();
    PuzzleMainComponent.handleCardAdd(dropPlace, draggedCard, dropPlaceNumber);
    PuzzleMainComponent.handleCardAdd(startingPlaceData.place, cardFromDropPlace, startingPlaceData.index);
  };

  private static handleCardAdd = (place: BaseComponent, card: PuzzleCard, placeNumber: number): void => {
    place.append(card);
    card.setParentPlace(place);

    if (place.hasClass('main__row-place')) {
      card.setIsRightPlace(placeNumber === card.getOrder());
    } else {
      card.setIsRightPlace(false);
    }
  };

  private resetDraggedCardStyles(): void {
    if (!this.draggedCardNode) {
      return;
    }

    this.draggedCardNode.style.position = '';
    this.draggedCardNode.style.cursor = '';
    this.draggedCardNode.style.zIndex = '';
    this.draggedCardNode.style.left = ``;
    this.draggedCardNode.style.top = ``;
  }

  private findPlaceComponentfromNode = (node: Element): { place: BaseComponent | null; index: number } => {
    if (!node) {
      return { place: null, index: -1 };
    }

    if (node.classList.contains('main__row-place')) {
      const children = this.currentRow.getChildren();
      for (let i = 0; i < children.length; i += 1) {
        const place = children[i];
        if (place instanceof BaseComponent && place.getNode() === node) {
          return { place, index: i };
        }
      }
    } else {
      const children = this.source.getChildren();
      for (let i = 0; i < children.length; i += 1) {
        const place = children[i];
        if (place instanceof BaseComponent && place.getNode() === node) {
          return { place, index: i };
        }
      }
    }

    return { place: null, index: -1 };
  };

  private createMouseMoveHandler(shiftX: number, shiftY: number): (evt: MouseEvent) => void {
    return (evt: MouseEvent) => {
      if (!this.draggedCardNode) {
        return;
      }

      this.draggedCardNode.style.left = `${evt.pageX - shiftX}px`;
      this.draggedCardNode.style.top = `${evt.pageY - shiftY}px`;
      this.draggedCardNode.style.display = 'none';

      const underNode = document.elementFromPoint(evt.clientX, evt.clientY);

      this.draggedCardNode.style.display = '';

      if (!underNode) {
        return;
      }

      const enteredDropPlace = underNode.closest('.drop-place');

      if (this.currentDropPlace !== enteredDropPlace) {
        if (this.currentDropPlace) {
          this.currentDropPlace.classList.remove('drop-place--hover');
          this.draggedCardNode.style.cursor = 'grabbing';
        }

        this.currentDropPlace = enteredDropPlace;

        if (this.currentDropPlace) {
          this.currentDropPlace.classList.add('drop-place--hover');
          this.draggedCardNode.style.cursor = 'cell';
        }
      }
    };
  }

  private cancelCardsDragStart(): void {
    this.cards.forEach((card) => {
      const cardNode = card.getNode();

      cardNode.ondragstart = (): boolean => false;
    });
  }

  private touchDragHandler = (evt: TouchEvent): void => {
    const initialTouchMoveHandler = this.createInitialTouchMoveHandler(evt);

    document.addEventListener(
      'touchend',
      () => {
        document.removeEventListener('touchmove', initialTouchMoveHandler);
      },
      { once: true },
    );

    document.addEventListener('touchmove', initialTouchMoveHandler, { once: true });
  };

  private createInitialTouchMoveHandler =
    (touchStartEvt: TouchEvent): (() => void) =>
    () => {
      const touch = touchStartEvt.changedTouches[0];

      this.draggedCardNode = getClosestFromTouchEventTarget(touch, '.card--active');

      if (!this.draggedCardNode || !touch) {
        return;
      }

      const draggedNodeRect = this.draggedCardNode.getBoundingClientRect();
      const shiftX = touch.clientX - draggedNodeRect.left;
      const shiftY = touch.clientY - draggedNodeRect.top;
      const startingPlaceNode = this.draggedCardNode.parentElement;

      if (!startingPlaceNode) {
        return;
      }

      const startingPlaceData = this.findPlaceComponentfromNode(startingPlaceNode);
      const draggedCard = this.cards.find((cardsItem) => cardsItem.getNode() === this.draggedCardNode);

      if (!draggedCard) {
        return;
      }

      this.draggedCardNode.style.position = 'absolute';
      this.draggedCardNode.style.touchAction = 'none';
      this.draggedCardNode.style.zIndex = '10';
      this.draggedCardNode.style.left = `${touch.pageX - shiftX}px`;
      this.draggedCardNode.style.top = `${touch.pageY - shiftY}px`;
      document.body.append(this.draggedCardNode);
      this.currentDropPlace = null;
      this.addTouchHandlers(shiftX, shiftY, startingPlaceData, draggedCard);
    };

  private addTouchHandlers = (
    shiftX: number,
    shiftY: number,
    startingPlaceData: { place: BaseComponent | null; index: number },
    draggedCard: PuzzleCard,
  ): void => {
    if (!this.draggedCardNode) {
      return;
    }

    const onTouchMove = this.createTouchMoveHandler(shiftX, shiftY);

    document.addEventListener('touchmove', onTouchMove, { passive: false });

    this.draggedCardNode.addEventListener(
      'touchend',
      () => {
        if (!this.draggedCardNode) {
          return;
        }

        if (this.currentDropPlace) {
          this.currentDropPlace.classList.remove('drop-place--hover');
        }

        this.handleDrop(startingPlaceData, draggedCard);
        document.removeEventListener('touchmove', onTouchMove);
      },
      { once: true },
    );
  };

  private createTouchMoveHandler(shiftX: number, shiftY: number): (evt: TouchEvent) => void {
    return (touchEvent: TouchEvent) => {
      const touch = touchEvent.changedTouches[0];

      if (!this.draggedCardNode || !touch) {
        return;
      }

      this.draggedCardNode.style.left = `${touch.pageX - shiftX}px`;
      this.draggedCardNode.style.top = `${touch.pageY - shiftY}px`;
      this.draggedCardNode.style.display = 'none';

      const underNode = document.elementFromPoint(touch.clientX, touch.clientY);

      this.draggedCardNode.style.display = '';

      if (!underNode) {
        return;
      }

      const enteredDropPlace = underNode.closest('.drop-place');

      if (this.currentDropPlace !== enteredDropPlace) {
        if (this.currentDropPlace) {
          this.currentDropPlace.classList.remove('drop-place--hover');
        }

        this.currentDropPlace = enteredDropPlace;

        if (this.currentDropPlace) {
          this.currentDropPlace.classList.add('drop-place--hover');
        }
      }
    };
  }

  private showTranslation(): void {
    const currentSentenceData = this.sentences[this.currentSentenceNumber];

    if (currentSentenceData) {
      this.sentenceTranslation.setTextContent(currentSentenceData.textExampleTranslate);
    }

    this.sentenceTranslation.addClass('main__translation--opaque');
  }

  private hideTranslation(): void {
    this.sentenceTranslation.removeClass('main__translation--opaque');
  }

  private showPronounceButton(): void {
    this.pronounceButton.addClass('main__button-pronounce--opaque');
    this.pronounceButton.addClass('main__button-pronounce--visible');
  }

  private hidePronounceButton(): void {
    this.pronounceButton.removeClass('main__button-pronounce--opaque');

    setTimeout(() => {
      this.pronounceButton.removeClass('main__button-pronounce--visible');
    }, START_OPACITY_TRANSITION_TIME_MS);
  }

  private createPronounceButton = (): BaseComponent<HTMLButtonElement> => {
    const pronounceButton = ButtonComponent({
      className: 'main__button-pronounce button button--continue',
      buttonType: 'button',
    });

    const onPronounceClick = (): void => {
      const currentSentenceData = this.sentences[this.currentSentenceNumber];
      let currentAudioURL = currentSentenceData?.audioExample;

      if (!currentAudioURL) {
        return;
      }

      currentAudioURL = BASE_URL + currentAudioURL;

      const audio = new Audio(currentAudioURL);

      audio
        .play()
        .then(() => {
          pronounceButton.addClass('main__button-pronounce--icon-on');
          pronounceButton.removeListener('click', onPronounceClick);
          audio.onended = (): void => {
            pronounceButton.removeClass('main__button-pronounce--icon-on');
            pronounceButton.addListener('click', onPronounceClick);
          };
        })
        .catch(() => {});
    };

    pronounceButton.addListener('click', onPronounceClick);

    return pronounceButton;
  };
}
