<h1 align="center">Camagru</h1>

<div align="center"><img src="./frontend/public/img/camagru-co.png" width="300" /></div>

Projet web du cursus [42](https://42.fr/).

Application de retouche photo façon Instagram. l

L'utilisateur capture une image
avec sa webcam (ou en téléverse une), y superpose des stickers (la fusion des
images étant réalisée côté serveur), puis la publie dans une galerie publique où
chacun peut liker et commenter. 

L'auteur d'une image est notifié par email à
chaque nouveau commentaire.

Développé en PHP (bibliothèque standard uniquement, sans framework) côté serveur,
en HTML / CSS / JavaScript vanilla côté client, le tout conteneurisé avec Docker.

---

### Stack :

| Composant | Technologie |
|---|---|
| Frontend | HTML, CSS ([Spectre.css](https://picturepan2.github.io/spectre/)), JavaScript vanilla (SPA) |
| Backend | PHP 8.2, bibliothèque standard, aucun framework |
| Base de données | MariaDB 11.4, PDO (ERRMODE_EXCEPTION, requêtes préparées) |
| Reverse proxy | Nginx |
| Mail (dev) | [Mailpit](https://mailpit.axllent.org/) |
| Authentification | JWT (HS256), bcrypt |
| Conteneurisation | Docker, docker-compose |

---

### Prérequis :

- [Docker](https://docs.docker.com/get-docker/) et [docker-compose](https://docs.docker.com/compose/)
- `make`

### Configuration :

Copiez le fichier d'exemple et renseignez vos valeurs :

```
cp .env-example .env
```

Le fichier regroupe les variables suivantes :

```
DB_NAME            Nom de la base de données
DB_USER            Utilisateur de la base
DB_PASSWORD        Mot de passe de l'utilisateur
DB_ROOT_PASSWORD   Mot de passe root MariaDB
JWT_SECRET         Secret de signature des tokens JWT
APP_URL            URL publique de l'application (liens des emails)
MAIL_FROM          Adresse d'expédition des emails
SMTP_HOST          Relais SMTP (mailpit en développement)
SMTP_PORT          Port SMTP (1025 en développement)
```

### Lancement :

Pour construire les images et démarrer l'ensemble des conteneurs :

```
make
```

L'application est alors disponible sur http://localhost:8080.

### Utilisation :

| Service | Adresse |
|---|---|
| Application | http://localhost:8080 |
| Boîte mail de dev (Mailpit) | http://localhost:8025 |

Les emails (confirmation de compte, réinitialisation de mot de passe,
notifications de commentaire) ne quittent pas la stack : ils sont interceptés par
Mailpit et consultables depuis son interface web sur le port 8025.

### Commandes :

| Commande | Action |
|---|---|
| `make` / `make all` | Construit les images puis démarre les conteneurs |
| `make build` | Construit les images |
| `make up` | Démarre les conteneurs |
| `make down` | Arrête les conteneurs |
| `make clean` | Arrête et supprime les volumes (base de données réinitialisée) |
| `make re` | `clean` + `build` + `up` |

---

### Fonctionnalités :

Comptes et authentification :
- Inscription avec email valide, nom d'utilisateur et mot de passe à complexité minimale (majuscule, minuscule, chiffre, 8 caractères)
- Confirmation du compte via un lien unique envoyé par email (connexion impossible tant que le compte n'est pas activé)
- Connexion / déconnexion, réinitialisation du mot de passe par email
- Préférences modifiables : nom d'utilisateur, email, mot de passe, notifications

Édition :
- Aperçu webcam en direct et liste de stickers superposables
- Bouton de capture désactivé tant qu'aucun sticker n'est sélectionné
- Fusion des images réalisée côté serveur (GD)
- Téléversement d'une image à la place de la webcam
- Miniatures des créations précédentes, avec suppression (uniquement les siennes)

Galerie :
- Publique (accessible connecté ou non), triée par date de création
- Pagination (5 images par page)
- Like et commentaire réservés aux utilisateurs connectés
- Notification email à l'auteur d'une image à chaque commentaire (préférence activée par défaut, désactivable)

### Bonus :

- Échanges client / serveur en AJAX
- Aperçu live de la superposition sur le flux webcam
- Partage sur les réseaux sociaux
- Internationalisation FR / EN
- Mode sombre

---

### Sécurité :

- Mots de passe hachés avec bcrypt (`password_hash`)
- Requêtes PDO préparées partout (`ERRMODE_EXCEPTION`), anti-injection SQL
- Contenu utilisateur inséré via `textContent`, anti-XSS
- Tokens JWT signés (`hash_hmac` et comparaison `hash_equals`)
- Validation des uploads : type PNG réel vérifié, taille limitée à 5 Mo
- Longueur des champs bornée (500 caractères) côté client et serveur
- Secrets stockés dans `.env` (ignoré par git)

### Architecture :

```
Camagru/
├── backend/                 # API PHP 8.2 (sans framework)
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── public/
│   │   ├── index.php        # Point d'entrée
│   │   ├── router.php       # Routeur /api/classe/methode/param
│   │   ├── database.php     # Connexion PDO (singleton)
│   │   ├── jwt.php          # Création / vérification des tokens
│   │   ├── mailer.php       # Envoi d'emails
│   │   └── classes/         # account, image, comment, like, sticker
│   └── static/              # Images générées et stickers
├── frontend/                # SPA statique servie par Nginx
│   └── public/
│       ├── index.html       # Shell de l'application
│       ├── css/
│       ├── js/              # router, i18n, webcam, list, ...
│       └── img/
├── db/                      # MariaDB : schéma + jeu de données initial
│   ├── 00-schema.sql
│   └── 01-insert.sql
├── proxy/                   # Reverse proxy Nginx (port 8080)
├── docker-compose.yml
├── Makefile
└── .env-example
```
