# Image Effects With HTML CANVAS

HTML `Canvas` is an element I don't see very often in the wild, but when I do, there's always something interesting going on there. In this guide, we will look at image manipulation inside the canvas element to produce some interesting effects that are fun to play with and can really up the wow factor on your websites.

The element `<canvas>` can be likened to an artist's canvas in that both start off blank give freedom to the artist to create any visual item they like. The possibilities are limitless - [Canvaskit](https://skia.org/docs/user/modules/canvaskit/) is a mind-blowing example.

## Setting up your development environment

All you need is a code editor, browser, and basic HTML/JS knowledge. 
Open a folder in your code editor and create an index.html file with some boilerplate.
Add a `<script>` tag and a `<canvas>` element with a class.

Log something to the console to check that the script is working :)

The canvas element is transparent by default and has no width /height set, so we'll add those and a background for clarity. 
Finally we separate the javascript from the rest and get to work.
<br>
<br>


index.html
```
<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <style>
        .myCanvas {
            width: 50vw;
            height: 50vw;
            background-color: black;
        }
    </style>
    <script src="script.js"></script>
  </head>
  <body>
    <canvas class="myCanvas"></canvas>
  </body>
</html>
```
<br>

script.js
```
console.log('hello from script')
```
Open index.html in a browser. If you have a black square on your screen and a log on your console, we are definitely on the same page, pun intended XD.

![Screenshot_20240403_155443](https://github.com/iMac7/Draft/assets/76876702/948bf68d-29aa-4b21-b58a-adaec60be838)


Adjust the width and height of the canvas according to your preferences and let's start drawing.
<br>
<br>


## Still image effects

Get an image of your liking and note its url. Paste the code below into your script.js or follow along as we go through it line by line.

```
const canvas = document.querySelector('.myCanvas')

function rgbToGrayscale(r, g, b) {
    // Luminosity method, makes grayscale more accurate to humans
    return 0.21 * r + 0.72 * g + 0.07 * b;
}

function drawGrayscaleImage(imageUrl) {
    const img = new Image()
    
    img.onload = function() {
        // get whatever is on the face of the canvas
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
            pixelData[i + 3] = 255  // controls opacity
        }
        
        // Update the canvas with modified image data
        ctx.putImageData(imageData, 0, 0)
    }
    
    img.src = imageUrl
}

const imageUrl = 'my-image-url.jpg'

drawGrayscaleImage(imageUrl)
```

First we query the dom for the canvas element. 

Next create a new image with the url of your downloaded image and draw it on the canvas with `ctx.drawImage()`.

Get the drawn image's pixel data, the tiny pieces of color that make up an image, and somehow change it.
Think of `canvas.getContext('2d')` (in the code) as the 2D contents of the canvas, in this case an image. The 3D version is `canvas.getContext('webgl')` which we won't cover for now.

`ctx.drawImage()` draws an image on the canvas.

`ctx.getImageData()` gets the pixel data of the image we just placed on the canvas.

Loop through each pixel of the image, convert its RGB values to grayscale using the provided function `rgbToGrayscale` which makes a new grayscale image.

Draw the new image on the canvas.
<br>
<br>
<br>

![Screenshot_20240403_155247](https://github.com/iMac7/Draft/assets/76876702/79e3a72d-ded6-447f-a643-7b72767458e8)


Try playing with the code a bit, raise and lower alpha value in the image's pixel data, comment out or invert colors (255 - current_color) for different interesting results. 


We've seen how to apply colors on a still image, but how about animating it?

## Particle image effects

Let's create another javascript file called particles.js. We'll learn a bit of OOP along the way.
Comment out the image.js script in `index.html` and comment in the particles.js import. This is what we will be making.


![Screenshot_20240403_155957](https://github.com/iMac7/Draft/assets/76876702/6ea0348c-4470-44cb-a6c1-8dfc8872dddb)

Remember that an image is made up of pixels? Well, for this it's hard to use individual pixels for each particle of the image, that would be a very expensive operation. We'll take the performance hit on this demo and pixelate the image a bit, but it still looks cool :P

Most of the code will just be defining the 2 classes in use - Particle and Animation. A class is just a way to reuse functionality by only defining one type of something. In this case, every particle of the image has a similar structure. 


<br>
<br>
<br>

```
class Animation {
    constructor(width, height, image, context) {
        this.width = width
        this.height = height
        this.particlesArray = []
        this.image = image
        this.pixelSize = 14
        this.context = context
    }
    init() {
        this.image.onload = ()=> {
            //draw the image, split into rectangular pixels,
            //use pixel coordinates + color to give attributes to every particle
            this.context.drawImage(this.image, 0, 0)

            const pixels = this.context.getImageData(0, 0, this.width, this.height)
            const pixelData = pixels.data

            for (let x = 0; x < this.height; x += this.pixelSize) {
                for(let y = 0; y < this.width; y += this.pixelSize) {
                    //get the index of a particle
                    const index = (x + y * this.width) * 4
                    const r = pixelData[index]
                    const g = pixelData[index + 1]
                    const b = pixelData[index + 2]
                    const a = pixelData[index + 3]

                    //only add a particle if pixel is not transparent
                    if (a > 0) {
                        const color = `rgb(${r},${g},${b})`
                        this.particlesArray.push(new Particle(this, x, y, color))
                    }
                }
            }
        }
    }
    draw() {
        this.particlesArray.forEach(particle => particle.draw(this.context))
    }
    update() {
        this.particlesArray.forEach(particle => particle.update())
    }
}
```
The class `Animation` is an object that each particle (instance of class `Particle`) contains.

The `init()` function converts an image into an array of large particles.

`draw()` assigns an animation object to each particle.

`update()` calls the update function in each particle. We haven't yet seen what that does.

<br>
<br>
<br>



```
class Particle {
    constructor(animation, x, y, color) {
        this.animation = animation
        this.size = this.animation.pixelSize
        this.color = color
        this.speed = .1

        // initial starting position of the pixel
        this.x = Math.random() * this.animation.width
        this.y = Math.random() * this.animation.height

        // final position of the pixel on the canvas
        this.originX = Math.floor(x)
        this.originY = Math.floor(y)
    }

    draw(context) {
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, this.size, this.size)
    }

    update() {
        this.x += (this.originX - this.x) * this.speed
        this.y += (this.originY - this.y) * this.speed
    }
    
}
```
The class `Particle` is one of those tiny pieces of an image that you can see floating around. 

`draw()` creates a rectangle shape for each particle on the canvas using its x, y starting position and various attributes you can change and have fun with.

`update()` changes each particle's position towards its original position (originX, originY).


<br>
<br>
<br>


Finally to tie these classes together with some more Javascript.
```
const canvas = document.querySelector('.myCanvas')
canvas.width = 800
canvas.height = 500

const ctx = canvas.getContext('2d')

// the png format is great for this because it can have transparent pixels.
// This also gives a performance boost in reducing the number 
const imageUrl = 'my-pic-url.png'
const img = new Image()
img.src = imageUrl


const animation = new Animation(canvas.width, canvas.height, img, ctx)
animation.init()
animation.draw()

function animate() {
    // remove all particles from the canvas. 
    // remove comment from next line to delete previous particles.
    // ctx.clearRect(0, 0, canvas.width, canvas.height)

    // draw new particles with updated positions
    animation.draw()
    animation.update()

    //call `animate` about 60 times per second, smooth transition every frame
    requestAnimationFrame(animate)
}
animate()
```
<br>
<br>
<br>

Here is a view of the code in full and the result.
```
class Animation {
    constructor(width, height, image, context) {
        this.width = width
        this.height = height
        this.particlesArray = []
        this.image = image
        this.pixelSize = 10
        this.context = context
    }
    init() {
        this.image.onload = ()=> {
            //draw the image, split into rectangular pixels,
            //use pixel coordinates + color to give attributes to every particle
            this.context.drawImage(this.image, 0, 0)

            const pixels = this.context.getImageData(0, 0, this.width, this.height)
            const pixelData = pixels.data

            for (let x = 0; x < this.height; x += this.pixelSize) {
                for(let y = 0; y < this.width; y += this.pixelSize) {
                    //get the index of a particle
                    const index = (x + y * this.width) * 4
                    const r = pixelData[index]
                    const g = pixelData[index + 1]
                    const b = pixelData[index + 2]
                    const a = pixelData[index + 3]

                    //only add a particle if pixel is not transparent
                    if (a > 0) {
                        const color = `rgb(${r},${g},${b})`
                        this.particlesArray.push(new Particle(this, x, y, color))
                    }
                }
            }
        }
    }
    draw() {
        this.particlesArray.forEach(particle => particle.draw(this.context))
    }
    update() {
        this.particlesArray.forEach(particle => particle.update())
    }
}



class Particle {
    constructor(animation, x, y, color) {
        this.animation = animation
        this.size = this.animation.pixelSize
        this.color = color
        this.speed = .05        

        // initial starting position of the pixel
        this.x = Math.random() * this.animation.width
        this.y = Math.random() * this.animation.height

        // final position of the pixel on the canvas
        this.originX = Math.floor(x)
        this.originY = Math.floor(y)
    }

    draw(context) {
        context.fillStyle = this.color
        context.fillRect(this.x, this.y, this.size, this.size)
    }

    update() {
        this.x += (this.originX - this.x) * this.speed
        this.y += (this.originY - this.y) * this.speed
    }
    
}





const canvas = document.querySelector('.myCanvas')
canvas.width = 800
canvas.height = 500
const ctx = canvas.getContext('2d')

const imageUrl = 'dubai.jpg'
const img = new Image()
img.src = imageUrl

const animation = new Animation(canvas.width, canvas.height, img, ctx)
animation.init()
animation.draw()

function animate() {
    // comment this line back in to clear out the extra particles
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    animation.draw()
    animation.update()
    requestAnimationFrame(animate)
}
animate()

```
<br>

![Screenshot_20240403_160235](https://github.com/iMac7/Draft/assets/76876702/a5626c11-ab99-47b6-b1db-6c7cf9443b8c)

<br>

Visit [the sandbox I made this in](https://codesandbox.io/p/sandbox/staging-lake-lwpj3h) to see it live.

Are you a _Frontend Master_ ? Share down below something impressive you made with canvas, I'd love to take a look.

