import express from 'express';
// import cars from './data/carsData1.json';
import mysql from 'mysql';

// Create Connection 
const db  = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin123",
    database: 'CARS'
});

db.connect(err=>{
    if (err) throw err;
    console.log("Connected!");
})

//const express = require('express')
const app = express()

app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-Width, Content-Type,Accept");
    next();
})

app.get('/cars', (req, res) => {
   // res.json(cars);
    let sql = 'SELECT * FROM CAR';
    let query = db.query(sql,(err, results)=>{
        if(err) throw err;
        console.log(results);
        res.json(results);
    })
})

app.listen(3000, () => console.log("cars"));