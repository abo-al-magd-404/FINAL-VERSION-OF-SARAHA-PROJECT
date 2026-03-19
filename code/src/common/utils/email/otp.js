export const create_OTP = async () => {
  return Math.floor(Math.random() * 900000) + 100000;
};
