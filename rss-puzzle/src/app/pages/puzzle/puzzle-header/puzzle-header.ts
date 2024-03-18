import './puzzle-header.scss';
import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import { div, span } from '@/app/components/tags';
import { Pages } from '@/app/router/pages';
import type Router from '@/app/router/router';
import { dispatchCustomEvent } from '@/app/utils';
import type JsonLoader from '@/app/utils/json-loader';
import type LocalStorage from '@/app/utils/local-storage';

export default class PuzzleHeaderComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private pageNumber: number;

  private levelNumber: number;

  private translateButton: BaseComponent<HTMLButtonElement>;

  private pronounceButton: BaseComponent<HTMLButtonElement>;

  private startButton: BaseComponent<HTMLButtonElement>;

  constructor(router: Router, storage: LocalStorage, loader: JsonLoader, levelNumber: number, pageNumber: number) {
    super({ className: 'puzzle-page__header header', tag: 'header' });

    this.router = router;
    this.storage = storage;
    this.pageNumber = pageNumber;
    this.levelNumber = levelNumber;

    const buttonsContainer = div({ className: 'header__buttons-container' });

    this.startButton = this.createStartButton();
    this.translateButton = this.createTranslationButton();
    this.pronounceButton = this.createPronounceButton();

    buttonsContainer.appendChildren([this.translateButton, this.pronounceButton]);
    this.appendChildren([this.startButton, buttonsContainer]);
  }

  private createTranslationButton(): BaseComponent<HTMLButtonElement> {
    let isTranslationOn = this.storage.getField('isTranslationOn');

    if (isTranslationOn === null || typeof isTranslationOn !== 'boolean') {
      isTranslationOn = true;
      this.storage.setField('isTranslationOn', true);
    }

    const translateButtonText = span({
      className: 'visually-hidden',
      textContent: `Translation ${isTranslationOn ? 'on' : 'off'}`,
    });
    const translateButton = ButtonComponent({
      className: `header__translate-button button button--icon button--icon_text-${isTranslationOn ? 'on' : 'off'}`,
    });

    translateButton.append(translateButtonText);

    translateButton.addListener('click', () => {
      isTranslationOn = !isTranslationOn;
      this.storage.setField('isTranslationOn', isTranslationOn);
      translateButton.toggleClass('button--icon_text-on');
      translateButton.toggleClass('button--icon_text-off');
      translateButtonText.setTextContent(isTranslationOn ? 'Translation on' : 'Translation off');

      dispatchCustomEvent(translateButton.getNode(), 'translation-click');
    });

    return translateButton;
  }

  private createPronounceButton(): BaseComponent<HTMLButtonElement> {
    let isPronounceOn = this.storage.getField('isPronounceOn');

    if (isPronounceOn === null || typeof isPronounceOn !== 'boolean') {
      isPronounceOn = true;
      this.storage.setField('isPronounceOn', true);
    }

    const pronounceButtonText = span({
      className: 'visually-hidden',
      textContent: `Pronounce ${isPronounceOn ? 'on' : 'off'}`,
    });
    const pronounceButton = ButtonComponent({
      className: `header__pronounce-button button button--icon button--icon_sound-${isPronounceOn ? 'on' : 'off'}`,
    });

    pronounceButton.append(pronounceButtonText);

    pronounceButton.addListener('click', () => {
      isPronounceOn = !isPronounceOn;
      this.storage.setField('isPronounceOn', isPronounceOn);
      pronounceButton.toggleClass('button--icon_sound-on');
      pronounceButton.toggleClass('button--icon_sound-off');
      pronounceButtonText.setTextContent(isPronounceOn ? 'Pronounce on' : 'Pronounce off');

      dispatchCustomEvent(pronounceButton.getNode(), 'pronounce-click');
    });

    return pronounceButton;
  }

  private createStartButton(): BaseComponent<HTMLButtonElement> {
    const pronounceButton = ButtonComponent({
      className: `header__start-button button`,
      textContent: 'Return to Start Page',
      buttonType: 'button',
    });

    pronounceButton.addListener('click', () => {
      this.router.navigate(Pages.START);
    });

    return pronounceButton;
  }
}
