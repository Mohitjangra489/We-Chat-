const { json } = require('body-parser');
const e = require('express');
const bcrypt = require('bcrypt');
const saltRounds =10;
const express = require('express');
var session = require('express-session');
const groupmodel = require('./database/group');
const messagemodel = require('./database/message');
const userModel = require('./database/users');

const PORT = process.env.PORT || 3000

// http.listen(PORT,()=>{
//     console.log('listening pon port ${PORT}');
// })

const app = express();
const port = 3000;

const http = require('http').createServer(app);

app.set("view engine", "ejs");
app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.static('design'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

const initdb = require('./database/init');
initdb();



app.get('/', function (req, res) {
    if (req.session.islogged === true) {
        console.log(req.session.activeuser.name);
        res.render("chatpage.ejs", ({ user: req.session.activeuser.name }));
    }
    else {
        res.redirect("/login");
    }

});

app.get("/login", function (req, res) {

    if (req.session.islogged === true) {
        res.redirect("/");
    }
    else {

        res.render("login.ejs", { error: '' });
    }
});

app.post("/login", function (req, res) {
    let logindata = req.body;
    console.log(logindata);
    userModel.find({ username: logindata.username }, (err, doc) => {
        if (doc.length == 0) {
            console.log("error")
            res.render("login.ejs", { error: "User not found!" });
            return;
        }

        else {
            let newdata = doc[0];
            let myPlaintextPassword=logindata.password;
            let hash=newdata.password;
            let password;
            bcrypt.compare(myPlaintextPassword, hash, function(err, result)
            {
                password=result;
                if (newdata.username == logindata.username && password) {
                    console.log("inside else if");
                    req.session.activeuser = newdata;
                    req.session.islogged = true;
                    res.redirect("/");
                    return;
                }
                else {
                        res.render("login.ejs", { error: "Invalid Credentials" });
                        return;
                    
                }
            });

           
        }
    });
})

app.get("/signup", function (req, res) {
    if (req.session.islogged === true) {
        res.redirect("/");
    }
    else {
        res.render("signup", { error: '' });
    }
});


app.post('/signup', function (req, res) {
    let { name, username, password } = req.body;
     let myPlaintextPassword=password;
     let hashedpassword;
    bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
        hashedpassword=hash;
        userModel.find({}, (err, data) => {
            if (err) {
                res.render("signup", { error: "User not found!" });
                return;
            }
            else {
                let users = data;
                for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    if (user.username === username) {
                        res.render("signup", { error: "User already exists!" });
                        return;
                    }
                }
              
                let user = {
                    name: name,
                    username: username,
                    password: hashedpassword,
                }
    
                let newuser = new userModel(user);
                newuser.save();
                req.session.islogged = true;
                req.session.activeuser = user;
                res.redirect("/login");
    
            }
        })
    });

   


});

app.get("/grouppage", function (req, res) {
    if (req.session.islogged == true) {
        res.render("grouppage");
    }
    else {
        res.redirect("/login");
    }
})


app.get("/logout", function (req, res) {
    req.session.islogged = false;
    req.session.destroy();

    res.redirect("/login");


});

//socket.......................................................................................................................

const io = require('socket.io')(http);

//after connection this function is used.

io.on('connection', (socket) => {
    console.log('connected...');
    socket.on('joinroom', (msg) => {

        socket.join(msg);
    });

    socket.on('userdata', async (data) => {

        let auser = data;
        let newlist = [];
        let user = await userModel.findOne({ name: auser });
        let usergroupid = user.groupId;
        if (usergroupid.length > 0) {
            let groups = [];
            for (let i = 0; i < usergroupid.length; i++) {
                let a = await groupmodel.findOne({ _id: usergroupid[i] });
                groups.push(a);
            }

            console.log("groups=", groups);
            for (let j = 0; j < groups.length; j++) {
                if (groups[j].member[0] == auser) {
                    let info = groups[j].member[1];
                    newlist.push(info);

                }
                else {
                    let info = groups[j].member[0];
                    newlist.push(info);
                }

            }
        }

        console.log(newlist);
        let notfriendlist = [];
        let allusers = await userModel.find({ name: { $ne: auser } });
        console.log("allusers=", allusers);
        for (let m = 0; m < allusers.length; m++) {
            let u = allusers[m].name;
            if (!newlist.includes(u)) {
                notfriendlist.push(u);
            }
        }
        socket.emit("userdata", notfriendlist);
    });


    socket.on("message",async (msg) => {
        console.log("msg", msg);
        let message = msg;
        await groupmodel.updateOne({_id:msg.groupid},{lastmessage:msg});
        let newmessage = new messagemodel(message);
        newmessage.save();
        socket.to(msg.groupid).emit('messenger', msg);
    });

    socket.on("groupdetails", async (data) => {
        let user1 = data.user1; // here user1 is activeuser on client side who is logged at client side.....
        let user2 = data.user2;
        console.log(user1, user2);
        let group = {
            member: [user1, user2],
            name: [user1, user2],
        }

        let newgroup = new groupmodel(group);
        let id = newgroup._id;
        newgroup.save();
        console.log(id);

        let person1 = await userModel.findOneAndUpdate({ name: user1 }, { $push: { groupId: id } });
        let person2 = await userModel.findOneAndUpdate({ name: user2 }, { $push: { groupId: id } });

        userModel.find({ name: user1 }, (err, data) => {
            console.log("data=", data);
            let groups = data[0].groupId;
            if (groups) {
                let newarray = [];
                groups.forEach(async (element, index) => {

                    let data = await groupmodel.find({ _id: element });
                    console.log(data);

                    let obj = {
                        name: data[0].member[1],
                        id: element
                    }

                    newarray.push(obj);
                    console.log(newarray);

                    if (groups.length - 1 == index) {
                        socket.emit("groupdetails", newarray);
                    }
                });
            }

        });
    })

    
    socket.on("giveusers", (data) => {
        console.log("activeuser=", data);
        let active = data;
        let acx;
        userModel.find({ name: active }, async (err, data) => {
            let groups = data[0].groupId;
            let newarray = [];
            let check;
            for (let i = 0; i < groups.length; i++) {
                let data = await groupmodel.find({ _id: groups[i] });
                if (data[0].name.length > 1) {
                    if (data[0].member[1] == active) {
                        acx = data[0].member[0];
                        check=false;
                    }
                    else {
                        acx = data[0].member[1];
                         check=false;
                    }
                }
                else
                {
                    acx=data[0].name[0];
                    check=true;

                }
                let obj = {
                    name: acx,
                    id: groups[i],
                    group:check,
                    lastmessage: data[0].lastmessage
                }

                newarray.push(obj);
            }

            socket.emit("takeuser", newarray);
        });
    });

    socket.on("givemessages", (details) => {
        console.log(details);
        messagemodel.find({ groupid: details }, (err, data) => {
            console.log("givemessage channel messages=", data);
            socket.emit("takemessagedetails", data);
        })
    });

    socket.on("givegrouppageusers", (data) => {
        let active = data;
        let acx;
        userModel.find({}, async (err, data) => {
            console.log("allusers", data);
            let groups = data;
            let newarray = [];
            for (let i = 0; i < groups.length; i++) {
                acx = groups[i].name;
                if (acx != active) {
                    newarray.push(acx);
                }
            }
            socket.emit("takegrouppageusers", newarray);
        });
    });

    socket.on("creategroup", async (data) => {
        console.log("creategroup", data);
        let group = {
            member: data.users,
            name: data.groupname
        }
        let newgroup = new groupmodel(group);
        let id = newgroup._id;
        newgroup.save();
        let array = data.users;
        for (let i = 0; i < array.length; i++) {
            console.log(array[i]);
            let r = await userModel.findOneAndUpdate({ name: array[i] },{ $push: { groupId: id } });
        }
    })


    socket.on('disconnect', (socket) => {
        console.log('disconnected...');
    });
});


http.listen(port, () => {
    console.log("server started at port %d", port);
})