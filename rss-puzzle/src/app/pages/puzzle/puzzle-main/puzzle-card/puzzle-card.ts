import './puzzle-card.scss';
import BaseComponent from '@/app/components/base-component';

export default class PuzzleCard extends BaseComponent<HTMLDivElement> {
  private orderNumber: number;

  private relativeWidth = 0.1;

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
}
