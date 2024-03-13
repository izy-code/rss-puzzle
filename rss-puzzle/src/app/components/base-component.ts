export type Props<T extends HTMLElement = HTMLElement> = Partial<
  Omit<T, 'style' | 'dataset' | 'classList' | 'children' | 'tagName'>
> & {
  textContent?: string;
  tag?: keyof HTMLElementTagNameMap;
};
export type ElementFnProps<T extends HTMLElement = HTMLElement> = Omit<Props<T>, 'tag'>;
export type ChildrenType = BaseComponent | HTMLElement | Text;

export default class BaseComponent<T extends HTMLElement = HTMLElement> {
  protected node: T;

  protected children: ChildrenType[] = [];

  constructor(propsObject: Props<T>, ...children: ChildrenType[]) {
    const node = document.createElement(propsObject.tag ?? 'div') as T;

    Object.assign(node, propsObject);
    this.node = node;

    if (children) {
      this.appendChildren(children);
    }
  }

  public append(child: ChildrenType): void {
    if (child instanceof BaseComponent) {
      this.children.push(child);
      this.node.append(child.getNode());
    } else {
      this.node.append(child);
    }
  }

  public appendChildren(children: ChildrenType[]): void {
    children.forEach((child) => {
      this.append(child);
    });
  }

  public getNode(): T {
    return this.node;
  }

  public getChildren(): ChildrenType[] {
    return this.children;
  }

  public setTextContent(textContent: string): void {
    this.node.textContent = textContent;
  }

  public setAttribute(attribute: string, value: string): void {
    this.node.setAttribute(attribute, value);
  }

  public removeAttribute(attribute: string): void {
    this.node.removeAttribute(attribute);
  }

  public toggleClass(className: string): void {
    this.node.classList.toggle(className);
  }

  public addClass(className: string): void {
    this.node.classList.add(className);
  }

  public removeClass(className: string): void {
    this.node.classList.remove(className);
  }

  public addListener(event: string, handler: EventListener, options: boolean | AddEventListenerOptions = false): void {
    this.node.addEventListener(event, handler, options);
  }

  public removeListener(event: string, handler: EventListener, options: boolean | EventListenerOptions = false): void {
    this.node.removeEventListener(event, handler, options);
  }

  public removeNodeChildren(): void {
    this.children.forEach((child) => {
      if (child instanceof BaseComponent) {
        child.removeNode();
      } else {
        child.remove();
      }
    });

    this.children.length = 0;
  }

  public removeNode(): void {
    this.removeNodeChildren();
    this.node.remove();
  }
}
