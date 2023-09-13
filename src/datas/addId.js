import fs from 'fs';

// Initialisez un ensemble pour stocker les IDs attribués
const usedIds = new Set();

// Lisez et traitez plusieurs fichiers JSON
const files = ["gradins.json", "n-1.json", "n-2.json", "n0.json", "n1.json", "sieges.json", "sols.json"];

files.forEach((fileName) => {
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error(`Erreur de lecture du fichier ${fileName} :`, err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      jsonData.features.forEach((item) => {
        //Générez un nouvel ID unique
        let id;
        do {
          id = `ID_${Math.floor(Math.random() * 10000)}`;
        } while (usedIds.has(id)); // Vérifiez si l'ID est déjà utilisé

        // Ajoutez l'ID à l'ensemble des IDs attribués
        usedIds.add(id);

        // Ajoutez l'ID à l'objet JSON
        item.id = id;
        item.properties.id = id
      });

      const updatedData = JSON.stringify(jsonData, null, 2);

      fs.writeFile(fileName, updatedData, "utf8", (err) => {
        if (err) {
          console.error(`Erreur d'écriture du fichier ${fileName} :`, err);
        } else {
          console.log(`Fichier ${fileName} mis à jour avec succès.`);
        }
      });
    } catch (error) {
      console.error(
        `Erreur de traitement JSON dans le fichier ${fileName} :`,
        error
      );
    }
  });
});
