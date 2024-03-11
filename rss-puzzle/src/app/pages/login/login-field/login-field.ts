import './login-field.scss';
import BaseComponent from '@/app/components/base-component';
import { input, span } from '@/app/components/tags';

export default class LoginFieldComponent extends BaseComponent<HTMLLabelElement> {
  private errorText: BaseComponent<HTMLSpanElement>;

  private input: BaseComponent<HTMLInputElement>;

  constructor(textContent: string) {
    super({ className: 'login-field', tag: 'label', textContent });

    const hyphenatedName = textContent.toLowerCase().split(' ').join('-');

    this.input = input({ className: 'login-field__input', name: hyphenatedName, type: 'text', required: true });
    this.errorText = span({ className: 'login-field__error-text' });

    this.appendChildren([this.input, this.errorText]);
  }

  public getInputNode(): HTMLInputElement {
    return this.input.getNode();
  }

  public getInputValue(): string {
    return this.input.getNode().value;
  }

  public setErrorText(errorText: string): void {
    this.errorText.getNode().textContent = errorText;
  }

  public setInputAttribute(attribute: string, value: string): void {
    this.input.setAttribute(attribute, value);
  }
}
