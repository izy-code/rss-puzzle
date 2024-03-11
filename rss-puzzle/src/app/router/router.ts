import { Pages, SUFFIX } from './pages';

export type Route = {
  path: Pages;
  handleRouteChange: (hashData: HashParts) => void;
};

type HashParts = {
  page: string;
  suffix: string;
};

export default class Router {
  private validRoutes: Route[];

  constructor(routes: Route[]) {
    this.validRoutes = routes;

    window.addEventListener('hashchange', this.navigate.bind(this));
    document.addEventListener('DOMContentLoaded', this.navigate.bind(this));
  }

  public navigate(url: Event | string): void {
    if (typeof url === 'string') {
      window.location.href = `${window.location.href.replace(/#(.*)$/, '')}#${url}`;
    }

    const urlHashFragment = window.location.hash.slice(1);
    const urlHashParts = urlHashFragment.split('-');
    const urlHashData: HashParts = {
      page: urlHashParts[0] ?? '',
      suffix: urlHashParts[1] ?? '',
    };

    this.urlChangeHandler(urlHashData);
  }

  private urlChangeHandler(newUrlData: HashParts): void {
    const newRoutePath = newUrlData.suffix === '' ? newUrlData.page : `${newUrlData.page}-${SUFFIX}`;
    const validRoute = this.validRoutes.find((route) => String(route.path) === newRoutePath);

    if (!validRoute) {
      this.redirectToNotFoundPage();
      return;
    }

    validRoute.handleRouteChange(newUrlData);
  }

  private redirectToNotFoundPage(): void {
    const notFoundPageRoute = this.validRoutes.find((route) => route.path === Pages.NOT_FOUND);

    if (notFoundPageRoute) {
      this.navigate(notFoundPageRoute.path);
    }
  }
}
