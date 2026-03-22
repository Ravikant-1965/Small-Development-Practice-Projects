import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

window.a = a;
//add moon
function addMoon() {
    // Moon geometry with high detail
    const moonGeometry = new THREE.SphereGeometry(12, 64, 64); 
    const moonTexture = new THREE.TextureLoader().load('moontexture'); // Use an actual moon texture path
    const moonMaterial = new THREE.MeshStandardMaterial({ 
        map: moonTexture,
        emissive: 0x111111,  // Soft subtle glow from within
        emissiveIntensity: 0.2,
        transparent: false,  // Ensure no transparency
        opacity: 1           // Fully opaque
    });

    // Create moon mesh
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);

    // Position the moon in the sky
    moon.position.set(-200, 80, -300); 
    scene.add(moon);

    // Add a point light near the moon for visibility
    const moonLight = new THREE.PointLight(0xaaaaaa, 0.5, 800); 
    moonLight.position.set(-180, 90, -250); // Position near the moon
    scene.add(moonLight);

    // Add a more subtle glow for the moon
    const moonGlowTexture = new THREE.TextureLoader().load("path/to/moon_glow.png"); // Transparent glow texture
    const moonGlowMaterial = new THREE.SpriteMaterial({
        map: moonGlowTexture,
        color: 0xddddff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
    });
    const moonGlow = new THREE.Sprite(moonGlowMaterial);
    moonGlow.scale.set(40, 40, 1); // Smaller, subtler glow size
    moonGlow.position.copy(moon.position);
    scene.add(moonGlow);
}

//add sun
function addSun() {
    // Sun geometry and emissive material for a glowing effect
    const sunGeometry = new THREE.SphereGeometry(50, 64, 64); // Adjusted segments for a smoother sphere
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc44, emissive: 0xffcc44 });

    // Create sun mesh
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);

    // Position the sun further back for depth perception
    sun.position.set(300, 100, -700); // Adjust for perspective
    scene.add(sun);

    // Add a bright point light for sunlight effect
    const sunLight = new THREE.PointLight(0xffcc44, 1.5, 2000);
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    // Optional: Improved glow effect with a transparent glow sprite
    const glowTexture = new THREE.TextureLoader().load("path/to/glow.png"); // Use a soft, transparent glow image
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xffdd44,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(700, 700, 1); // Larger scale for a soft, ambient glow
    glow.position.copy(sun.position);
    scene.add(glow);
}

//add other stars
function addColoredStars() {
    // Blue Stars
    const starGeometryBlue = new THREE.BufferGeometry();
    const starMaterialBlue = new THREE.PointsMaterial({ color: 'blue' });
    const starVerticesBlue = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVerticesBlue.push(x, y, z);
    }
    starGeometryBlue.setAttribute('position', new THREE.Float32BufferAttribute(starVerticesBlue, 3));
    const blueStars = new THREE.Points(starGeometryBlue, starMaterialBlue);
    scene.add(blueStars);

    // Red Stars
    const starGeometryRed = new THREE.BufferGeometry();
    const starMaterialRed = new THREE.PointsMaterial({ color: 'red' });
    const starVerticesRed = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVerticesRed.push(x, y, z);
    }
    starGeometryRed.setAttribute('position', new THREE.Float32BufferAttribute(starVerticesRed, 3));
    const redStars = new THREE.Points(starGeometryRed, starMaterialRed);
    scene.add(redStars);

    // White Stars
    const starGeometryWhite = new THREE.BufferGeometry();
    const starMaterialWhite = new THREE.PointsMaterial({ color: 'white' });
    const starVerticesWhite = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVerticesWhite.push(x, y, z);
    }
    starGeometryWhite.setAttribute('position', new THREE.Float32BufferAttribute(starVerticesWhite, 3));
    const whiteStars = new THREE.Points(starGeometryWhite, starMaterialWhite);
    scene.add(whiteStars);

    // Yellow Stars
    const starGeometryYellow = new THREE.BufferGeometry();
    const starMaterialYellow = new THREE.PointsMaterial({ color: 'yellow' });
    const starVerticesYellow = [];
    for (let i = 0; i < 2000; i++) {
        const x = (Math.random() - 0.5) * 4000;
        const y = (Math.random() - 0.5) * 4000;
        const z = (Math.random() - 0.5) * 4000;
        starVerticesYellow.push(x, y, z);
    }
    starGeometryYellow.setAttribute('position', new THREE.Float32BufferAttribute(starVerticesYellow, 3));
    const yellowStars = new THREE.Points(starGeometryYellow, starMaterialYellow);
    scene.add(yellowStars);
}

//init and other main functions
let scene, camera, renderer, controls;

function init(address) {
    document.getElementById('container').style.display = 'block';
    document.getElementById('productsContainer').style.display = 'none';

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    // Camera setup
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 10);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    //add stars
    addMoon();
    addSun();
    addColoredStars();

    
    // Load Model
    const loader = new GLTFLoader();
    loader.load(
        address,
        (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.position.set(0, -2, 0);
            gltf.scene.scale.set(0.12 ,0.12, 0.12);
        },
        undefined,
        (error) => console.error('Error loading the model:', error)
    );

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}




function a(num) {
    let address;
    switch (num) {
        case 1:
            address = '../assets/starship.glb';
            init(address);
            animate();
            break;
        case 2:
            address = '../assets/falcon9.glb';
            init(address);
            animate();
            break;
        case 3:
            address = '../assets/falconHeavy.glb';
            init(address);
            animate();
            break;
        case 4:
            address = '../assets/crewDragon.glb';
            init(address);
            animate();
            break;
        default:
            break;
    }
}