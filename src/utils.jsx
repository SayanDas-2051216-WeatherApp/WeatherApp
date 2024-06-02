// utils.jsx
export const formatTemperature = (temp, isFahrenheit) => {
  if (temp == null) return '';
  const tempValue = isFahrenheit ? (temp * 9 / 5) + 32 : temp;
  return tempValue.toFixed(2);
};
