import './app.scss';
import type BaseComponent from './components/base-component';
import Router, { type Route } from './router/router';
import { Pages } from './router/pages';
import { div } from './components/tags';

export default class App {
  private container: BaseComponent;

  private router: Router;

  constructor() {
    this.container = div({ className: 'app-container' });

    const routes = this.createRoutes();

    this.router = new Router(routes);
  }

  public start(): void {
    document.body.append(this.container.getNode());
  }

  private createRoutes(): Route[] {
    return [
      {
        path: Pages.EMPTY,
        handleRouteChange: (): void => {
          import('@/app/pages/login/login-page')
            .then(({ default: LoginPage }) => {
              this.setPage(new LoginPage());
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
              this.setPage(new LoginPage());
            })
            .catch((error) => {
              throw new Error(`Failed to load login module ${error}`);
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
