# Étape 1 : image de base
FROM node:18

# Créer le dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code, y compris le dossier prisma
COPY . .

# Générer le client Prisma (après avoir copié le schema)
RUN npx prisma generate

# Installer OpenSSL si nécessaire
RUN apt-get update && apt-get install -y openssl libssl-dev

# Exposer le port utilisé par ton serveur
EXPOSE 3000

# Commande de démarrage
CMD ["node", "src/server.js"]
