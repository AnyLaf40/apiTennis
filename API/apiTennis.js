const express = require('express');
const mysql = require('mysql');
const date = require('./date/date');
const app =express();
const cors = require('cors');
const bodyParser = require('body-parser');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

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

myRouter.route('/joueurs') //Obtenir tous les joueurs de tennis de la base
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

myRouter.route('/joueur') //obtenir les informations sur un joueur 
    .get(function(req, res){ 
        
        //connexion mysql
        pool.getConnection(function(err, connection) {
            if (err) throw err;
        
            //Selectionner le joueur
            connection.query("SELECT * FROM joueurs WHERE nom = '" + req.query.nom + "' AND prenom = '" + req.query.prenom + "'", function(err, result, fields){
                connection.release();

                if (err) throw err;

                if(result[0] == null) res.status(400).send("Le joueur n'existe pas");

                else res.send(JSON.stringify(result));

            });
        });
    })

myRouter.route('/prochainsMatchs/:nbMatchs') //obtenir les prochains matchs prévus en France
    .get(function(req,res){

        pool.getConnection(function(err, connection){
            if(err) throw err;

            connection.query("SELECT rencontres.id, Joueur1.Nom AS J1, Joueur2.Nom AS J2, DATE_FORMAT(date, '%d/%m/%Y') as Date, lieu, court, meteo FROM rencontres INNER JOIN joueurs AS Joueur1 ON rencontres.idJoueur1 = Joueur1.id INNER JOIN joueurs AS Joueur2 ON rencontres.idJoueur2 = Joueur2.id WHERE Date >= CURRENT_DATE ORDER BY date ASC LIMIT 0," + req.params.nbMatchs , function(err, result, fields){
                connection.release();

                if (err) throw err;

                if(result[0] == null) res.status(400).send("Erreur de la requete");

                res.send(JSON.stringify(result)); 
            });
        });
    })

myRouter.route('/MAJMeteo') //Mettre à jour la meteo dans la base
    .get(function(req,res){
        dateJour = date.getDate();
        pool.getConnection(function(err, connection){
            if(err) throw err;

            connection.query("SELECT id, DATE_FORMAT(date, '%d/%m/%Y') as Date, lieu, meteo FROM rencontres WHERE Date >= CURRENT_DATE ORDER BY date", function(err, result, fields){
                
                if (err) throw err;

                callExternalApi(result);

                res.status(200).send("Meteo mise a jour");     
            });
        });
})

myRouter.route('/resultats/:nomJoueur/:nbMatchs') //Les résultats d'un joueur
    .get(function(req,res){

        nomJoueur = req.params.nomJoueur;
        if(nomJoueur)
        {
            nbMatchs = req.params.nbMatchs;
            pool.getConnection(function(err, connection){
                if(err) throw err;

                connection.query("SELECT Joueur1.Nom AS J1, Joueur2.Nom AS J2, JoueurVainqueur.Nom AS Vainqueur, date, lieu, court, set1, set2, set3, set4, set5 FROM rencontres INNER JOIN joueurs AS Joueur1 ON rencontres.idJoueur1 = Joueur1.id INNER JOIN joueurs AS Joueur2 ON rencontres.idJoueur2 = Joueur2.id INNER JOIN resultat ON rencontres.id = resultat.idMatch INNER JOIN joueurs AS JoueurVainqueur ON resultat.idVainqueur = JoueurVainqueur.id WHERE Joueur1.Nom = '" + nomJoueur + "' OR Joueur2.Nom = '" + nomJoueur + "' ORDER BY date DESC LIMIT 0," + nbMatchs, function(err, result, fields){
                    connection.release();

                    if (err) throw err;

                    if(result[0] == null) res.status(400).send("Erreur de la requete");

                    res.send(JSON.stringify(result));

                });
            });
        }
        else
        {
            res.status(400).send("Il manque le nom du joueur");
        }

    })

myRouter.route('/stats/:nomJoueur/:nbMatchs') //Les statistiques d'un joueur
    .get(function(req,res){

        nomJoueur = req.params.nomJoueur;
        nbMatchs = req.params.nbMatchs;
        if(nomJoueur)
        {
            pool.getConnection(function(err, connection){

                if(err) throw err;

                connection.query("SELECT Joueur1.Nom AS J1, Joueur2.Nom AS J2, JoueurVainqueur.Nom AS Vainqueur, date, lieu, court, set1, set2, set3, set4, set5 FROM rencontres INNER JOIN joueurs AS Joueur1 ON rencontres.idJoueur1 = Joueur1.id INNER JOIN joueurs AS Joueur2 ON rencontres.idJoueur2 = Joueur2.id INNER JOIN resultat ON rencontres.id = resultat.idMatch INNER JOIN joueurs AS JoueurVainqueur ON resultat.idVainqueur = JoueurVainqueur.id WHERE Joueur1.Nom = '" + nomJoueur + "' OR Joueur2.Nom = '" + nomJoueur + "' ORDER BY date DESC LIMIT 0," + nbMatchs, function(err, result, fields){
                    connection.release();

                    if (err) throw err;

                    if(result[0] == null) res.status(400).send("Erreur de la requete"); //Si le joueur n'a joué aucun match ou si inexistant
                    
                    else{
                    var i = 0;
                    nbVictoire = 0;
 
                    while(result[i] != null && nbMatchs != i) //Calculer son nombre de victoires
                    {
                        vainqueur = result[i].Vainqueur;
 
                        if(vainqueur == nomJoueur) nbVictoire++;

                        i++;
                    }

                    nbMatchs = i; // Il se peut que le joueur n'est pas joué le nombre de match indiqué par le paramètre "nbMatchs"

                    if(nbVictoire == 0 ) statMatchs = 0;
                    else statMatchs = nbMatchs/nbVictoire * 100; //Calcul des stats du joueur
                    
                    var tab = { "name" : nomJoueur, "statsVictoire:" : statMatchs + "%"}; //Tableau clé : valeur
                    res.send(JSON.stringify(tab));
                    }
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



/******************** FONCTION POUR APPELER LES API EXTERNES *************************/

function newFunction() {
    return './getMeteo/getMeteo';
}

//Appeler les API
function callExternalApi(donnees){
    
    var i = 0;
    while(donnees[i] != null)
    {
        //Acquérir l'INSEE de la ville
        apiDonneesVille(donnees[i], {
            
            success: function(reponse, donnees){ 
                //Acquérir la météo grâce au code INSEE de la commune
                apiMeteo(reponse,donnees.Date, 
                function(meteo)
                {
                    pool.getConnection(function(err, connection) {
                        if (err) throw err;
                        
                        //Modifier la colonne "météo" de la table "rencontres"
                        connection.query("UPDATE rencontres SET `meteo` = '" + meteo + "' WHERE `id` = " + donnees.id, function(err, result, fields){
                            connection.release();
                            
                            if (err) throw err;
                            
                        });
                        
                    });
                }
            );
                
            },

            echec: function(){return "Probleme avec l'INSEE de la ville";},

        });
        i++;
    }
    
}

//API pour obtenir l'insee de la ville
function apiDonneesVille(donnees, callback){

    var url =  "https://api-adresse.data.gouv.fr/search/?q="+donnees.lieu;

    var request = new XMLHttpRequest();
    
    request.open('GET', url); //préparer la requête vers l'API
    request.responseType = 'json'; //le type de la réponse attendue
    request.onload = function() { //lorsque l'on reçoit la réponse
        reponse = JSON.parse(request.responseText);
        if(reponse != null) callback.success(reponse.features[0].properties.id, donnees); 
        else callback.echec();
    }

    request.send(); //Envoyer la requête
}


//API pour obtenir la météo grâce à l'insee
function apiMeteo(insee, Date, callback){
 
    const token = "fd6ef86908ee73bf10240a41e111bedc928e40f1b9c696ffd46fbccf387f10ae";

    diffJours = dateDiffJours(date.getDate(), Date);

    if(diffJours > 15 ){ //L'API ne donne la météo que sur 15 jours.
        callback(null);
    }

    else
    {
        url = "https://api.meteo-concept.com/api/forecast/daily/" + diffJours + "?token=" + token + "&insee=" + insee;

        var request = new XMLHttpRequest();

        request.open('GET', url); //préparer la requête vers l'API
        request.responseType = 'json'; //le type de la réponse attendue
        request.onload = function() { //lorsque l'on reçoit la réponse
            reponse = JSON.parse(request.responseText);    
            codeTemps = reponse.forecast.weather;
            codeMeteo(codeTemps, function(meteo){
                  
            });
            callback(meteo);   
        }

    request.send(); //Envoyer la requête
    }
}

//Calculer la différence de jours entre deux dates
function dateDiffJours(dateToday, dateMatch){

    //Inverser le jour et le mois des deux dates

    //Aujourd'hui
    aujourdhuiJour = dateToday[0] + dateToday[1];
    aujourdhuiMois = dateToday[3] + dateToday[4];
    aujourdhuiAnnee = dateToday[6] + dateToday[7] + dateToday[8] + dateToday[8];

    //Date du match
    matchJour = dateMatch[0] + dateMatch[1];
    matchMois = dateMatch[3] + dateMatch[4];
    matchAnnee = dateMatch[6] + dateMatch[7] + dateMatch[8] + dateMatch[8];


    //Passage des dates avec la classe DATE qui va nous permettre de calculer la différences de jours
    ajd = new Date(aujourdhuiAnnee + "-" + aujourdhuiMois + "-" + aujourdhuiJour);
    matchTennis = new Date(matchAnnee + "-" + matchMois + "-" + matchJour);

    //Calcul de la différence de jours
    diff = (matchTennis.getTime() - ajd.getTime()) / (1000 * 3600 * 24);


    return diff;

}

//Obtenir la météo à partir du code 
function codeMeteo(code, callback){
    
    const tabMeteo = require('./getMeteo/getMeteo');
    meteo = tabMeteo.getMeteo(code);
    retour = function(){
        callback(meteo);
    }
}
