export const formatUah = (value: number) =>
  `${new Intl.NumberFormat("uk-UA").format(value).replace(/ /g, " ")} грн`;
