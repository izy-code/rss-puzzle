import BaseComponent from '../base-component';

import './button.scss';

interface Props {
  className?: string;
  textContent?: string;
  buttonType?: 'button' | 'submit' | 'reset';
  clickHandler?: (evt?: Event) => void;
}

export default function ButtonComponent({
  className,
  textContent = '',
  buttonType = 'button',
  clickHandler,
}: Props): BaseComponent<HTMLButtonElement> {
  return new BaseComponent({
    tag: 'button',
    className,
    textContent,
    type: buttonType,
    onclick: clickHandler,
  });
}
