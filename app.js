const VOICE_STORAGE_KEYS = {
    male: "maVoixMaleVoiceName",
    female: "maVoixFemaleVoiceName",
    active: "maVoixActiveVoiceType"
};


function readLocalSetting(key, fallbackValue = "") {

    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallbackValue;
    }
    catch (error) {
        return fallbackValue;
    }
}


function writeLocalSetting(key, value) {

    try {
        localStorage.setItem(key, value);
    }
    catch (error) {
        console.warn(
            "Impossible d’enregistrer le réglage local :",
            key,
            error
        );
    }
}


let availableFrenchVoices = [];

let maleVoiceName = readLocalSetting(
    VOICE_STORAGE_KEYS.male,
    ""
);

let femaleVoiceName = readLocalSetting(
    VOICE_STORAGE_KEYS.female,
    ""
);

let activeVoiceType = readLocalSetting(
    VOICE_STORAGE_KEYS.active,
    "male"
);

if (activeVoiceType !== "male" && activeVoiceType !== "female") {
    activeVoiceType = "male";
}


function speak(text) {

    if (!text) {
        return;
    }

    window.speechSynthesis.cancel();

    const message =
        new SpeechSynthesisUtterance(text);

    message.lang = "fr-FR";
    message.rate = 0.9;


    let selectedVoiceName = "";

    if (activeVoiceType === "male") {
        selectedVoiceName = maleVoiceName;
    }
    else {
        selectedVoiceName = femaleVoiceName;
    }


    const selectedVoice =
        availableFrenchVoices.find(
            function(voice) {
                return voice.name === selectedVoiceName;
            }
        );


    if (selectedVoice) {
        message.voice = selectedVoice;
        message.lang = selectedVoice.lang;
    }


    window.speechSynthesis.speak(message);
}

function handleTopRightButton() {

    const activeScreen =
        document.querySelector(".screen.active");

	if (
		!activeScreen ||
		activeScreen.id === "homeScreen"
	) {
		playAttentionAlarm();
		return;
	}

    const backButton =
        activeScreen.querySelector(".back-button");

    if (backButton) {
        backButton.click();
    }
}


function updateTopRightButton(screenId) {

    const button =
        document.getElementById("topRightButton");

    if (!button) {
        return;
    }

	if (screenId === "homeScreen") {

		button.textContent = "HEP!";
		button.classList.add("emergency");
		button.classList.remove("return-mode");

	}
	else {

		button.textContent = "↶";
		button.classList.add("emergency");
		button.classList.add("return-mode");

	}
}

function showScreen(screenId) {

    const selectedScreen = document.getElementById(screenId);

    if (!selectedScreen) {
        console.error("Écran introuvable :", screenId);
        return;
    }

    const screens = document.querySelectorAll(".screen");

    screens.forEach(function(screen) {
        screen.classList.remove("active");
    });

    selectedScreen.classList.add("active");

	updateTopRightButton(screenId);

    window.scrollTo(0, 0);
}

function openWriteScreen() {

    renderCustomFavorites();

    showScreen("writeScreen");
}

function loadFrenchVoices() {

    const voices =
        window.speechSynthesis.getVoices();

    availableFrenchVoices =
        voices.filter(function(voice) {

            return voice.lang
                .toLowerCase()
                .startsWith("fr");

        });


    fillVoiceSelect(
        "maleVoiceSelect",
        maleVoiceName
    );

    fillVoiceSelect(
        "femaleVoiceSelect",
        femaleVoiceName
    );
}


function fillVoiceSelect(selectId, selectedName) {

    const select =
        document.getElementById(selectId);

    if (!select) {
        return;
    }

    select.innerHTML = "";


    if (availableFrenchVoices.length === 0) {

        const option =
            document.createElement("option");

        option.textContent =
            "Aucune voix française trouvée";

        option.value = "";

        select.appendChild(option);

        return;
    }


    availableFrenchVoices.forEach(
        function(voice) {

            const option =
                document.createElement("option");

            option.value =
                voice.name;

            option.textContent =
                voice.name +
                " — " +
                voice.lang;

            select.appendChild(option);

        }
    );


    if (
        selectedName &&
        availableFrenchVoices.some(
            function(voice) {
                return voice.name === selectedName;
            }
        )
    ) {
        select.value =
            selectedName;
    }
}


function openVoiceScreen() {

    loadFrenchVoices();

    showScreen("voiceScreen");

    updateVoiceButtons();
}


function testVoice(type) {

    const selectId =
        type === "male"
            ? "maleVoiceSelect"
            : "femaleVoiceSelect";

    const select =
        document.getElementById(selectId);

    if (!select || !select.value) {
        return;
    }


    const voice =
        availableFrenchVoices.find(
            function(item) {
                return item.name === select.value;
            }
        );

    if (!voice) {
        return;
    }


    window.speechSynthesis.cancel();

    const message =
        new SpeechSynthesisUtterance(
            "Bonjour. Voici ma voix."
        );

    message.lang =
        voice.lang;

    message.voice =
        voice;

    message.rate =
        0.9;

    window.speechSynthesis.speak(message);
}

/* =========================================
   SONNERIE D'APPEL HEP!
   ========================================= */

let attentionAudioContext = null;


function playAttentionAlarm() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext) {
        return;
    }


    if (!attentionAudioContext) {
        attentionAudioContext =
            new AudioContext();
    }


    const ctx =
        attentionAudioContext;


    if (ctx.state === "suspended") {
        ctx.resume();
    }


    const startTime =
        ctx.currentTime + 0.05;


    /*
       4 séries de deux bips.
       Durée totale : environ 4 secondes.
    */

    for (let i = 0; i < 4; i++) {

        const baseTime =
            startTime + (i * 1.0);

        createAlarmTone(
            ctx,
            880,
            baseTime,
            0.22
        );

        createAlarmTone(
            ctx,
            1175,
            baseTime + 0.30,
            0.30
        );
    }
}


function createAlarmTone(
    ctx,
    frequency,
    startTime,
    duration
) {

    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type =
        "sine";

    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        0.0001,
        startTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.8,
        startTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration
    );


    oscillator.connect(gain);

    gain.connect(
        ctx.destination
    );


    oscillator.start(
        startTime
    );

    oscillator.stop(
        startTime + duration + 0.05
    );
}

function chooseVoice(type) {

    const selectId =
        type === "male"
            ? "maleVoiceSelect"
            : "femaleVoiceSelect";

    const select =
        document.getElementById(selectId);

    if (!select || !select.value) {
        return;
    }


    if (type === "male") {

        maleVoiceName =
            select.value;

        activeVoiceType =
            "male";

        writeLocalSetting(
            VOICE_STORAGE_KEYS.male,
            maleVoiceName
        );

    }
    else {

        femaleVoiceName =
            select.value;

        activeVoiceType =
            "female";

        writeLocalSetting(
            VOICE_STORAGE_KEYS.female,
            femaleVoiceName
        );

    }


    writeLocalSetting(
        VOICE_STORAGE_KEYS.active,
        activeVoiceType
    );

    updateVoiceButtons();

    speak(
        type === "male"
            ? "Voix masculine sélectionnée"
            : "Voix féminine sélectionnée"
    );
}


function updateVoiceButtons() {

    const maleButton =
        document.getElementById(
            "maleVoiceButton"
        );

    const femaleButton =
        document.getElementById(
            "femaleVoiceButton"
        );


    if (!maleButton || !femaleButton) {
        return;
    }


    maleButton.classList.remove(
        "voice-active"
    );

    femaleButton.classList.remove(
        "voice-active"
    );


    if (activeVoiceType === "male") {

        maleButton.classList.add(
            "voice-active"
        );

    }
    else {

        femaleButton.classList.add(
            "voice-active"
        );

    }
}


/* Compatibilité voix Android / iPhone */

if (
    "speechSynthesis" in window &&
    typeof window.speechSynthesis.addEventListener === "function"
) {

    window.speechSynthesis.addEventListener(
        "voiceschanged",
        loadFrenchVoices
    );

}


/* Douleur */

let selectedPainLocation = "";


function selectPainLocation(location) {

    selectedPainLocation = location;

    document.getElementById("painStep1").classList.add("hidden");
    document.getElementById("painStep2").classList.remove("hidden");

    document.getElementById("painLocationTitle").textContent =
        "Douleur " + location + " : quelle intensité ?";
}


function selectPainLevel(level) {

    if (selectedPainLocation === "") {
        return;
    }

    const sentence =
        "J’ai mal " +
        selectedPainLocation +
        ". Douleur " +
        level +
        " sur 10.";

    speak(sentence);
}


function changePainLocation() {

    selectedPainLocation = "";

    document.getElementById("painStep2").classList.add("hidden");
    document.getElementById("painStep1").classList.remove("hidden");
}


function resetPain() {

    selectedPainLocation = "";

    document.getElementById("painStep2").classList.add("hidden");
    document.getElementById("painStep1").classList.remove("hidden");
}


function speakCustomText() {

    const text =
        document.getElementById("customText").value.trim();

    if (text === "") {
        return;
    }

    speak(text);
}


function clearCustomText() {

    const textArea =
        document.getElementById("customText");

    textArea.value = "";

    textArea.focus();
}


function addText(text) {

    const textArea =
        document.getElementById("customText");

    const currentText = textArea.value;

    if (
        currentText !== "" &&
        !currentText.endsWith(" ")
    ) {
        textArea.value += " ";
    }

    textArea.value += text;

    textArea.focus();

    textArea.setSelectionRange(
        textArea.value.length,
        textArea.value.length
    );
}

/* =========================================
   PARTAGER MA VOIX PAR EMAIL
   ========================================= */

function shareAppByEmail() {

    const emailInput =
        document.getElementById("shareEmail");

    const messageElement =
        document.getElementById("shareMessage");


    if (!emailInput || !messageElement) {
        return;
    }


    const email =
        emailInput.value.trim();


    messageElement.textContent = "";


    /* Vérification de l'adresse email */

    if (
        email === "" ||
        !emailInput.checkValidity()
    ) {

        messageElement.textContent =
            "Veuillez saisir une adresse email valide.";

        emailInput.focus();

        return;
    }


    /* Vérification d'une connexion Internet */

    if (!navigator.onLine) {

        messageElement.textContent =
            "Aucune connexion Internet détectée.";

        return;
    }


    const subject =
        "Une app pour faire parler un patient aphone";


    const body =
`Vous êtes invité-e à découvrir « Ma Voix », une application gratuite et simple, développée à partir des besoins rencontrés auprès de patients et de soignants en milieu hospitalier à Genève, pour aider les patients avec trachéotomie ou aphones à sortir de leur prison du silence.

Le principe de l'application est très simple :

Le patient dispose de gros boutons correspondant à ce qu'il peut vouloir dire — par exemple Oui, Non, Stop, HEP!, J'ai mal, Respiration, Position, Soins, Toilettes, Famille / Amis, Émotions, Questions, etc.

Il lui suffit d'appuyer sur un bouton et le téléphone ou la tablette prononce la phrase à sa place.

Quelques informations importantes :

• L'application ne nécessite aucun compte ; 0 impact sur la confidentialité des données.

• Elle fonctionne sur Android et iPhone, smartphone et tablette, avec un affichage adaptatif à la taille de l'écran.

• Une connexion Internet est nécessaire uniquement pour la première installation et pour les éventuelles mises à jour ultérieures.

• Après son installation, l'application peut fonctionner sans connexion Internet, notamment dans les chambres mal couvertes par le Wi-Fi.


Vous pouvez accéder à l'application ici :

👉 https://wrelax1.github.io/ma-voix/


Pour pouvoir l'utiliser facilement comme une application normale et également hors connexion, son installation sur l'écran d'accueil est conseillée.


SUR IPHONE

1. Avec une connexion Internet active, ouvrir l'adresse ci-dessus avec Safari.

2. Appuyer sur le bouton Partager.

3. Choisir « Ajouter à l'écran d'accueil ».

4. Vérifier que le nom est « Ma Voix », puis appuyer sur « Ajouter ».

5. Ma Voix apparaîtra ensuite comme une application normale sur l'écran de l'iPhone.


SUR ANDROID

1. Avec une connexion Internet active, ouvrir l'adresse ci-dessus avec un navigateur tel que Chrome ou Edge.

2. Appuyer sur les trois points ⋮ en haut à droite.

3. Choisir « Installer l'application » ou « Ajouter à l'écran d'accueil ».

4. Valider « Ma Voix ».

5. Ma Voix apparaîtra ensuite comme une application normale sur l'écran du téléphone ou de la tablette.


Redonnons une voix à ceux qui en sont privés.`;


    const mailtoUrl =
        "mailto:" +
        encodeURIComponent(email) +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);


    messageElement.textContent =
        "Ouverture de votre messagerie…";


    window.location.href =
        mailtoUrl;
}

const FAVORITES_STORAGE_KEY = "maVoixCustomFavorites";


function getCustomFavorites() {

    const savedFavorites =
        localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!savedFavorites) {
        return [];
    }

    try {
        return JSON.parse(savedFavorites);
    }
    catch (error) {
        return [];
    }
}

function openFavoritesScreen() {

    renderCustomFavorites();

    showScreen("favoritesScreen");
}


function saveFavoriteText(textAreaId) {

    const textArea =
        document.getElementById(textAreaId);

    if (!textArea) {
        return;
    }

    const phrase =
        textArea.value.trim();

    if (phrase === "") {
        return;
    }

    const favorites =
        getCustomFavorites();

    if (favorites.includes(phrase)) {

        speak("Cette phrase est déjà dans vos favoris");

        return;
    }

    favorites.push(phrase);

    localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites)
    );

    textArea.value = "";

    renderCustomFavorites();

    speak("Phrase ajoutée");
}


function saveFavorite() {

    saveFavoriteText("favoriteText");
}


function saveFavoriteFromWrite() {

    saveFavoriteText("customText");
}

function renderCustomFavorites() {

    const container =
        document.getElementById("customFavorites");

    if (!container) {
        return;
    }

    const favorites =
        getCustomFavorites();

    container.innerHTML = "";

    if (favorites.length === 0) {

        const message =
            document.createElement("p");

        message.className = "no-favorites";

        message.textContent =
            "Aucune phrase personnelle pour le moment.";

        container.appendChild(message);

        return;
    }


    favorites.forEach(function(phrase, index) {

        const item =
            document.createElement("div");

        item.className = "favorite-item";


        const speakButton =
            document.createElement("button");

        speakButton.className =
            "favorite-speak-button";

        speakButton.textContent =
            phrase;

        speakButton.onclick =
            function() {
                speak(phrase);
            };

		const deleteButton =
			document.createElement("button");

		deleteButton.className =
			"favorite-delete-button";

		deleteButton.textContent =
			"🗑️";

		deleteButton.setAttribute(
			"aria-label",
			"Supprimer la phrase"
		);

		deleteButton.onclick =
			function(event) {

				event.stopPropagation();

				deleteFavorite(index);
			};

        item.appendChild(speakButton);

        item.appendChild(deleteButton);

        container.appendChild(item);
    });
}


function deleteFavorite(index) {

    const favorites =
        getCustomFavorites();

    const phrase =
        favorites[index];

    const confirmed =
        confirm(
            "Supprimer cette phrase ?\n\n" +
            phrase
        );

    if (!confirmed) {
        return;
    }

    favorites.splice(index, 1);

    localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favorites)
    );

    renderCustomFavorites();
}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderCustomFavorites();

        loadFrenchVoices();

        updateVoiceButtons();

    }
);


if ("serviceWorker" in navigator) {

    let serviceWorkerRefreshing = false;

    const hadController =
        navigator.serviceWorker.controller !== null;


    window.addEventListener(
        "load",
        function() {

            navigator.serviceWorker
                .register("./sw.js")
                .then(function(registration) {

                    return registration.update();

                })
                .catch(function(error) {

                    console.error(
                        "Erreur Service Worker :",
                        error
                    );

                });

        }
    );


    navigator.serviceWorker.addEventListener(
        "controllerchange",
        function() {

            if (
                !hadController ||
                serviceWorkerRefreshing
            ) {
                return;
            }

            serviceWorkerRefreshing = true;

            window.location.reload();

        }
    );

}