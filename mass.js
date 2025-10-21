document.addEventListener('DOMContentLoaded', () => {
    // 1. Get all necessary DOM elements
    const imageUpload = document.getElementById('imageUpload');
    const topTextInput = document.getElementById('topText');
    const bottomTextInput = document.getElementById('bottomText');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const placeholderText = document.getElementById('placeholderText');

    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    let uploadedImage = null;

    // --- Helper Function to Draw Text on Canvas ---
    function drawText(text, y, alignment) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4; // Black outline thickness
        ctx.font = 'bold 50px Impact, sans-serif'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = alignment;

        // Draw the black outline (stroke)
        ctx.strokeText(text.toUpperCase(), canvas.width / 2, y);
        // Draw the white fill
        ctx.fillText(text.toUpperCase(), canvas.width / 2, y);
    }

    // --- Function to Generate/Redraw the Meme ---
    function generateMeme() {
        if (!uploadedImage) return;

        // Set canvas dimensions to match the image dimensions
        canvas.width = uploadedImage.width;
        canvas.height = uploadedImage.height;
        
        // Clear the canvas to prepare for a redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw the uploaded image, scaled to fit the canvas dimensions
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);

        // 2. Draw the top text (aligned to the top, 10px padding)
        drawText(topTextInput.value, 10, 'top');

        // 3. Draw the bottom text (aligned to the bottom, 10px padding)
        drawText(bottomTextInput.value, canvas.height - 10, 'bottom');
        
        // Enable download button once the meme is generated
        downloadBtn.disabled = false;
    }

    // --- Event Listener for Image Upload ---
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                
                // Hide placeholder and show canvas
                placeholderText.style.display = 'none';
                canvas.style.display = 'block';

                // Initial draw after image load
                generateMeme();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // --- Event Listeners for Text Input and Button Click ---
    // User can trigger a redraw by typing or clicking the Generate button
    topTextInput.addEventListener('input', generateMeme);
    bottomTextInput.addEventListener('input', generateMeme);
    generateBtn.addEventListener('click', generateMeme);

    // --- Event Listener for Download Button ---
    downloadBtn.addEventListener('click', () => {
        // Convert the canvas content to a Data URL (PNG image)
        const imageURL = canvas.toDataURL('image/png');

        // Create a temporary link element to trigger the download
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = 'mass-meme.png';
        
        // Simulate a click on the link to start the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});