export const capitalizeFirstLetter = (value: null | string): string => {
  if (!value) return <string>value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const regexConstant = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PASSWORD: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+380\d{9}$/,
  AGE: /^(1[89]|[2-5][0-9]|60)$/,
};
