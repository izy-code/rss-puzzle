import { Pages, SUFFIX } from './pages';

export type Route = {
  path: Pages;
  handleRouteChange: (suffix: string) => void;
};

export type HashParts = {
  page: string;
  suffix: string;
};

export default class Router {
  private validRoutes: Route[];

  constructor(routes: Route[]) {
    this.validRoutes = routes;

    window.addEventListener('hashchange', this.navigate);
    document.addEventListener('DOMContentLoaded', this.navigate);
  }

  public navigate = (url: Event | string): void => {
    if (typeof url === 'string') {
      window.location.hash = url;
    }

    const urlHashFragment = window.location.hash.slice(1);
    const urlHyphenIndex = urlHashFragment.indexOf('-');
    const urlHashData: HashParts = {
      page: urlHyphenIndex !== -1 ? urlHashFragment.slice(0, urlHyphenIndex) : urlHashFragment,
      suffix: urlHyphenIndex !== -1 ? urlHashFragment.slice(urlHyphenIndex + 1) : '',
    };

    this.urlChangeHandler(urlHashData);
  };

  private urlChangeHandler(newUrlData: HashParts): void {
    const { suffix } = newUrlData;
    let newRoutePath = '';

    if (/^\d+-\d+$/.test(suffix)) {
      newRoutePath = `${newUrlData.page}-${SUFFIX}`;
    } else if (suffix !== '') {
      this.navigate(newUrlData.page);
      return;
    } else {
      newRoutePath = newUrlData.page;
    }

    const validRoute = this.validRoutes.find((route) => String(route.path) === newRoutePath);

    if (!validRoute) {
      this.redirectToLoginPage();
      return;
    }

    validRoute.handleRouteChange(suffix);
  }

  private redirectToLoginPage(): void {
    const loginPageRoute = this.validRoutes.find((route) => route.path === Pages.LOGIN);

    if (loginPageRoute) {
      this.navigate(loginPageRoute.path);
    }
  }
}
