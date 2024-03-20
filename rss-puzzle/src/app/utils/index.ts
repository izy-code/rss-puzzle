type ConstructorOf<T> = { new (...args: unknown[]): T; prototype: T };

export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined) {
    throw new Error(`Value not defined`);
  }

  if (value === null) {
    throw new Error(`Value is null`);
  }
}

export function isNotNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function assertObjectType<T>(object: unknown, expectedType: ConstructorOf<T>): asserts object is NonNullable<T> {
  assertIsDefined(object);

  if (!(object instanceof expectedType)) {
    throw new TypeError(`Wrong object type`);
  }
}

export const queryElement = <T extends Element>(
  container: Element | Document | DocumentFragment,
  selector: string,
  expectedType: ConstructorOf<T>,
): T => {
  const queriedElement = container.querySelector<T>(selector);

  assertObjectType(queriedElement, expectedType);

  return queriedElement;
};

export const getClosestFromEventTarget = (evt: Event | Touch, closestSelectors: string): HTMLElement | null => {
  const { target } = evt;

  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target.closest(closestSelectors);
};

export const dispatchCustomEvent = <T>(node: HTMLElement, eventType: string, detailObject?: T): void => {
  node.dispatchEvent(
    new CustomEvent(eventType, {
      bubbles: true,
      detail: detailObject,
    }),
  );
};
