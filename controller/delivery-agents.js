// Require Post Schema from Model..

exports.updateStatus = async (req, res, next) => {
  try {

      let data = req.body;
      console.log(data);

      res.status(200).json({
          message: "Status updated successfully",
      });
  } catch (err) {
      console.log(err);
      if (!err.statusCode) {
          err.statusCode = 500;
          err.message = "Something went wrong on database operation!";
      }
      next(err);
  }
};

