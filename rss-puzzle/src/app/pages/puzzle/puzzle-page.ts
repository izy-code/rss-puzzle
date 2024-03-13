import BaseComponent from '@/app/components/base-component';
import { header, main } from '@/app/components/tags';
import type Router from '@/app/router/router';
import type LocalStorage from '@/app/utils/local-storage';

export default class PuzzlePageComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  constructor(router: Router, storage: LocalStorage) {
    super({ className: 'app-container__page puzzle-page' });

    this.router = router;
    this.storage = storage;

    const headerComponent = header({ className: 'puzzle-page__header' });

    const mainComponent = main({ className: 'puzzle-page__main' });

    this.appendChildren([headerComponent, mainComponent]);
  }
}
