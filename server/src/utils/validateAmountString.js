const AMOUNT_PATTERN = /^(0|[1-9]\d*)(\.\d{1,2})?$/;

// validate whether the amount is a decimal string with up to 2 decimal places
export const isValidAmountString = (value) => {
  return typeof value === 'string' && AMOUNT_PATTERN.test(value);
};
