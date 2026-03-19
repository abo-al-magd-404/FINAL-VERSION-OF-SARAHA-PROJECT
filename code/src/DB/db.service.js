export const findOne = async ({ model, filter, select = "" }) => {
  return await model.findOne(filter).select(select);
};
export const find = async ({ model, filter = {}, populate = null }) => {
  let query = model.find(filter);

  if (populate) {
    query = query.populate(populate);
  }

  return await query;
};
export const findById = async ({
  model,
  id,
  projection = null,
  options = {},
}) => {
  return await model.findById(id, projection, options);
};
export const create = async ({ model, data }) => {
  return await model.create(data);
};
export const insertMany = async ({ model, data, options = {} }) => {
  return await model.insertMany(data, options);
};
export const updateOne = async ({ model, filter, newValues }) => {
  return await model.updateOne(filter, { $set: newValues });
};
export const updateMany = async ({
  model,
  filter,
  newValues,
  options = {},
}) => {
  return await model.updateMany(filter, { $set: newValues }, options);
};
export const findOneAndUpdate = async ({
  model,
  filter,
  newValues,
  options = { new: true },
}) => {
  return await model.findOneAndUpdate(filter, newValues, options);
};
export const findByIdAndUpdate = async ({
  model,
  id,
  newValues,
  options = { new: true },
}) => {
  return await model.findByIdAndUpdate(id, newValues, options);
};
export const deleteOne = async ({ model, filter }) => {
  return await model.deleteOne(filter);
};
export const deleteMany = async ({ model, filter }) => {
  return await model.deleteMany(filter);
};
export const findOneAndDelete = async ({ model, filter }) => {
  return await model.findOneAndDelete(filter);
};
export const findByIdAndDelete = async ({ model, id }) => {
  return await model.findByIdAndDelete(id);
};
export const aggregate = async ({ model, pipeline = [] }) => {
  return await model.aggregate(pipeline);
};
