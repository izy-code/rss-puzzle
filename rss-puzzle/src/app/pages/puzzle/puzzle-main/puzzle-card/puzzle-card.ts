import './puzzle-card.scss';
import BaseComponent from '@/app/components/base-component';

export default class PuzzleCard extends BaseComponent<HTMLDivElement> {
  private orderNumber: number;

  private relativeWidth = 0.1;

  private isRightPlace = false;

  private parentPlace: BaseComponent<HTMLElement> = new BaseComponent<HTMLElement>({});

  constructor(textContent: string, orderNumber: number, className: string) {
    super({ className: 'card', tag: 'div', textContent });

    this.orderNumber = orderNumber;
    this.addClasses(className);
  }

  public getOrder(): number {
    return this.orderNumber;
  }

  public getRelativeWidth(): number {
    return this.relativeWidth;
  }

  public setRelativeWidth(relativeWIdth: number): void {
    this.relativeWidth = relativeWIdth;
  }

  public getParentPlace(): BaseComponent<HTMLElement> {
    return this.parentPlace;
  }

  public setParentPlace(parentPlace: BaseComponent<HTMLElement>): void {
    this.parentPlace = parentPlace;
  }

  public getIsRightPlace(): boolean {
    return this.isRightPlace;
  }

  public setIsRightPlace(isRightPlace: boolean): void {
    this.isRightPlace = isRightPlace;
  }
}
