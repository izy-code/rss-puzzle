import './login-page.scss';
import BaseComponent from '@/app/components/base-component';
import { form, h1, main } from '@/app/components/tags';
import ButtonComponent from '@/app/components/button/button';
import LoginFieldComponent from './login-field/login-field';

export default class LoginPageComponent extends BaseComponent {
  private main: BaseComponent;

  private form: BaseComponent;

  private submitButton: BaseComponent<HTMLButtonElement>;

  private nameField: LoginFieldComponent;

  private surnameField: LoginFieldComponent;

  constructor() {
    super({ className: 'app-container__page login-page' });

    const header = h1('visually-hidden', 'Word puzzle application');

    this.nameField = new LoginFieldComponent('First Name:');
    this.nameField.addClass('login-page__field');
    this.nameField.setInputAttribute('autofocus', 'true');
    this.nameField.getInputNode().addEventListener('input', this.checkInputContent.bind(this));

    this.surnameField = new LoginFieldComponent('Surname:');
    this.surnameField.addClass('login-page__field');
    this.surnameField.getInputNode().addEventListener('input', this.checkInputContent.bind(this));

    this.submitButton = ButtonComponent({
      className: 'login-page__submit-button button',
      textContent: 'Login',
      buttonType: 'submit',
    });
    this.submitButton.setAttribute('disabled', 'true');
    this.form = form(
      { className: 'login-page__form', method: 'post' },
      this.nameField,
      this.surnameField,
      this.submitButton,
    );
    this.main = main({ className: 'login-page__main' }, header, this.form);

    this.appendChildren([this.main]);
  }

  private checkInputContent(): void {
    const nameValue: string = this.nameField.getInputValue();
    const surnameValue: string = this.surnameField.getInputValue();

    if (nameValue && surnameValue) {
      this.submitButton.removeAttribute('disabled');
    } else {
      this.submitButton.setAttribute('disabled', 'true');
    }
  }
}
