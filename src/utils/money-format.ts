export const moneyFormater = (
  amount: string | number,
  currencyCode: string
) => {
  return `${currencyCode} ${Number(amount).toFixed(2)}`;
};
