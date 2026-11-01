# Guitar Practice Cloud

Application de bibliothèque audio avec un frontend Angular et une API Node.js/Express.

## Prérequis

- Node.js `24.15` ou plus récent (ou `22.22.3` ou plus récent) ;
- npm ;
- une base MongoDB Atlas accessible depuis votre adresse IP.

Le projet a été vérifié avec Node.js `24.21.0` et npm `11.19.0`.

## 1. Configurer et démarrer le backend

Dans un premier terminal, depuis la racine du dépôt :

```bash
cd backend
```

Créer le fichier local `backend/.env` à partir du modèle. Dans Git Bash :

```bash
cp .env.example .env
```

Dans PowerShell :

```powershell
Copy-Item .env.example .env
```

Modifier `backend/.env` avec votre URI MongoDB et un secret JWT local. Le fichier
contient des informations privées : ne les publiez pas et ne les copiez pas dans
Angular. Le port par défaut est `3000`.

Installer les dépendances et lancer l'API :

```bash
npm ci
npm start
```

Si PowerShell bloque la commande `npm`, utilisez `npm.cmd` à la place, par exemple
`npm.cmd ci` puis `npm.cmd start`.

Quand le backend démarre correctement, vérifier :

```text
http://localhost:3000/api/health
```

La réponse attendue est `{"status":"ok"}`. Le backend se connecte à MongoDB avant
de démarrer. Il prépare également un compte de démonstration :
`demo@example.com` / `Demo1234!`.

## 2. Démarrer le frontend

Laisser le backend ouvert et ouvrir un deuxième terminal depuis la racine du dépôt :

```bash
cd frontend-starter
npm ci
npm start
```

Sous PowerShell, utiliser `npm.cmd` si nécessaire :

```powershell
npm.cmd ci
npm.cmd start
```

Ouvrir ensuite `http://localhost:4200`. Le fichier
`frontend-starter/proxy.conf.json` transmet les requêtes `/api` à
`http://localhost:3000` ; il n'est normalement pas nécessaire de modifier cette
configuration.

## Tests et build

Depuis `frontend-starter` :

```bash
npm test
npm run build
```

Depuis `backend` :

```bash
npm test
```

## Architecture

```text
Navigateur
   |
   v
Frontend Angular (localhost:4200)
   | composants -> services -> HttpClient
   | intercepteur : ajoute le JWT aux requêtes protégées
   v
Proxy Angular (/api)
   |
   v
API Express (localhost:3000)
   | routes, authentification et validation
   +----> MongoDB : utilisateurs et informations des pistes
   +----> backend/data/uploads : fichiers audio
```


