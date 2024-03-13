import BaseComponent, { type ElementFnProps, type ChildrenType } from './base-component';

export const header = (props: ElementFnProps, ...children: ChildrenType[]): BaseComponent =>
  new BaseComponent({ ...props, tag: 'header' }, ...children);

export const main = (props: ElementFnProps, ...children: ChildrenType[]): BaseComponent =>
  new BaseComponent({ ...props, tag: 'main' }, ...children);

export const div = (
  props: ElementFnProps<HTMLDivElement>,
  ...children: ChildrenType[]
): BaseComponent<HTMLDivElement> => new BaseComponent(props, ...children);

export const p = (props: ElementFnProps, ...children: ChildrenType[]): BaseComponent<HTMLParagraphElement> =>
  new BaseComponent({ ...props, tag: 'p' }, ...children);

export const span = (props: ElementFnProps, ...children: ChildrenType[]): BaseComponent<HTMLSpanElement> =>
  new BaseComponent({ ...props, tag: 'span' }, ...children);

export const label = (props: ElementFnProps, ...children: ChildrenType[]): BaseComponent<HTMLLabelElement> =>
  new BaseComponent({ ...props, tag: 'label' }, ...children);

export const input = (props: ElementFnProps<HTMLInputElement>): BaseComponent<HTMLInputElement> =>
  new BaseComponent({ ...props, tag: 'input' });

export const h1 = (className: string, textContent: string): BaseComponent<HTMLHeadingElement> =>
  new BaseComponent({ tag: 'h1', className, textContent });

export const h2 = (className: string, textContent: string): BaseComponent<HTMLHeadingElement> =>
  new BaseComponent({ tag: 'h2', className, textContent });

export const h3 = (className: string, textContent: string): BaseComponent<HTMLHeadingElement> =>
  new BaseComponent({ tag: 'h3', className, textContent });

export const a = (
  props: ElementFnProps<HTMLLinkElement>,
  ...children: ChildrenType[]
): BaseComponent<HTMLLinkElement> => new BaseComponent({ ...props, tag: 'a' }, ...children);

export const img = ({ className = '', src = '', alt = '' }): BaseComponent<HTMLImageElement> =>
  new BaseComponent({
    tag: 'img',
    className,
    src,
    alt,
  });

export const form = (
  { className = '', method = 'get', action = '' },
  ...children: ChildrenType[]
): BaseComponent<HTMLFormElement> =>
  new BaseComponent(
    {
      tag: 'form',
      className,
      method,
      action,
    },
    ...children,
  );
