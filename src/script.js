import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()
gui.close()

const parameters = {
    materialColor: '#ffee8c'
}


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// lights
const dirLight = new THREE.DirectionalLight(0xffffff, 3)
dirLight.position.set(1,1,0)

scene.add(dirLight)


// textures
const textureLoader = new THREE.TextureLoader()

const meshTexture = textureLoader.load('textures/gradients/3.jpg')
meshTexture.magFilter = THREE.NearestFilter

/**
 * Test cube
 */

const material = new THREE.MeshToonMaterial({ gradientMap: meshTexture, color: parameters.materialColor })

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.5, 24, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 1, 32),
   material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
   material
)
const mesh4 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1),
   material
)

const distance = 4;

mesh1.position.y = - distance * 0
mesh2.position.y = - distance * 1
mesh3.position.y = - distance * 2
mesh4.position.y = - distance * 3

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2
mesh4.position.x = -2

const meshes = [mesh1, mesh2, mesh3, mesh4]

scene.add(...meshes)

// Particles
const count = 200;
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array(200*3);

for (let i = 0; i < count; i++)
{
    const i3 = i * 3;

    vertices[i3] = (Math.random() - 0.5) * 10
    vertices[i3+1] = distance*0.5 - Math.random() * distance*meshes.length
    vertices[i3+2] = (Math.random() - 0.5) * 30
}

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

const particlesMaterial = new THREE.PointsMaterial({color: parameters.materialColor, size: 0.03, sizeAttenuation: true})

const particles = new THREE.Points(
    geometry,
    particlesMaterial,
)

scene.add(particles);


// Gui

gui
    .addColor(parameters, 'materialColor')
    .onChange(v => {
        material.color.set(new THREE.Color(v))
        particles.material.color.set(new THREE.Color(v))
    })

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const cameraGroup = new THREE.Group
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

scene.add(cameraGroup)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

let scrollY = window.scrollY;
let section = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    const newSection = Math.round(currentScrollY/sizes.height)

    if (newSection !==section) {
        section = newSection
        gsap.to(meshes[section].rotation, {duration: 1.5, ease: 'power2.inOut', x: '+=6', y: '+=3', z: '+=1.5'})
    }


  scrollY = currentScrollY;
})

let cursorX = 0, cursorY = 0;

window.addEventListener('mousemove', (e) => {

    cursorY = e.clientY/sizes.height - 0.5
    cursorX = e.clientX/sizes.width - 0.5

})

let previousTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;


    for (let mesh of meshes) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.1
    }

    camera.position.y = -scrollY/sizes.height * distance

    const parallaxX = cursorX*0.5
    const parallaxY =  -cursorY*0.5

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x)* 5 *deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y)* 5 *deltaTime


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()