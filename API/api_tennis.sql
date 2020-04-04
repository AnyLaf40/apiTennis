-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  sam. 29 fév. 2020 à 13:31
-- Version du serveur :  5.7.26
-- Version de PHP :  7.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `api_tennis`
--

-- --------------------------------------------------------

--
-- Structure de la table `joueurs`
--

DROP TABLE IF EXISTS `joueurs`;
CREATE TABLE IF NOT EXISTS `joueurs` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `nom` varchar(120) NOT NULL,
  `prenom` varchar(120) NOT NULL,
  `age` int(10) NOT NULL,
  `taille` text NOT NULL,
  `classementATP` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `joueurs`
--

INSERT INTO `joueurs` (`id`, `nom`, `prenom`, `age`, `taille`, `classementATP`) VALUES
(1, 'DJOKOVIC', 'NOVAK', 32, '1,88', 1),
(2, 'NADAL', 'Rafael', 33, '1,85', 2),
(3, 'FEDERER', 'Roger', 38, '1,85', 3),
(4, 'THIEM', 'Thiem', 26, '1,85', 4),
(5, 'MEDVEDEV', 'DANIIL', 24, '1,98', 5),
(6, 'TSITSIPAS', 'Stefanos', 21, '1,93', 6),
(7, 'ZVEREV', 'Alexander', 22, '1,98', 7),
(8, 'BERRETTINI', 'Matteo', 23, '1,93', 8),
(9, 'Monfils', 'Gael', 33, '1,93', 9),
(10, 'GOFFIN', 'David', 29, '1,80', 10),
(11, 'FOGNINI', 'Fabio', 32, '1,78', 11),
(12, 'BAUTISTA AGUT', 'Roberto', 31, '1,83', 12);

-- --------------------------------------------------------

--
-- Structure de la table `rencontres`
--

DROP TABLE IF EXISTS `rencontres`;
CREATE TABLE IF NOT EXISTS `rencontres` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `idJoueur1` int(10) NOT NULL,
  `idJoueur2` int(10) NOT NULL,
  `lieu` varchar(100) NOT NULL,
  `date` text NOT NULL,
  `court` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_j1` (`idJoueur1`),
  KEY `fk_j2` (`idJoueur2`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `rencontres`
--

INSERT INTO `rencontres` (`id`, `idJoueur1`, `idJoueur2`, `lieu`, `date`, `court`) VALUES
(1, 1, 2, 'Paris', '29/05/2020', 'Roland Garros'),
(2, 4, 6, 'New York', '08/02/2020', 'Court NewYork');

-- --------------------------------------------------------

--
-- Structure de la table `resultat`
--

DROP TABLE IF EXISTS `resultat`;
CREATE TABLE IF NOT EXISTS `resultat` (
  `idScore` int(10) NOT NULL AUTO_INCREMENT,
  `idMatch` int(10) NOT NULL,
  `idVainqueur` int(10) NOT NULL,
  `set1` text NOT NULL,
  `set2` text NOT NULL,
  `set3` text NOT NULL,
  `set4` text NOT NULL,
  `set5` varchar(8) NOT NULL,
  PRIMARY KEY (`idScore`),
  KEY `fk_joueur` (`idVainqueur`),
  KEY `idMatch` (`idMatch`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `resultat`
--

INSERT INTO `resultat` (`idScore`, `idMatch`, `idVainqueur`, `set1`, `set2`, `set3`, `set4`, `set5`) VALUES
(1, 2, 6, '7/6', '6/4', '4/6', '6/1', 'N/A');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `rencontres`
--
ALTER TABLE `rencontres`
  ADD CONSTRAINT `fk_j1` FOREIGN KEY (`idJoueur1`) REFERENCES `joueurs` (`id`),
  ADD CONSTRAINT `fk_j2` FOREIGN KEY (`idJoueur2`) REFERENCES `joueurs` (`id`);

--
-- Contraintes pour la table `resultat`
--
ALTER TABLE `resultat`
  ADD CONSTRAINT `fk_joueur` FOREIGN KEY (`idVainqueur`) REFERENCES `joueurs` (`id`),
  ADD CONSTRAINT `resultat_ibfk_1` FOREIGN KEY (`idMatch`) REFERENCES `rencontres` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
