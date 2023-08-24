const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    id : String,
    inp: String,
    pri : String,
    done : String,
    todoimg : String,
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;