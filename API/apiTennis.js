const express = require('express');
const mysql = require('mysql');
const date = require('./date/date');
const app =express();
const cors = require('cors');
const bodyParser = require('body-parser');
const requete = require('request');

const swaggerUi = require('swagger-ui-express');
const YAML = require('./node_modules/yamljs');
const swaggerDocument = YAML.load('./swagger/swagger.yaml');

app.use(cors());
app.use(bodyParser.json({limit: '10mb'}));
app.use(express.static('swagger'));
app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

var pool = mysql.createPool({ //paramètres de connexion mysql
    connectionLimit: 10,
    host: "localhost",
    user: "API_Tennis",
    password: "api2020",
    database: "API_Tennis"
});


var server = 'localhost';
var port = 3000;


//route
var myRouter = express.Router();

myRouter.route('/joueurs')
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
    .get(function(req, res){ 
        
        //connexion mysql
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

//prochains matchs 
myRouter.route('/matchs/prochain')
    .get(function(req,res){
        dateJour = date.getDate();
        pool.getConnection(function(err, connection){
            if(err) throw err;

            connection.query("SELECT Joueur1.Nom AS J1, Joueur2.Nom AS J2, DATE_FORMAT(date, '%d/%m/%y') as Date, lieu, court FROM rencontres INNER JOIN joueurs AS Joueur1 ON rencontres.idJoueur1 = Joueur1.id INNER JOIN joueurs AS Joueur2 ON rencontres.idJoueur2 = Joueur2.id WHERE Date >= CURRENT_DATE ORDER BY date DESC LIMIT 0," + req.query.nbMatch , function(err, result, fields){
                connection.release();
                if (err) throw err;
                var i = 0;
                while(result[i] != null)
                {
                    var test = apiMeteo(result[i].lieu);
                    console.log(test);
                    i++;
                }
                res.send(JSON.stringify(result));
            });
        });
    })

//Resultats 5 derniers matchs du joueur
myRouter.route('/resultats')
    .post(function(req,res){

        nomJoueur = req.body.name;
        if(nomJoueur)
        {
            pool.getConnection(function(err, connection){
                if(err) throw err;

                connection.query("SELECT Joueur1.Nom AS J1, Joueur2.Nom AS J2, JoueurVainqueur.Nom AS Vainqueur, date, lieu, court, set1, set2, set3, set4, set5 FROM rencontres INNER JOIN joueurs AS Joueur1 ON rencontres.idJoueur1 = Joueur1.id INNER JOIN joueurs AS Joueur2 ON rencontres.idJoueur2 = Joueur2.id INNER JOIN resultat ON rencontres.id = resultat.idMatch INNER JOIN joueurs AS JoueurVainqueur ON resultat.idVainqueur = JoueurVainqueur.id WHERE Joueur1.Nom = '" + nomJoueur + "' OR Joueur2.Nom = '" + nomJoueur + "' ORDER BY date DESC LIMIT 0,5", function(err, result, fields){
                    connection.release();
                    if (err) throw err;
                    res.send(JSON.stringify(result));
                });
            });
        }
        else
        {
            res.status(400).send("Il manque le nom du joueur");
        }

    })

//Statistiques des joueurs
myRouter.route('/stats')
    .post(function(req,res){

        nomJoueur = req.body.name;
        nbMatch = req.body.nbMatch;
        if(nomJoueur)
        {
            if(nbMatch == null) nbMatch = 10;
            pool.getConnection(function(err, connection){
                if(err) throw err;

                connection.query("SELECT Joueur1.Nom AS J1, Joueur2.Nom AS J2, JoueurVainqueur.Nom AS Vainqueur, date, lieu, court, set1, set2, set3, set4, set5 FROM rencontres INNER JOIN joueurs AS Joueur1 ON rencontres.idJoueur1 = Joueur1.id INNER JOIN joueurs AS Joueur2 ON rencontres.idJoueur2 = Joueur2.id INNER JOIN resultat ON rencontres.id = resultat.idMatch INNER JOIN joueurs AS JoueurVainqueur ON resultat.idVainqueur = JoueurVainqueur.id WHERE Joueur1.Nom = '" + nomJoueur + "' OR Joueur2.Nom = '" + nomJoueur + "' ORDER BY date DESC LIMIT 0," + nbMatch, function(err, result, fields){
                    connection.release();
                    if (err) throw err;
                    i = 0;
                    nbVictoire = 0;
                    while(result[i] != null)
                    {
                        if(result[i].Vainqueur == nomJoueur) nbVictoire++;
                        i++;
                    }

                    statMatchs = nbMatch/nbVictoire * 100;
                    var tab = { "name" : nomJoueur, "statsVictoire:" : statMatchs + "%"};
                    res.send(JSON.stringify(tab));
                });
            });
        }
        else
        {
            res.status(400).send("Il manque le nom du joueur");
        }

    })


app.use(myRouter);

app.listen(port, server, function() {
    console.log("Serveur : %s:%s", server, port);
});

function apiMeteo(lieu){

    var url = "https://api-adresse.data.gouv.fr/search/?q="+lieu;
    const insee = 0;
    requete(url, function(error,response,body){
        if (!error && response.statusCode == 200){
            test = JSON.parse(body);

            insee = test.features[0].properties.id;
        }
    });

    return insee;


}