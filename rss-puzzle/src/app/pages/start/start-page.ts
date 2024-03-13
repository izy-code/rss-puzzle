import './start-page.scss';
import BaseComponent, { type ChildrenType } from '@/app/components/base-component';
import ButtonComponent from '@/app/components/button/button';
import LogoutModalComponent from '@/app/components/logout-modal/logout-modal';
import { h1, main, p, span } from '@/app/components/tags';
import type Router from '@/app/router/router';
import type LocalStorage from '@/app/utils/local-storage';

export default class StartPageComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private modal: LogoutModalComponent;

  constructor(router: Router, storage: LocalStorage, loginData: { name: string; surname: string }) {
    super({ className: 'app-container__page start-page' });

    this.router = router;
    this.storage = storage;
    this.modal = new LogoutModalComponent(router, storage);

    const mainComponent = main(
      { className: 'start-page__main' },
      ...this.createMainComponents(loginData.name, loginData.surname),
    );

    this.appendChildren([mainComponent, this.modal]);
  }

  private createMainComponents(name: string, surname: string): ChildrenType[] {
    const header = h1('start-page__title', 'Word puzzle');
    const user = span({
      className: 'start-page__user',
      textContent: `${name} ${surname}`,
    });
    const greetingEnding = document.createTextNode(
      '! Embark on your journey with Word Puzzle and unlock the joy of wordplay and visual discovery!',
    );
    const greeting = p(
      {
        className: 'start-page__greeting',
        textContent: `Welcome, `,
      },
      user,
      greetingEnding,
    );
    const logoutText = p({
      className: 'start-page__logout-text',
      textContent: `If you wish to log out, please press the button below.`,
    });
    const logoutButton = ButtonComponent({
      className: 'start-page__logout-button button button--logout',
      textContent: 'Logout',
      buttonType: 'button',
      clickHandler: this.onLogoutButtonClick,
    });

    return [header, greeting, ...StartPageComponent.createDescriptionComponents(), logoutText, logoutButton];
  }

  private static createDescriptionComponents(): ChildrenType[] {
    const descriptionPart1 = p({
      className: 'start-page__description',
      textContent:
        'Immerse yourself in a captivating experience where you piece together phrases by clicking and dragging words on puzzle-shaped cards.',
    });
    const descriptionPart2 = p({
      className: 'start-page__description',
      textContent: 'Complete the puzzle to reveal the full picture and triumph in each round!',
    });
    const descriptionPart3 = p({
      className: 'start-page__description',
      textContent: 'Customize your experience for seamless gameplay.',
    });

    return [descriptionPart1, descriptionPart2, descriptionPart3];
  }

  private onLogoutButtonClick = (): void => {
    this.modal.showModal();
  };
}
