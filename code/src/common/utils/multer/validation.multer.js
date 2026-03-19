export const allowedFiles = {
  image: ["image/jpeg", "image/jpg", "image/png"],
  video: ["video/mp4"],
};

export const fileFilter = (validation = []) => {
  return function (req, file, cb) {
    if (!validation.includes(file.mimetype)) {
      return cb(new Error("invalid file format"));
    }
    return cb(null, true);
  };
};
