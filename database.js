const mysql = require('mysql2');
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs'); 

var crypto = require('crypto');
const { json } = require('body-parser');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'utsavbutani1234@gmail.com',
      pass: 'ltpj uzeb npto zvld'
    }
  });

var connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    port: '3306',
    password: "root",
    database: 'db_business_master'
});

connection.connect(function (err) {
    if (err) throw err
    console.log('You are now connected with mysql database...');
})

const app = express();
app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());
app.use(cors());


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('photo'), (req, res) => {
  const { fname, lname } = req.body;
  const photo = req.file.path;

  const query = 'INSERT INTO userphoto (fname, lname, photo) VALUES (?, ?, ?)';
  connection.query(query, [fname, lname, photo], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.status(200).send('Data inserted successfully');
    }
  });
});  

app.get("/business",(req,res)=>{
    var sql = "select * from tbl_business";

    connection.query(sql,function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    });
});

app.post("/Addbusiness/:businessname",(req,res)=>{
    var sql = "insert into tbl_business(business_name) values (?)";

    connection.query(sql,[req.params.businessname],function(error,result){
        if(error){
            res.end(JSON.stringify(error))
        }else{
            res.send({
                data:result,
                message:"Data saved Successfull !"
            })
        }
    });
});

app.get("/GetSingleBusiness/:id",(req,res)=>{
    var sql = "select * from tbl_business where business_id = ?";

    var id = [req.params.id];
    connection.query(sql,[id],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    });
});

app.post("/Addbusinesscategory",(req,res)=>{
    
    var categoryData = [
        req.body.business_id,
        req.body.business_category,
        req.body.category_type
    ]
    
    var sql = "insert into tbl_business_category(business_id,business_category,category_type) values (?)";
    connection.query(sql,[categoryData],function(error,result){
        if(error){
            res.end(JSON.stringify(error))
        }else{
            res.send({
                data:result,
                message:"Data saved Successfull !"
            })
        }
    });
});


app.get("/getCategories/:id",(req,res)=>{
    var sql = "select * from tbl_business_category where business_id = ?";

    connection.query(sql,[req.params.id],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    })
})

app.post("/ManageTransaction",(req,res)=>{
    var sql = "insert into tbl_transaction_detail(category_id,date,category_type,transaction_remark,transaction_amount) values (?)"

    var TransactionData = [
        req.body.category_id,
        req.body.date,
        req.body.category_type,
        req.body.remark,
        req.body.amount
    ]

    connection.query(sql,[TransactionData],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    })
})


app.put("/handlebalance/:id",(req,res)=>{
    var sql = "update tbl_business set balance = ? where business_id = ?";
    var balance = [req.body.total];

    connection.query(sql,[...balance,req.params.id],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.send({
                data:result,
                message:"Data Updated Successfully !"
            })
        }
    });
});

app.get("/Transactionhistory/:id",(req,res)=>{
    var sql = "select tblt.transaction_id,date_format(tblt.date,'%Y-%m-%d') as transaction_date,tblc.category_type,tblc.business_category,tblt.transaction_remark,tblt.transaction_amount from tbl_transaction_detail tblt inner join tbl_business_category tblc on tblt.category_id = tblc.category_id where business_id = ?";

    connection.query(sql,[req.params.id],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    })
});


app.get("/GetsingleTransaction/:T_id",(req,res)=>{
    var sql = "select * from tbl_transaction_detail where transaction_id = ?";
    connection.query(sql,[req.params.T_id],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    });
});

app.put("/UpdateTransaction/:transactionid",(req,res)=>{
    var Id = req.params.transactionid;
    var TransactionData = [
        req.body.category_id,
        req.body.date,
        req.body.category_type,
        req.body.remark,
        req.body.amount
    ]
    var sql = "update tbl_transaction_detail set category_id = ?, date = ? , category_type = ?,transaction_remark = ?,transaction_amount = ? where transaction_id = ?";

    connection.query(sql,[...TransactionData,Id],function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.send({
                data:result,
                message:"Data Updated Successfully."
            })
        }
    })
});


app.post("/filterTransaction",(req,res)=>{
    var sql = "call sp_getTransactionDetails(?, ?, ?, ?, ?)";

    var data = [
        req.body.id,
        req.body.type,
        req.body.businesscat,
        req.body.startdate,
        req.body.enddate
    ]
    connection.query(sql,data,function(error,result){
        if(error){
            res.end(JSON.stringify(error));
        }else{
            res.end(JSON.stringify(result));
        }
    });
});

app.post("/Mail",(req,res)=>{

    var mailOptions = {
        from: 'utsavbutani1234@gmail.com',
        to: req.body.mail,
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };
      console.log(req.body.mail);
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
});

app.listen(1000, () => {
    console.log("connect to backend");
})