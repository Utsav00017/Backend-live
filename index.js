const mysql = require('mysql2');
const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');

let PORT = process.env.PORT || 8802;
console.log(PORT);


var connection = mysql.createPool({
    host: "bfmwjxna9sogmrwqeucw-mysql.services.clever-cloud.com",
    user: "uubhegtrz09uguwi",
    port: '3306',
    password: "mOI5LPYJkYbIxbo7OBXR",
    database: 'bfmwjxna9sogmrwqeucw'
});

connection.getConnection(function (err) {
    if (err) throw err
    console.log('You are now connected with mysql database...');
})


const app = express();
app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json());
app.use(cors());

app.get('/',()=>{
    console.log("connected");
})

app.get('/studentdetails', (req, res) => {
    var sql = "select * from students_detail";
    connection.query(sql, function (error, result) {
        if (error) {
            res.end(JSON.stringify(error));
        } else {
            res.end(JSON.stringify(result));
        }
    });
});

app.post('/poststudentdetails', (req, res) => {
    var sql = "insert into students_detail(student_name,college,standerd,gender,skills) values (?)";
    var customObj = [
        req.body.student_name,
        req.body.college,
        req.body.standerd,
        req.body.gender,
        req.body.skills
    ]
    console.log(customObj);
    connection.query(sql, [customObj], function (error, result) {
        if (error) {
            res.end(JSON.stringify(error));
        } else {
            res.send({
                data: result,
                message: "Data saved successfully !"
            });
        }
    });
});


app.get('/singlestudentdetails/:sid', (req, res) => {
    var studentId = req.params.sid;
    var sql = "select * from students_detail where studentid = ?";

    connection.query(sql, [studentId], function (error, result) {
        if (error) {
            res.end(JSON.stringify(error));
        } else {
            res.end(JSON.stringify(result));
        }
    });
});

app.put('/editstudentdetails/:sid', (req, res) => {
    var studentId = req.params.sid;
    var sql = "update students_detail set student_name =?,college =?,standerd=?,gender=?,skills=? where studentid = ?";
    var student = [
        req.body.student_name,
        req.body.college,
        req.body.standerd,
        req.body.gender,
        req.body.skills
    ];
    console.log(student);
    connection.query(sql, [...student, studentId], function (error, result) {
        if (error) {
            res.end(JSON.stringify(error));
        } else {
            return res.send({
                data: result,
                message: "Record Updated Succesfully."
            });
        }
    });
});


app.delete('/deletestudentdetails/:sid', (req, res) => {
    var sql = "delete from students_detail where studentid = ?";
    // var id = req.params.id;

    connection.query(sql, [req.params.sid], function (error, result) {
        if (error) {
            res.end(JSON.stringify(error));
        } else {
            res.send({
                message: "Record Deleted Successfully."
            });
        }
    });
});


app.post('/studentdelete', (req, res) => {
    console.log(req.body.ids)
    var sql = "delete from students_detail where studentid in (" + req.body.ids + ")";

    connection.query(sql, function (error, result) {
        if (error) {
            res.end(JSON.stringify(error));
        } else {
            res.send({
                message: "Record deleted successfully."
            });
        }
    });
});

app.listen(PORT, () => {
    console.log("connect to backend");
});