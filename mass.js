document.addEventListener('DOMContentLoaded', () => {
    // --- TEMPLATE DATA (The "Meme Templates" Library) ---
    // NOTE: Replace the placeholder URLs with actual local or web image URLs.
    const MEME_TEMPLATES = [
        // Using placeholder URLs for demonstration. Replace these!
        { id: 't1', name: 'Template 1', src: 'https://via.placeholder.com/600x400?text=Template+1', top: 'TEMPLATE', bottom: 'CAPTION' },
        { id: 't2', name: 'Template 2', src: 'https://via.placeholder.com/600x400?text=Template+2', top: 'TOP IDEA', bottom: 'BOTTOM IDEA' },
        { id: 't3', name: 'Template 3', src: 'https://via.placeholder.com/600x400?text=Template+3', top: 'ONE DOES NOT', bottom: 'SIMPLY FORGET JS' }
    ];

    // --- DOM Elements ---
    const imageUpload = document.getElementById('imageUpload');
    const topTextInput = document.getElementById('topText');
    const bottomTextInput = document.getElementById('bottomText');
    const generateBtn = document.getElementById('generateBtn');
    const saveMemeBtn = document.getElementById('saveMemeBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const placeholderText = document.getElementById('placeholderText');
    const templateSelector = document.getElementById('templateSelector');
    const savedMemesGrid = document.getElementById('savedMemesGrid');

    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    
    let uploadedImage = null;
    let currentTemplateId = null;

    // Initial state setup
    canvas.style.display = 'none'; 
    downloadBtn.disabled = true;
    saveMemeBtn.disabled = true;

    // --- Helper Function to Draw Text on Canvas ---
    function drawText(text, y, alignment) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.font = 'bold 50px Impact, sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = alignment;

        ctx.strokeText(text.toUpperCase(), canvas.width / 2, y);
        ctx.fillText(text.toUpperCase(), canvas.width / 2, y);
    }

    // --- Function to Generate/Redraw the Meme (CREATE/MODIFY) ---
    function generateMeme() {
        if (!uploadedImage) return;

        // Set canvas dimensions to match the image dimensions
        canvas.width = uploadedImage.width;
        canvas.height = uploadedImage.height;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw the image (background)
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

        // 2. Draw the text (custom writing)
        drawText(topTextInput.value, 10, 'top');
        drawText(bottomTextInput.value, canvas.height - 10, 'bottom');
        
        // Enable buttons
        downloadBtn.disabled = false;
        saveMemeBtn.disabled = false;
    }

    // --- TEMPLATE LOGIC (READ) ---
    function loadTemplate(template) {
        // Clear custom upload if a template is selected
        imageUpload.value = ''; 
        
        // Highlight the selected template item
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.getElementById(`template-${template.id}`).classList.add('selected');

        // Set the text fields
        topTextInput.value = template.top;
        bottomTextInput.value = template.bottom;

        // Load the image
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Required for images from external URLs to be drawn to canvas
        img.onload = () => {
            uploadedImage = img;
            currentTemplateId = template.id; // Track the current template
            placeholderText.style.display = 'none';
            canvas.style.display = 'block';
            generateMeme();
        };
        img.src = template.src;
    }

    function renderTemplates() {
        if (MEME_TEMPLATES.length === 0) {
            templateSelector.innerHTML = '<p>No templates defined.</p>';
            return;
        }

        templateSelector.innerHTML = '';
        MEME_TEMPLATES.forEach(template => {
            const item = document.createElement('div');
            item.className = 'template-item';
            item.id = `template-${template.id}`;
            item.innerHTML = `<img src="${template.src}" alt="${template.name}">`;
            item.addEventListener('click', () => loadTemplate(template));
            templateSelector.appendChild(item);
        });
    }

    // --- SAVED MEMES LOGIC (CREATE, READ, DELETE, MODIFY) ---

    function getSavedMemes() {
        try {
            return JSON.parse(localStorage.getItem('savedMemes')) || [];
        } catch (e) {
            console.error("Could not parse saved memes from localStorage.", e);
            return [];
        }
    }

    // CREATE: Save new meme to local storage
    function saveMeme() {
        if (!uploadedImage) return;

        const memes = getSavedMemes();
        
        // Use the Data URL of the generated meme as the thumbnail/source
        const memeUrl = canvas.toDataURL();
        
        const newMeme = {
            id: Date.now(), // Unique ID
            topText: topTextInput.value,
            bottomText: bottomTextInput.value,
            imageUrl: memeUrl, // The final generated meme image (Data URL)
            templateId: currentTemplateId
        };

        memes.push(newMeme);
        localStorage.setItem('savedMemes', JSON.stringify(memes));
        renderSavedMemes();
        alert('Meme saved successfully!');
    }
    
    // DELETE: Remove meme from local storage
    function deleteMeme(id) {
        let memes = getSavedMemes();
        memes = memes.filter(meme => meme.id !== id);
        localStorage.setItem('savedMemes', JSON.stringify(memes));
        renderSavedMemes();
    }

    // MODIFY: Load saved meme for editing
    function loadSavedMeme(meme) {
        // Load captions back into inputs
        topTextInput.value = meme.topText;
        bottomTextInput.value = meme.bottomText;
        
        // Deselect any active template
        document.querySelectorAll('.template-item').forEach(item => item.classList.remove('selected'));
        currentTemplateId = null;

        // Load the saved image (which is a Data URL)
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            placeholderText.style.display = 'none';
            canvas.style.display = 'block';
            generateMeme(); // Redraw the meme for editing/downloading
        };
        img.src = meme.imageUrl;
    }

    // READ: Display all saved memes
    function renderSavedMemes() {
        const memes = getSavedMemes();
        savedMemesGrid.innerHTML = '';

        if (memes.length === 0) {
            savedMemesGrid.innerHTML = '<p id="noSavedMemes">No memes saved yet!</p>';
            return;
        }
        
        memes.forEach(meme => {
            const item = document.createElement('div');
            item.className = 'saved-item';
            item.innerHTML = `
                <img src="${meme.imageUrl}" alt="Saved Meme">
                <button class="delete-btn" data-id="${meme.id}">X</button>
            `;
            
            // Click listener to load meme for editing (MODIFY)
            item.querySelector('img').addEventListener('click', () => loadSavedMeme(meme));
            
            // Click listener to delete meme (DELETE)
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents the parent click event (which would load the meme)
                if (confirm('Are you sure you want to delete this meme?')) {
                    deleteMeme(meme.id);
                }
            });

            savedMemesGrid.appendChild(item);
        });
    }

    // --- EVENT LISTENERS ---
    
    // Custom Image Upload Logic
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                currentTemplateId = null; 
                placeholderText.style.display = 'none';
                canvas.style.display = 'block';
                document.querySelectorAll('.template-item').forEach(item => item.classList.remove('selected'));
                generateMeme();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Text Input/Button Click Triggers
    topTextInput.addEventListener('input', generateMeme);
    bottomTextInput.addEventListener('input', generateMeme);
    generateBtn.addEventListener('click', generateMeme);
    saveMemeBtn.addEventListener('click', saveMeme); 

    // Download Logic
    downloadBtn.addEventListener('click', () => {
        const imageURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = 'mass-meme.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // --- INITIALIZATION ---
    renderTemplates();
    renderSavedMemes();
});
