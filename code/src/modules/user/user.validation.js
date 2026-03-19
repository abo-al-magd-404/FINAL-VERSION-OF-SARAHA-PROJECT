import Joi from "joi";

export const ValidateProfileImage_schema = {
  file: Joi.object().keys({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    finalPath: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  }),
};
export const ValidateCoverImages_schema = {
  files: Joi.array()
    .items(
      Joi.object().keys({
        fieldname: Joi.string().required(),
        originalname: Joi.string().required(),
        encoding: Joi.string().required(),
        mimetype: Joi.string().required(),
        finalPath: Joi.string().required(),
        destination: Joi.string().required(),
        filename: Joi.string().required(),
        path: Joi.string().required(),
        size: Joi.number().required(),
      }),
    )
    .min(1)
    .max(5)
    .required(),
};

export const update_Password_Schema = {
  body: Joi.object()
    .keys({
      oldPassword: Joi.string().min(8).required(),
      newPassword: Joi.string().min(8).not(Joi.ref("oldPassword")).required(),
      confirmPassword: Joi.ref("newPassword"),
    })
    .required(),
};
