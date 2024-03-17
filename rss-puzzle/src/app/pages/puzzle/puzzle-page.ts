import './puzzle-page.scss';
import BaseComponent from '@/app/components/base-component';
import type Router from '@/app/router/router';
import JsonLoader from '@/app/utils/json-loader';
import type LocalStorage from '@/app/utils/local-storage';
import PuzzleMainComponent from './puzzle-main/puzzle-main';
import { Pages } from '@/app/router/pages';
import PuzzleHeaderComponent from './puzzle-header/puzzle-header';

const LEVELS_COUNT = 5;

export default class PuzzlePageComponent extends BaseComponent {
  private router: Router;

  private storage: LocalStorage;

  constructor(router: Router, storage: LocalStorage, levelNumber: number, pageNumber: number) {
    super({ className: 'app-container__page puzzle-page' });

    this.router = router;
    this.storage = storage;

    if (levelNumber < 0 || levelNumber > LEVELS_COUNT) {
      this.router.navigate(Pages.PUZZLE);
      return;
    }

    const loader = new JsonLoader(levelNumber);

    loader
      .loadPages()
      .then(() => {
        if (pageNumber < 0 || pageNumber >= loader.getPagesCount()) {
          this.router.navigate(Pages.PUZZLE);
          return;
        }

        const headerComponent = new PuzzleHeaderComponent(router, storage, loader, levelNumber, pageNumber);

        const mainComponent = new PuzzleMainComponent(router, storage, loader, levelNumber, pageNumber);

        this.appendChildren([headerComponent, mainComponent]);
      })
      .catch((error) => {
        throw new Error(`Failed to load level data: ${error}`);
      });
  }
}
