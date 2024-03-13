import './start-page.scss';
import BaseComponent, { type ChildrenType } from '@/app/components/base-component';
import { h1, main, p, span } from '@/app/components/tags';
import { Pages } from '@/app/router/pages';
import type Router from '@/app/router/router';
import type LocalStorage from '@/app/utils/local-storage';

export default class StartPageComponent extends BaseComponent {
  private main: BaseComponent | null;

  private storage: LocalStorage;

  private router: Router;

  constructor(router: Router, storage: LocalStorage) {
    super({ className: 'app-container__page start-page' });

    this.router = router;
    this.storage = storage;
    this.main = null;

    const loginData = this.storage.getLoginData();

    if (!loginData) {
      this.router.navigate(Pages.LOGIN);
    } else {
      this.main = main(
        { className: 'start-page__main' },
        ...StartPageComponent.createMainComponents(loginData.name, loginData.surname),
      );
      this.appendChildren([this.main]);
    }
  }

  private static createMainComponents(name: string, surname: string): ChildrenType[] {
    const header = h1('start-page__title', 'Word puzzle');
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

    return [header, greeting, descriptionPart1, descriptionPart2, descriptionPart3];
  }
}
