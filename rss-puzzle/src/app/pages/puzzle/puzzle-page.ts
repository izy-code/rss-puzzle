import './puzzle-page.scss';
import BaseComponent from '@/app/components/base-component';
import { header } from '@/app/components/tags';
import type Router from '@/app/router/router';
import JsonLoader from '@/app/utils/json-loader';
import type LocalStorage from '@/app/utils/local-storage';
import PuzzleMainComponent from './puzzle-main/puzzle-main';

const LEVEL_NUMBER = 0;
const PAGE_NUMBER = 0;

export default class PuzzlePageComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  private loader: JsonLoader;

  constructor(router: Router, storage: LocalStorage) {
    super({ className: 'app-container__page puzzle-page' });

    this.router = router;
    this.storage = storage;
    this.loader = new JsonLoader(LEVEL_NUMBER);
    this.loader
      .loadPages()
      .then(() => {
        const headerComponent = header({ className: 'puzzle-page__header' });

        const mainComponent = new PuzzleMainComponent(router, storage, this.loader, PAGE_NUMBER);

        this.appendChildren([headerComponent, mainComponent]);
      })
      .catch((error) => {
        throw new Error(`Failed to load level data: ${error}`);
      });
  }
}
