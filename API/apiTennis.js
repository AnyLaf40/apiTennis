var express = require('express');
var mysql = require('mysql');
var sql = require('mssql');
var date = require('./date');

var pool = mysql.createPool({ //paramètres de connexion mysql
    connectionLimit: 10,
    host: "localhost",
    user: "API_Tennis",
    password: "api2020",
    database: "API_Tennis"
});


var server = 'localhost';
var port = 3000;
var app = express();

//route
var myRouter = express.Router();

myRouter.route('/joueurs/all')
    .get(function(req, res){ //connexion mysql
        pool.getConnection(function(err, connection) {
            if (err) throw err;
        
            //Selectionner tous les joueurs
            connection.query("SELECT * from joueurs", function(err, result, fields){
                connection.release();
                if (err) throw err;

                //répond en format json le résultat de la requête
                res.send(JSON.stringify(result));
            });
        });
    })

myRouter.route('/joueur')
    .get(function(req, res){ //connexion mysql
        pool.getConnection(function(err, connection) {
            if (err) throw err;
        
            //Selectionner tous les joueurs
            connection.query("SELECT * FROM joueurs WHERE nom = '" + req.query.nom + "' AND prenom = '" + req.query.prenom + "'", function(err, result, fields){
                connection.release();
                if (err) throw err;

                //répond en format json le résultat de la requête
                res.send(JSON.stringify(result));
            });
        });
    })

myRouter.route('/matchs/prochain')
    .get(function(req,res){
        dateJour = date.getDate();
        pool.getConnection(function(err, connection){
            if(err) throw err;

            connection.query("SELECT * FROM rencontres where date > '" + dateJour + "'", function(err, result, fields){
                connection.release();
                if (err) throw err;
                console.log(dateJour);
                res.send(JSON.stringify(result));
            });
        });
    })


app.use(myRouter);

app.listen(port, server, function() {
    console.log("Serveur : %s:%s", server, port);
});