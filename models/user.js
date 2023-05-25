const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, "Username cannot be blank"]
    },
    password: {
        type: String, 
        required: [true, "Password cannot be blank"]
    }
});

userSchema.statics.findAndValidate = async function(username, password) {
    const foundUser = await this.find({username});
    for (let user of foundUser) {
        const hash = user.password;
        const verify = await bcrypt.compare(password, hash);
        if(verify) {
            return user;
        }
    }
    return false;
}

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;