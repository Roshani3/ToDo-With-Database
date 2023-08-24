const mongoose = require("mongoose");

module.exports.init = async function () {
  await mongoose.connect(
   
    "mongodb+srv://app:easypass@cluster0.kymc3tz.mongodb.net/ToDoApp?retryWrites=true&w=majority"
    
  );
};
