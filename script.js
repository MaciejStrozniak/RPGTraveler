// Konfiguracja Gemini API
const GEMINI_API_KEY = 'AIzaSyAyEy6m3OAsh3LsXSdyV1oq-zHvm2Nag5Q';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Elementy DOM
const encounterDescription = document.getElementById('encounterDescription');
const generateButton = document.getElementById('generateButton');
const generatedEncounter = document.getElementById('generatedEncounter');
const gemName = document.getElementById('gemName');
const gemDescription = document.getElementById('gemDescription');
const gemPersonality = document.getElementById('gemPersonality');
const gemKnowledge = document.getElementById('gemKnowledge');
const trainGemButton = document.getElementById('trainGemButton');
const trainedGemsList = document.getElementById('trainedGems');
const gemSelector = document.getElementById('gemSelector');

// Przechowywanie wytrenowanych Gemów
let trainedGems = [];

// Nasłuchiwanie na kliknięcie przycisku szkolenia
trainGemButton.addEventListener('click', trainGem);

// Nasłuchiwanie na kliknięcie przycisku generowania
generateButton.addEventListener('click', generateEncounter);

function trainGem() {
    const name = gemName.value.trim();
    const description = gemDescription.value.trim();
    const personality = gemPersonality.value.trim();
    const knowledge = gemKnowledge.value.trim();

    if (!name || !description || !personality || !knowledge) {
        alert('Proszę wypełnić wszystkie pola!');
        return;
    }

    const gem = {
        id: Date.now(),
        name,
        description,
        personality,
        knowledge
    };

    trainedGems.push(gem);
    updateGemList();
    clearGemForm();
}

function updateGemList() {
    // Aktualizacja listy wyboru
    gemSelector.innerHTML = '<option value="">Wybierz Gema do generowania</option>';
    trainedGems.forEach(gem => {
        const option = document.createElement('option');
        option.value = gem.id;
        option.textContent = gem.name;
        gemSelector.appendChild(option);
    });

    // Aktualizacja listy wyświetlanej
    trainedGemsList.innerHTML = '';
    trainedGems.forEach(gem => {
        const gemCard = document.createElement('div');
        gemCard.className = 'gem-card';
        gemCard.innerHTML = `
            <h3>${gem.name}</h3>
            <p><strong>Opis:</strong> ${gem.description}</p>
            <p><strong>Osobowość:</strong> ${gem.personality}</p>
            <p><strong>Wiedza:</strong> ${gem.knowledge}</p>
            <button onclick="deleteGem(${gem.id})">Usuń Gema</button>
        `;
        trainedGemsList.appendChild(gemCard);
    });
}

function deleteGem(id) {
    trainedGems = trainedGems.filter(gem => gem.id !== id);
    updateGemList();
}

function clearGemForm() {
    gemName.value = '';
    gemDescription.value = '';
    gemPersonality.value = '';
    gemKnowledge.value = '';
}

async function generateEncounter() {
    const description = encounterDescription.value.trim();
    const selectedGemId = gemSelector.value;
    
    if (!description) {
        alert('Proszę wpisać opis przygody!');
        return;
    }

    try {
        generateButton.disabled = true;
        generateButton.textContent = 'Generowanie...';
        
        let prompt = `Jako mistrz gry RPG, stwórz szczegółową przygodę na podstawie następującego opisu: ${description}. `;
        
        if (selectedGemId) {
            const selectedGem = trainedGems.find(gem => gem.id === parseInt(selectedGemId));
            if (selectedGem) {
                prompt += `\n\nUżyj następujących cech Gema do generowania przygody:
                Nazwa: ${selectedGem.name}
                Opis: ${selectedGem.description}
                Osobowość: ${selectedGem.personality}
                Wiedza: ${selectedGem.knowledge}`;
            }
        }

        prompt += `\n\nUwzględnij:
        - Lokację
        - Postacie
        - Wyzwania
        - Możliwe nagrody
        - Potencjalne ścieżki rozwoju fabuły
        
        Odpowiedz w języku polskim.`;

        const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Błąd API: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            generatedEncounter.textContent = data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Nieprawidłowa odpowiedź z API');
        }
    } catch (error) {
        console.error('Błąd:', error);
        generatedEncounter.textContent = `Wystąpił błąd podczas generowania przygody: ${error.message}`;
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Generuj Przygodę';
    }
} 