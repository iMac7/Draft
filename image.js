const canvas = document.querySelector('.myCanvas')

const imageUrl = 'dubai.jpg'

drawImage(imageUrl)

function rgbToGrayscale(r, g, b) {
    // Luminosity method, makes grayscale more accurate to humans
    return 0.21 * r + 0.72 * g + 0.07 * b
}


function drawImage(imageUrl) {
    const img = new Image()
    
    img.onload = function() {
        // get whatever is covering the face of the canvas
        const ctx = canvas.getContext('2d')
        
        // set canvas dimensions to match the image dimensions, prevent image distortion
        canvas.width = this.width
        canvas.height = this.height
        
        ctx.drawImage(this, 0, 0)
        
        // Get the pixel data of the image on the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = imageData.data;
        
        // Loop through each pixel in the image data, 
        // replacing any color with grayscale value
        for (let i = 0; i < pixelData.length; i += 4) {
            const r = pixelData[i]
            const g = pixelData[i + 1]
            const b = pixelData[i + 2]
            
            const grayscaleValue = rgbToGrayscale(r, g, b)
            
            pixelData[i] = grayscaleValue
            pixelData[i + 1] = grayscaleValue
            pixelData[i + 2] = grayscaleValue
            pixelData[i + 3] = 255
        }
        
        // Update the canvas with modified image data
        ctx.putImageData(imageData, 0, 0)
    }
    
    img.src = imageUrl;
}