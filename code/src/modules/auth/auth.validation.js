import joi from "joi";

export const forget_password_schema = {
  body: joi.object().keys({
    email: joi.string().email({ minDomainSegments: 2 }),
  }),
};

export const login_schema = {
  body: joi
    .object()
    .keys({
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          maxDomainSegments: 3,
          tlds: { allow: ["com", "lookout"] },
        })
        .required(),
      password: joi.string().min(8),
    })
    .required(),
};
export const signup_schema = {
  body: joi
    .object()
    .keys({
      username: joi
        .string()
        .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/))
        .required(),
      phone: joi
        .string()
        .pattern(new RegExp(/^01{1}(0|1|2|5){1}[0-9]{8}$/))
        .required(),
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          maxDomainSegments: 3,
          tlds: { allow: ["com", "lookout"] },
        })
        .required(),
      password: joi.string().min(8),
    })
    .required(),
};
export const confirm_email_schema = {
  body: joi
    .object()
    .keys({
      otp: joi.string().min(6).required(),
      email: joi
        .string()
        .email({
          minDomainSegments: 2,
          maxDomainSegments: 3,
          tlds: { allow: ["com", "lookout"] },
        })
        .required(),
    })
    .required(),
};
