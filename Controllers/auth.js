exports.isLoggedIn = (req, res, next) => {
  !req.user || req.user.role !== "admin" ? res.redirect("/login") : next();
};
