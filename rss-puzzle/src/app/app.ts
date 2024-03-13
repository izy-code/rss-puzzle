import './app.scss';
import type BaseComponent from './components/base-component';
import Router, { type Route } from './router/router';
import { Pages } from './router/pages';
import { div } from './components/tags';
import LocalStorage from './utils/local-storage';

export default class App {
  private container: BaseComponent;

  private router: Router;

  constructor() {
    this.container = div({ className: 'app-container' });

    const storage = new LocalStorage();
    const routes = this.createRoutes(storage);

    this.router = new Router(routes);
  }

  public start(): void {
    document.body.append(this.container.getNode());
  }

  private createRoutes(storage: LocalStorage): Route[] {
    return [
      {
        path: Pages.EMPTY,
        handleRouteChange: (): void => {
          import('@/app/pages/login/login-page')
            .then(({ default: LoginPage }) => {
              this.setPage(new LoginPage(this.router, storage));
            })
            .catch((error) => {
              throw new Error(`Failed to load login module: ${error}`);
            });
        },
      },
      {
        path: Pages.LOGIN,
        handleRouteChange: (): void => {
          import('@/app/pages/login/login-page')
            .then(({ default: LoginPage }) => {
              this.setPage(new LoginPage(this.router, storage));
            })
            .catch((error) => {
              throw new Error(`Failed to load login module: ${error}`);
            });
        },
      },
      {
        path: Pages.START,
        handleRouteChange: (): void => {
          import('@/app/pages/start/start-page')
            .then(({ default: StartPage }) => {
              this.setPage(new StartPage(this.router, storage));
            })
            .catch((error) => {
              throw new Error(`Failed to load start page module: ${error}`);
            });
        },
      },
    ];
  }

  private setPage(pageComponent: BaseComponent): void {
    this.container.removeNodeChildren();
    this.container.append(pageComponent);
  }
}
