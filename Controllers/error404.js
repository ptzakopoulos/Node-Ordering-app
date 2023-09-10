//Controller responsible for displaying page 404 in case of an invalid path
exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page 404",
  });
};
