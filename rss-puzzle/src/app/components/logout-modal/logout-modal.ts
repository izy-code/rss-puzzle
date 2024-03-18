import './logout-modal.scss';
import BaseComponent from '../base-component';
import type Router from '@/app/router/router';
import type LocalStorage from '@/app/utils/local-storage';
import { div, h2, p } from '../tags';
import ButtonComponent from '../button/button';
import { Pages } from '@/app/router/pages';

const OPACITY_TRANSITION_TIME_MS = 600;

export default class LogoutModalComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private confirmButton: BaseComponent<HTMLButtonElement>;

  private cancelButton: BaseComponent<HTMLButtonElement>;

  private contentComponent: BaseComponent<HTMLDivElement>;

  constructor(router: Router, storage: LocalStorage) {
    super({ className: 'modal modal--closed' });

    this.router = router;
    this.storage = storage;

    const description = h2('modal__description', 'Are you sure you want to log out?');

    const notification = p({
      className: 'modal__notification',
      textContent: 'Please note that logging out will result in the loss of puzzle\u00A0progress.',
    });

    this.confirmButton = ButtonComponent({
      className: 'modal__button button button--cancel',
      textContent: 'Yes, log out',
      buttonType: 'button',
      clickHandler: this.onConfirmButtonClick,
    });
    this.cancelButton = ButtonComponent({
      className: 'modal__button button',
      textContent: 'No',
      buttonType: 'button',
      clickHandler: this.closeModal,
    });

    this.contentComponent = div(
      { className: 'modal__content' },
      description,
      notification,
      this.confirmButton,
      this.cancelButton,
    );

    this.append(this.contentComponent);

    document.addEventListener('keydown', this.onDocumentEscapeKeydown);
    this.getNode().addEventListener('click', this.onModalClick);
  }

  public showModal = (): void => {
    setTimeout(() => {
      this.addClass('modal--opaque');
      this.cancelButton.getNode().focus();
    }, 0);

    this.removeClass('modal--closed');
    document.body.classList.add('no-scroll');
  };

  private closeModal = (): void => {
    this.removeClass('modal--opaque');

    setTimeout(() => {
      this.addClass('modal--closed');
      document.body.classList.remove('no-scroll');
    }, OPACITY_TRANSITION_TIME_MS);
  };

  private onDocumentEscapeKeydown = (evt: KeyboardEvent): void => {
    if (evt.key === 'Escape') {
      this.closeModal();
    }
  };

  private onModalClick = (evt: Event): void => {
    if (!evt.composedPath().includes(this.contentComponent.getNode())) {
      this.closeModal();
    }
  };

  private onConfirmButtonClick = (): void => {
    this.storage.clearAllData();
    this.router.navigate(Pages.LOGIN);
  };
}
