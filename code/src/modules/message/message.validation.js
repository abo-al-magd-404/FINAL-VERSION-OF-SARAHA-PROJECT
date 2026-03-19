import Joi from "joi";

export const message_schema = {
  body: Joi.object().keys({
    content: Joi.string().min(2).max(10000).required(),
  }),
};
