import './start-page.scss';
import BaseComponent from '@/app/components/base-component';
import { h1, main, p } from '@/app/components/tags';
import type Router from '@/app/router/router';
// import ButtonComponent from '@/app/components/button/button';
import type LocalStorage from '@/app/utils/local-storage';

export default class LoginPageComponent extends BaseComponent {
  private main: BaseComponent;

  private storage: LocalStorage;

  private router: Router;

  constructor(router: Router, storage: LocalStorage) {
    super({ className: 'app-container__page start-page' });

    const header = h1('start-page__title', 'Word puzzle');
    const description1 = p({
      className: 'start-page__description',
      textContent:
        'Immerse yourself in a captivating experience where you piece together phrases by clicking and dragging words on puzzle-shaped cards.',
    });
    const description2 = p({
      className: 'start-page__description',
      textContent: 'Complete the puzzle to reveal the full picture and triumph in each round!',
    });
    const description3 = p({
      className: 'start-page__description',
      textContent: 'Dive into the challenge of linguistic exploration while uncovering stunning visuals.',
    });
    const description4 = p({
      className: 'start-page__description',
      textContent: 'Customize your experience for seamless gameplay.',
    });
    const description5 = p({
      className: 'start-page__description',
      textContent: 'Embark on your journey with Word Puzzle and unlock the joy of wordplay and visual discovery!',
    });

    this.main = main(
      { className: 'start-page__main' },
      header,
      description1,
      description2,
      description3,
      description4,
      description5,
    );

    this.appendChildren([this.main]);
    this.router = router;
    this.storage = storage;
  }
}
