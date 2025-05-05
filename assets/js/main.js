// Initialisation de variables globales au script, deux tableaux vides, qui contiendront ensuite les tokens et les lignes du document chargé
let global_var_tokens = [];
let global_var_lines = [];

//Fonction pour Afficher/Masquer la partie CV
function toggle_aboutme() { // le nom de la fonction annonce le rôle de la fonction (toggle entre show/hide)
    let aboutme = document.getElementById("aboutme");// initialise la variable aboutme et lui attribue l'id "aboutme" définie dans le document HTML
    let b = document.getElementById("button_aboutme");// initialise la variable b et lui attribue l'id "button_aboutme" définie dans le document HTML
    if (aboutme.style.display !== "none") {// si le style d'affichage est différent de "none" (donc la div id="aboutme" est affiché)
        aboutme.style.display = "none";// changer le style d'affichage en "none" (donc masquer la div id="aboutme")
        b.textContent = "Plus d'info sur mon CV";// et le bouton propose d'afficher plus d'information
    } else { // sinon (si le style d'affichage est déjà défini sur "none")
        aboutme.style.display = "block";// changer le style d'affichage en "block" (donc afficher la div id="aboutme")
        b.textContent = "Masquer";// le bouton propose de masquer les informations
    }
}

/*------------------------------------------------------------------------------------------------------------------*/
//							PARTIE OUTILS pour l'analyse des données dans un fichier texte									//
/*------------------------------------------------------------------------------------------------------------------*/
// Charger le texte
window.onload = function () {
    let fileInput = document.getElementById('fileInput');
    let fileDisplayArea = document.getElementById('fileDisplayArea');

    // On "écoute"/vérifie si le fichier donné a été modifié.
    // Si on a donné un nouveau fichier, on essaie de le lire.
    fileInput.addEventListener('change', function (e) { //addEventListener a été utilisée en faisant référence à https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_addeventlistener2
        // Dans le HTML (ligne 77), fileInput est un élément de tag "input" avec un attribut type="file".
        // On peut récupérer les fichiers donnés avec le champ ".files" au niveau du javascript.
        // On peut potentiellement donner plusieurs fichiers,
        // mais ici on n'en lit qu'un seul, le premier, donc indice 0.
        let file = fileInput.files[0];
        // on utilise cette expression régulière pour vérifier qu'on a bien un fichier texte.
        let textType = new RegExp("text.*");

        if (file.type.match(textType)) { // on vérifie qu'on a bien un fichier texte
            // lecture du fichier. D'abord, on crée un objet qui sait lire un fichier.
            var reader = new FileReader();

            // on dit au lecteur de fichier de placer le résultat de la lecture
            // dans la zone d'affichage du texte.
            reader.onload = function (e) {
                fileDisplayArea.innerText = reader.result;
                segText(); // utilisation de la fonction segText() afin de pouvoir afficher le nombre de token et de lignes
                let nbTokens = global_var_tokens.length; //le nombre de tokens correspond au nombre d'éléments dans le tableau global_var_tokens
                let nbLines = global_var_lines.length;
                //le nombre de tokens et de ligne est affiché par deux messages au-dessus du texte chargé et de la partie analyse
                document.getElementById("logger2").innerHTML = '<span class="infolog">Nombre de tokens : ' + nbTokens + '<br>Nombre de lignes : ' + nbLines + ' </span>';
            }

            // on lit concrètement le fichier.
            // Cette lecture lancera automatiquement la fonction "onload" juste au-dessus.
            reader.readAsText(file);

            document.getElementById("logger1").innerHTML = '<span class="infolog">Fichier chargé avec succès</span>';// message qui valide le chargement du fichier
        } else { // pas un fichier texte : message d'erreur.
            fileDisplayArea.innerText = "";
            document.getElementById("logger1").innerHTML = '<span class="errorlog">Type de fichier non supporté !</span>';
        }
    });
}

// Fonction segmentation
function segText() {
    if (document.getElementById('fileDisplayArea').innerHTML == "") { // condition: si aucun texte n'est affiché
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !"; // message d'erreur demandant de charger un fichier txt
    } else if (document.getElementById("delimID").value === "") { // si la case délimiteur(s) est vide
        document.getElementById('logger3').innerHTML = '<span class="errorlog">Aucun délimiteur donné !</span>' // message d'erreur, il en faut pour exécuter la fonction segText()
    } else {
        document.getElementById('logger3').innerHTML = ""; // sinon pas de message d'erreur, les conditions sont remplies
        let text = document.getElementById('fileDisplayArea').innerText; // attribution de la variable text au texte qui a été chargé
        let delim = document.getElementById("delimID").value; // attribue la variable delim au(x) délimiteur(s) présents dans la case
        let display = document.getElementById("analysisDisplay");

        let regex_delim = new RegExp(
            "["
            + delim
                .replace("-", "\\-") // le tiret n'est pas à la fin : il faut l'échapper, sinon erreur sur l'expression régulière
                .replace("[", "\\[").replace("]", "\\]") // à changer sinon regex fautive, exemple : [()[]{}] doit être [()\[\]{}], on doit "échapper" les crochets, sinon on a un symbole ] qui arrive trop tôt.
            + "\\s" // on ajoute tous les symboles d'espacement (retour à la ligne, etc)
            + "]+" // on ajoute le + au cas où plusieurs délimiteurs sont présents : évite les tokens vides
        );

        let tokens = text.split(regex_delim).filter(tokens => tokens.trim() !== ""); // on s'assure de ne garder que des tokens "non vides"
        let lines = text.split("\[\r\n\]+").filter(lines => lines.trim() !== "");

        global_var_tokens = tokens; // décommenter pour vérifier l'état des tokens dans la console développeurs sur le navigateur
        global_var_lines = lines;

        // Affichage du texte segmenté avec chaque token séparé par un espace
        display.innerText = tokens.join(" ");
    }
}

//Fonction Dictionnaire
function dictionnaire() {
    if (document.getElementById('fileDisplayArea').innerHTML == "") { // si aucun texte n'est affiché (donc aucun document n'a été chargé)
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";
    } else {
        document.getElementById('logger3').innerHTML = "";
        document.getElementById('analysisDisplay').innerHTML = "";
        let tokenFreq = {}; // déclaration d'un nouveau objet qui peut être constitué d'un ensemble de valeurs différentes
        let tokens = global_var_tokens;
        // Appel de fonction sur chaque élément de la liste
        // on prend la valeur pour chaque token stocké dans l'objet, si le token n'existe pas on utilise 0
        // on rajoute 1 pour comptabiliser l'occurrence
        tokens.forEach(token => tokenFreq[token] = (tokenFreq[token] || 0) + 1);
        // Convertir l'objet en tableau de paires clé-valeur
        let freqPaires = Object.entries(tokenFreq);
        // Trier le tableau par fréquence décroissante
        freqPaires.sort((a, b) => { return b[1] - a[1] });
        // Ajouter l'entête du tableau
        let tableArr = [['<b>Token</b>', '<b>Fréquence</b>']];
        // Créer un tableau de tableaux contenant les tokens et leurs fréquences
        let tableData = freqPaires.map(pair => [pair[0], pair[1]]);
        // Concaténer les deux tableaux
        let finalTable = tableArr.concat(tableData);
        // Créer le tableau HTML à partir du tableau final
        let tableHtml = finalTable.map(row => '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td></tr>').join('');
        // Afficher le tableau HTML dans la page
        document.getElementById('analysisDisplay').innerHTML = '<table>' + tableHtml + '</table>';
    }
}

//Fonction GREP
function grep() {
    // Vérifier si un fichier .txt a été chargé
    if (document.getElementById('fileDisplayArea').innerHTML == "") {
        // Afficher un message d'erreur
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";
    } else {
        // Effacer tout message d'erreur précédent
        document.getElementById('logger3').innerHTML = "";
        // Récupérer la valeur du champ "pôle"
        let poleInput = document.getElementById('poleID').value;
        // Vérifier si un pôle a été saisi
        if (poleInput == "") {
            // Afficher un message d'erreur
            document.getElementById('logger3').innerHTML = "Il faut d'abord entrer un pôle !";
        } else {
            // Créer une expression régulière à partir de la valeur du champ "pôle"
            let poleRegex = new RegExp(poleInput, 'g');
            // Initialiser la variable "resultat" avec l'entête du tableau
            let resultat = "<tr><th>Ligne</th><th>Résultat</th></tr>";
            // Parcourir chaque ligne du tableau "global_var_lines"
            for (let i = 0; i < global_var_lines.length; i++) {
                let line = global_var_lines[i];
                // Vérifier si la ligne correspond à la regex
                if (poleRegex.test(line)) {
                    // Ajouter le numéro de la ligne et le résultat correspondant au tableau "resultat"
                    let lineNumber = i + 1; // Ajouter 1 car les tableaux en JavaScript commencent à l'index 0
                    // Surligner toutes les correspondances en rouge
                    //parcourt les lignes et pour chaque string correspondant à poleRegex (l'input dans la case pôle), lui associe la couleur rouge
                    let highlightedPole = line.replace(poleRegex, match => '<span style="color:red">' + match + '</span>');
                    resultat += '<tr><td>' + lineNumber + '</td><td>' + highlightedPole + '</td></tr>';// créé une table avec le nombre de ligne dans une colonne et dans l'autre le texte avec les pôles en rouge
                }
            }
            // Vérifier si des résultats ont été trouvés
            if (resultat == "<tr><th>Ligne</th><th>Résultat</th></tr>") {
                // Effacer les résulats précédent
                document.getElementById('analysisDisplay').innerHTML = "";
                // Afficher un message d'erreur
                document.getElementById('logger3').innerHTML = "Aucune correspondance trouvée.";
            } else {
                // Effacer tout message d'erreur précédent
                document.getElementById('logger3').innerHTML = "";
                // Injecter le tableau résultant dans l'élément HTML
                document.getElementById('analysisDisplay').innerHTML = "<table>" + resultat + "</table>";
            }
        }
    }
}

// Fonction féminisation -----------------------------------------
function féminisation() { //Fonction qui transforme tous les il/Il/ils/Ils en elle/Elle/elles/Elles même quand c'est de l'impersonnel
    if (document.getElementById('fileDisplayArea').innerHTML == "") {// on vérifie qu'un document .txt a été chargé ou non
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";// sinon message d'erreur
    } else {
        document.getElementById('logger3').innerHTML = "";
        let text = document.getElementById("fileDisplayArea").innerText; //on récupére le texte chargé dans la variable text
        let resultat = text.replace(/il/g, "elle").replace(/Il/g, "Elle").replace(/ils/g, "elles").replace(/Ils/g, "Elles"); // remplace toutes les occurence de il(s) par elle(s)
        document.getElementById('analysisDisplay').innerHTML = '<div>' + resultat + '</div>';// puis on affiche le texte modifié dans la partie analyse
    }
}

// Concordancier ---------------------------------------------------------------------------
function concord() {
    if (document.getElementById('fileDisplayArea').innerHTML == "") {
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";
    } else {
        document.getElementById('logger3').innerHTML = "";
        let poleInput = document.getElementById('poleID').value;
        if (poleInput == "") {
            document.getElementById('logger3').innerHTML = "Il faut d'abord entrer un pôle !";
        } else {
            document.getElementById('logger3').innerHTML = "";
            let lgInput = document.getElementById('lgID').value; //voir bouton "longueur" dans index.html
            // Vérifier si une longueur a été saisi, et si > 0
            if (lgInput == "") {
                // Afficher un message d'erreur
                document.getElementById('logger3').innerHTML = "Il faut d'abord entrer une longueur > 0 !";
            } else {
                // Récupérer le pôle et le convertir en regex
                let poleRegex = new RegExp("^" + poleInput + "$", "gi"); // le "i" indique de ne pas prendre en compte la casse, ^ et $ pour délimiter le mot
                //Récupérer la valeur de "lgInput" (longueur de contexte) et conversion en nombre entier
                let long = parseInt(document.getElementById('lgID').value);

                // Chercher le pôle et créer une liste de concordance avec la méthode Array.prototype.reduce()
                // On applique .reduce sur global_var_tokens. Le callback prend en paramètres acc : accumulateur initialisé à 0 ;  token : valeur courante ; i : index de la valeur courante
                let concordance = global_var_tokens.reduce((acc, token, i) => {
                    // A chaque itération du callback on teste si le "poleRegex" correspond au token courant
                    if (poleRegex.test(token)) {
                        // Si oui, création du contexte gauche (cLeft) et droit (cRight)
                        let cLeft = global_var_tokens.slice(Math.max(0, i - long), i).join(" ");
                        let cRight = global_var_tokens.slice(i + 1, Math.min(global_var_tokens.length, i + long + 1)).join(" ");
                        acc.push([cLeft, token, cRight]); // Ajout de (contexte gauche, pôle, contexte droit) à la liste acc, comme affiché sur le navigateur en cours
                    }
                    return acc;
                }, []); // commenter 

                // Afficher les résultat dans une table HTML
                let table = document.createElement("table"); //création de la table
                table.innerHTML = "<thead><tr><th>Contexte gauche</th><th>Pôle</th><th>Contexte droit</th></tr></thead>"; //création des colonnes
                concordance.forEach(([cLeft, pole, cRight]) => { // pour chaque colonne
                    // Insertion d'une nouvelle ligne dans la table
                    let row = table.insertRow();
                    // Ajouter les données à la ligne
                    row.insertCell().innerHTML = cLeft; //ajout à la ligne du contexte gauche
                    row.insertCell().innerHTML = pole // ajout à la ligne du pôle
                    row.insertCell().innerHTML = cRight; //ajout à la ligne du contexte droit
                });

                // Vérifier si des résultats ont été trouvés
                if (table.innerHTML == "<thead><tr><th>Contexte gauche</th><th>Pôle</th><th>Contexte droit</th></tr></thead>") { //si la table est vide
                    // Effacer les résulats précédent
                    document.getElementById('analysisDisplay').innerHTML = "";
                    // Afficher un message d'erreur
                    document.getElementById('logger3').innerHTML = "Aucun résultat trouvé";
                } else {
                    // Effacer tout message d'erreur précédent
                    document.getElementById('logger3').innerHTML = "";
                    // Injecter le tableau résultant dans l'élément HTML
                    document.getElementById("analysisDisplay").innerHTML = "";
                    document.getElementById("analysisDisplay").appendChild(table);
                }
            }
        }
    }
}

// Nombre de phrases -----------------------------------------
function nbPhrases() {
    if (document.getElementById('fileDisplayArea').innerHTML == "") {// on vérifie qu'un document .txt a été chargé ou non
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";// sinon message d'erreur
    } else {
        document.getElementById('logger3').innerHTML = "";
        let text = document.getElementById("fileDisplayArea").innerText; //on récupére le texte chargé dans la variable text
        let phrase = /[.!?]/g; //chaque phrase est comprise entre un des élément de ponctuation de fin de phrase 
        let nbPhrases = text.split(/(?<=[.!?])\s+/); //nbPhrases divise et stocke les divisions du texte entre les ponctuations finales et les signes d'espacement
        let resultat = nbPhrases.length //la longueur de nbPhrases est stockée dans résultat
        document.getElementById('analysisDisplay').innerHTML = '<div>Il y a ' + resultat + ' phrases dans ce texte.</div>';// puis est affichée dans la partie analyse
    }
}

// Mots les plus longs ----------------------------------------------
function tokenLong() {
    if (document.getElementById('fileDisplayArea').innerHTML == "") {
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";
    } else {
        document.getElementById('logger3').innerHTML = "";
        // Trier le tableau 'global_var_tokens' par ordre décroissant de longueur
        let tokenSort = global_var_tokens.sort((a, b) => b.length - a.length);

        // Convertir chaque token en une ligne de tableau HTML avec sa longueur
        let map = tokenSort.map(token => '<tr><td>' + token + '</td><td>' + token.length + '</td></tr>').join('');
        //Tableau HTML
        let resultat = '<table><tr><th colspan=2><b>Mots les plus longs</b></th></tr><tr><th><b>Mot</b></th><th><b>Longueur</b></th></tr>' + map;
        // Injecter le tableau dans l'élément HTML
        document.getElementById("analysisDisplay").innerHTML = resultat;
    }
}

// Pie Chart (mots les plus fréquents, moins les stopwords) --------------------------------------------------
function pieChart() {
    if (document.getElementById('fileDisplayArea').innerHTML == "") {
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";
    } else {
        document.getElementById('logger3').innerHTML = "";
        // Récupérer les stopwords
        var stopwordInput = document.getElementById("stopwordID").value;// on attribue la valeur de stopwordID à stopwordInput
        var stopwords = stopwordInput.split(","); //on récupère dans stopwords les string entrés dans stopwordID, chaque stopword étant séparé par une virgule

        // Filtrer les stopwords de global_var_tokens
        var filteredTokens = global_var_tokens.filter(function (token) { //on parcourt le tableau global_var_tokens pour supprimer les stopwords
            return stopwords.indexOf(token) === -1;
        });

        // Compter le nombre d'occurences de chaque token dans "filteredTokens"
        var count = {};
        filteredTokens.forEach(function (token) {
            count[token] = (count[token] || 0) + 1; //on parcourt les tokens filtrés en ajoutant +1 chaque fois qu'une valeur est trouvée afin de comptabiliser les occurrences
        });

        var chartData = [];
        var sortedTokens = Object.keys(count).sort(function (a, b) {  // les tokens sont ensuite triés selon leur nombre d'occurrences
            return count[b] - count[a];
        }).slice(0, 30);
        sortedTokens.forEach(function (token) {
            chartData.push({
                label: token,
                y: count[token]
            });
        }); //commenter depuis var chartData = []

        // Creation du graphique CanvasJS
        var chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: true,
            backgroundColor: "transparent",
            title: {
                text: "Mots les plus fréquents"
            },
            data: [{
                type: "pie",
                showInLegend: true,
                legendText: "{label}",
                indexLabelFontSize: 14,
                indexLabel: "{label} - {y}",
                dataPoints: chartData
            }]
        });

        chart.render();
    }
} //commenter la création du graphique et modifier à votre choix les éléments paramétrables

// kujuj() rajoute "uj" à chaque token ------------------------------------------------
function kujuj() {
    if (document.getElementById('fileDisplayArea') == "") {
        document.getElementById('logger3').innerHTML = "Il faut d'abord charger un fichier .txt !";
    } else {
        alert("c'est une plaisanterie !");// boite de dialogue indiquant que c'est une blague 
        let kujujTokens = global_var_tokens.map(token => token + "uj");// on parcourt les tokens dan sle tableau global_var_tokens pour leur ajouter "uj" à la fin
        let kujujText = kujujTokens.join(" "); // on réunit les tokens modifiés en les séparant par un espace dans la variable kujujText
        document.getElementById("analysisDisplay").innerHTML = kujujText;// on affiche le nouveau texte dans la partie analyse
    }
}

//Fonction pour Afficher/Masquer l'aide (même fonctionnement que la fonction toggle_aboutme())
function toggle_aide() {
    let aide = document.getElementById("aide");
    let b = document.getElementById("button_aide");
    if (aide.style.display !== "none") {
        aide.style.display = "none";
        b.textContent = "Afficher l'aide";
    } else {
        aide.style.display = "block";
        b.textContent = "Masquer l'aide";
    }
}
