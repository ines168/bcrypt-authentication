const express = require("express");
const app = express();

const User = require("./models/user");

const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost:27017/authDemo", {
    useNewUrlParser: true, useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"))
db.once("open", () => {console.log("Database connected!")});

const bcrypt = require("bcrypt");
const session = require("express-session");
app.use(session({secret: "notagoodsecret"}));

const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended:true}));

const requireLogin = (req, res, next) => {
    if(!req.session.user_id) {
        return res.redirect("/login");
    }
    next();
};

app.get("/", (req, res) => {
    res.send("This is a home page!");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", async (req, res) => {
    const {password, username} = req.body;
    // const hash = await bcrypt.hash(password, 12);
    // moved to user model
    // const user = new User({
    //     username, 
    //     password: hash
    // });
    const user = new User({username, password});
    await user.save();
    req.session.user_id = user._id;
    res.redirect("/");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.post("/login", async (req, res) => {
    const {password, username} = req.body;
    const authUser = await User.findAndValidate(username, password);
    if(authUser) {
        req.session.user_id = authUser._id;
        res.redirect("/secret");
    } else {
        res.redirect("/login");
    }
})

app.post("/logout", (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect("/login");
})

// refactored with requireLogin middleware
// app.get("/secret", (req, res) => {
//     if(!req.session.user_id) {
//         return res.redirect("/login")
//     }
//     res.render("secret");
// })

app.get("/secret", requireLogin, (req, res) => {
    res.render("secret");
});

app.get("/topsecret", requireLogin, (req, res) => {
    res.send("top secret");
});

app.listen(3000, () => {
    console.log("Listening on port 3000!")
})