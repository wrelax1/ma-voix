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

    window.scrollTo(0, 0);
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


window.speechSynthesis.addEventListener(
    "voiceschanged",
    loadFrenchVoices
);


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


function saveFavorite() {

    const textArea =
        document.getElementById("favoriteText");

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
            "SUPPRIMER";

        deleteButton.onclick =
            function() {
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