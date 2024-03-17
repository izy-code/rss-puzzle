import './puzzle-header.scss';
import BaseComponent from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import { div, span } from '@/app/components/tags';
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

  constructor(router: Router, storage: LocalStorage, loader: JsonLoader, levelNumber: number, pageNumber: number) {
    super({ className: 'puzzle-page__header header', tag: 'header' });

    this.router = router;
    this.storage = storage;
    this.pageNumber = pageNumber;
    this.levelNumber = levelNumber;

    const buttonsContainer = div({ className: 'header__buttons-container' });

    this.translateButton = this.createTranslationButton();

    buttonsContainer.appendChildren([this.translateButton]);
    this.appendChildren([buttonsContainer]);
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
      translateButtonText.setTextContent(isTranslationOn ? 'Sound on' : 'Sound off');

      dispatchCustomEvent(translateButton.getNode(), 'translation-click');
    });

    return translateButton;
  }
}
