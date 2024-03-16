import './app.scss';
import type BaseComponent from './components/base-component';
import Router, { type Route } from './router/router';
import { Pages } from './router/pages';
import { div } from './components/tags';
import LocalStorage from './utils/local-storage';

const OPACITY_TRANSITION_TIME_MS = 600;

export default class App {
  private container: BaseComponent;

  private router: Router;

  private storage: LocalStorage;

  constructor() {
    this.container = div({ className: 'app-container' });
    this.storage = new LocalStorage();
    this.router = new Router(this.createRoutes());
  }

  public start(): void {
    document.body.append(this.container.getNode());
  }

  private createRoutes(): Route[] {
    return [
      {
        path: Pages.EMPTY,
        handleRouteChange: this.handleSwitchToLoginPage,
      },
      {
        path: Pages.LOGIN,
        handleRouteChange: this.handleSwitchToLoginPage,
      },
      {
        path: Pages.START,
        handleRouteChange: this.handleSwitchToStartPage,
      },
      {
        path: Pages.PUZZLE,
        handleRouteChange: this.handleSwitchToPuzzlePage,
      },
      {
        path: Pages.PUZZLE_AND_SUFFIX,
        handleRouteChange: this.handleSwitchToPuzzlePage,
      },
    ];
  }

  private handleSwitchToLoginPage = (): void => {
    import('@/app/pages/login/login-page')
      .then(({ default: LoginPage }) => {
        const loginData = this.storage.getLoginData();

        if (loginData) {
          this.router.navigate(Pages.START);
        } else {
          this.setPage(new LoginPage(this.router, this.storage));
        }
      })
      .catch((error) => {
        throw new Error(`Failed to load login module: ${error}`);
      });
  };

  private handleSwitchToStartPage = (): void => {
    import('@/app/pages/start/start-page')
      .then(({ default: StartPage }) => {
        const loginData = this.storage.getLoginData();

        if (!loginData) {
          this.router.navigate(Pages.LOGIN);
        } else {
          this.setPage(new StartPage(this.router, this.storage, loginData));
        }
      })
      .catch((error) => {
        throw new Error(`Failed to load start page module: ${error}`);
      });
  };

  private handleSwitchToPuzzlePage = (suffix: string): void => {
    import('@/app/pages/puzzle/puzzle-page')
      .then(({ default: PuzzlePage }) => {
        const loginData = this.storage.getLoginData();

        if (!loginData) {
          this.router.navigate(Pages.LOGIN);
        } else {
          const suffixParts = suffix.split('-');
          if (suffixParts[0] && suffixParts[1]) {
            const levelNumber = +suffixParts[0] - 1;
            const pageNumber = +suffixParts[1] - 1;

            this.setPage(new PuzzlePage(this.router, this.storage, levelNumber, pageNumber));
          } else {
            this.setPage(new PuzzlePage(this.router, this.storage, 0, 0));
          }
        }
      })
      .catch((error) => {
        throw new Error(`Failed to load puzzle page module: ${error}`);
      });
  };

  private setPage(pageComponent: BaseComponent): void {
    this.container.removeClass('app-container--opaque');

    setTimeout(() => {
      this.container.removeNodeChildren();
      this.container.append(pageComponent);
    }, OPACITY_TRANSITION_TIME_MS);

    setTimeout(() => {
      this.container.addClass('app-container--opaque');
    }, OPACITY_TRANSITION_TIME_MS + 100);
  }
}
