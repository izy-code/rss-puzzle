import './app.scss';
import type BaseComponent from './components/base-component';
import Router, { type Route } from './router/router';
import { Pages } from './router/pages';
import { div } from './components/tags';
import LocalStorage from './utils/local-storage';

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
        handleRouteChange: this.handlePuzzleToStartPage,
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

  private handlePuzzleToStartPage = (): void => {
    import('@/app/pages/puzzle/puzzle-page')
      .then(({ default: PuzzlePage }) => {
        const loginData = this.storage.getLoginData();

        if (!loginData) {
          this.router.navigate(Pages.LOGIN);
        } else {
          this.setPage(new PuzzlePage(this.router, this.storage));
        }
      })
      .catch((error) => {
        throw new Error(`Failed to load puzzle page module: ${error}`);
      });
  };

  private setPage(pageComponent: BaseComponent): void {
    this.container.removeNodeChildren();
    this.container.append(pageComponent);
  }
}
