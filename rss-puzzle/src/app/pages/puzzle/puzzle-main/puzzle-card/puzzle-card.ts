import './puzzle-card.scss';
import BaseComponent from '@/app/components/base-component';

export default class PuzzleCard extends BaseComponent<HTMLDivElement> {
  private orderNumber: number;

  constructor(textContent: string, orderNumber: number, className: string) {
    super({ className: 'card', tag: 'div', textContent });

    this.orderNumber = orderNumber;
    this.addClasses(className);
  }

  public getOrder(): number {
    return this.orderNumber;
  }
}
