import './login-page.scss';
import BaseComponent from '@/app/components/base-component';
import { form, h1, main } from '@/app/components/tags';
import ButtonComponent from '@/app/components/button/button';
import LoginFieldComponent from './login-field/login-field';
import type LocalStorage from '@/app/utils/local-storage';
import type Router from '@/app/router/router';
import { Pages } from '@/app/router/pages';

enum FieldMinLength {
  NAME = 3,
  SURNAME = 4,
}

export default class LoginPageComponent extends BaseComponent {
  private main: BaseComponent;

  private form: BaseComponent;

  private submitButton: BaseComponent<HTMLButtonElement>;

  private nameField: LoginFieldComponent;

  private surnameField: LoginFieldComponent;

  private storage: LocalStorage;

  private router: Router;

  constructor(router: Router, storage: LocalStorage) {
    super({ className: 'app-container__page login-page' });

    const header = h1('visually-hidden', 'Word puzzle application');

    this.nameField = new LoginFieldComponent('First Name:');
    this.nameField.addClass('login-page__field');
    this.nameField.setInputAttribute('autofocus', '');
    this.nameField.addListener('input', this.onFieldInput.bind(this));

    this.surnameField = new LoginFieldComponent('Surname:');
    this.surnameField.addClass('login-page__field');
    this.surnameField.addListener('input', this.onFieldInput.bind(this));

    this.submitButton = ButtonComponent({
      className: 'login-page__submit-button button',
      textContent: 'Login',
      buttonType: 'submit',
      clickHandler: this.onSubmitButtonClick,
    });
    this.submitButton.setAttribute('disabled', '');
    this.form = form(
      { className: 'login-page__form', method: 'post' },
      this.nameField,
      this.surnameField,
      this.submitButton,
    );
    this.main = main({ className: 'login-page__main' }, header, this.form);

    this.appendChildren([this.main]);
    this.router = router;
    this.storage = storage;
  }

  private onFieldInput(evt: Event): void {
    const nameValue: string = this.nameField.getInputValue();
    const surnameValue: string = this.surnameField.getInputValue();

    if (nameValue && surnameValue) {
      this.submitButton.removeAttribute('disabled');
    } else {
      this.submitButton.setAttribute('disabled', '');
    }

    if (this.nameField.getNode() === evt.currentTarget) {
      this.nameField.setErrorText('');
      this.nameField.removeClass('login-field--error');
    } else {
      this.surnameField.setErrorText('');
      this.surnameField.removeClass('login-field--error');
    }
  }

  private static getFieldValidationErrors(fieldName: string, fieldValue: string, minLength: number): string {
    const validCharsRegex = /^[a-zA-Z-]*$/;
    let validationErrorsString = '';

    if (!validCharsRegex.test(fieldValue)) {
      validationErrorsString += `${fieldName} must contain only English letters and hyphens`;
    }

    if (fieldValue[0] !== fieldValue[0]?.toUpperCase()) {
      validationErrorsString += `${fieldName} must start with an uppercase letter`;
    }

    if (fieldValue.length < minLength) {
      validationErrorsString += `${fieldName} must be at least ${minLength} characters long`;
    }

    return validationErrorsString.split(fieldName).join(`\n⦁  ${fieldName}`).trim();
  }

  private static updateFieldErrorState(field: LoginFieldComponent, errors: string): void {
    if (errors) {
      field.setErrorText(errors);
      field.addClass('login-field--error');
    }
  }

  private areFieldsValid(): boolean {
    const nameFieldValue: string = this.nameField.getInputValue();
    const surnameFieldValue: string = this.surnameField.getInputValue();

    const nameFieldErrors = LoginPageComponent.getFieldValidationErrors(
      'First Name',
      nameFieldValue,
      FieldMinLength.NAME,
    );
    const surnameFieldErrors = LoginPageComponent.getFieldValidationErrors(
      'Surname',
      surnameFieldValue,
      FieldMinLength.SURNAME,
    );

    LoginPageComponent.updateFieldErrorState(this.nameField, nameFieldErrors);
    LoginPageComponent.updateFieldErrorState(this.surnameField, surnameFieldErrors);

    return !nameFieldErrors && !surnameFieldErrors;
  }

  private onSubmitButtonClick = (evt?: Event | undefined): void => {
    if (evt) {
      evt.preventDefault();
    }

    if (this.areFieldsValid()) {
      this.storage.setField('loginData', {
        name: this.nameField.getInputValue(),
        surname: this.surnameField.getInputValue(),
      });

      this.router.navigate(Pages.START);
    }
  };
}
