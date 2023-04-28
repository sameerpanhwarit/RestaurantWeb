const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const encoder = bodyParser.urlencoded({extended:true});
const ejs = require('ejs');

const app = express();
app.use(encoder);
app.use("/assets",express.static("assets"));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "restaurant"
});

connection.connect(function(error){
    if(error) throw error
    else console.log("Connection Established");
});

app.get("/",function(req,res){
    if (req.session.userId) {
        res.redirect("dashboard");
    } else {
        res.sendFile(__dirname+"/login.html");
    }
});

app.post("/",function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    connection.query("select * from users where email = ? and password = ?",[email,password],function(error,results,fields){
        if (results.length > 0){
            req.session.userId = results[0].id;
            res.redirect("dashboard");
        }
        else{
            res.redirect("/")
        }
        res.end();
    })
});

app.get("/signup",function(req,res){
    if (req.session.userId) {
        res.redirect("dashboard");
    } else {
        res.sendFile(__dirname+"/signup.html");
    }
});

app.post("/signup",function(req,res){
    var name = req.body.fullname;
    var email = req.body.email;
    var password = req.body.password;
    connection.query("insert into users (name, email, password) VALUES(?,?,?)",[name,email,password],function(error,results,fields){
      if (error){
        res.redirect("signup")
      }  
      else{
        req.session.userId = results.insertId;
        res.redirect("/")
      }
    })
});


app.get('/cart', function(req, res) {
    const userId = req.session.userId;
    const query = 'SELECT SUM(price) AS total_price FROM cart WHERE userid = ?';
    connection.query(query, [userId], function(err, results) {
      if (err) {
        console.error('Error fetching cart data from MySQL: ', err);
        return;
      }
      const total = results[0].total_price;
      const itemQuery = 'SELECT * FROM cart WHERE userid = ?';
      connection.query(itemQuery, [userId], function(err, results) {
        if (err) {
          console.error('Error fetching cart data from MySQL: ', err);
          return;
        }
        res.render("cart.ejs", { items: results, total: total });
      });
    });
  });

app.post("/order-confirm", function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var address = req.body.address;
    connection.query("insert into reservetable (name,email,phone,Address) VALUES(?,?,?,?)",[name,email,phone,address],function(error,results,fields){
        if(error){
            res.redirect("cart");
        }
        else{
            res.redirect("dashboard")
        }
    })

});

app.post("/add-to-cart",function(req,res){
    if (req.session.userId) {
        var uid = req.session.userId;
        var name=  req.body.item1;
        var price =req.body.price1;
        var quantity = req.body.quantity;
        var totalPrice = price*quantity;
        connection.query("insert into cart (item,quantity,price,userid) VALUES(?,?,?,?)",[name,quantity,totalPrice,uid],function(error,results,fields){
            if(error){
                res.redirect("dashboard")
            }
            else{
                res.redirect("cart")
            }
        })
    } else {
        res.redirect("/");
    }
    
});


app.get("/dashboard",function(req,res){
    if (req.session.userId) {
        res.sendFile(__dirname+"/index.html")
    } else {
        res.redirect("/");
    }
});



app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });

  
app.listen(4500);