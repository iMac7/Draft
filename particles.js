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
        this.x +=  (this.originX - this.x) * this.speed
        this.y +=  (this.originY - this.y) * this.speed
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



const button = document.querySelector('button')
button.addEventListener('click', () => {
    window.location.reload()
})
