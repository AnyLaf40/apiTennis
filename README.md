# apiTennis

L'objectif principal de cette API est de repertorier les matchs de tennis en France.

Vous aurez donc accès, via des requêtes HTTP, à des données telles que les joueurs, les rencontres, les résultats, les stats,...

Tout d'abord, voici une procédure d'installation afin de manipuler l'API sur un serveur local.

## Procédures d'installation

### Wampserver

Commencez par installer __WAMPSERVER.__

### PhpMyAdmin

Ensuite, lorsque __WAMPSERVER__ est installé, accédez à [phpmyadmin](http://127.0.0.1/phpmyadmin/) et créez un compte sous __MySQL.__
Après cela, connectez-vous avec votre compte et importez le fichier *"base.sql"* présent sous le dossier *"apiTennis/SQL"* du projet Github.__

### Installer NodeJS

Notre API est codé en __NodeJS__. Il faut donc installer ce dernier pour lancer le serveur.

### Modifier le code js

Pour établir la connexion à la base MySQL, il faut que l'identifiant et le mot de passe du compte crée précédemment figures dans le code. 
Pour cela, modifiez le code *"apiTennis/API/apiTennis.js"* ligne 20 à 23 : 
#####
`var pool = mysql.createPool({ //paramètres de connexion mysql  
    connectionLimit: 10,  
    host: "localhost", //Hote de votre base MySQL  
    user: "API_Tennis", //Identifiant de la base MySQL  
    password: "api2020", //Mot de passe de la base SQL  
    database: "API_Tennis" //Le nom de la base  
});`

