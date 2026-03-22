import * as THREE from "../node_modules/three/build/three.module.js";
import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, model, controls;

// specific camera positions for each model
const cameraPositions = {
    1: { x: 0, y: 0, z: 20 }, // for Apple Logo 
    2: { x: 0, y: 0, z: 2 }, // for iPhone
    3: { x: 0, y: -5, z: 15 }, // for AirPods
    4: { x: 0, y: 0, z: 0.4 }, // Vision Pro
    5: { x: 0, y: 0, z: 110 }, // Apple Watch
};

function initViewer(modelPath, cameraPos) {
    if (model) scene.remove(model);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // OrbitControls for user interaction
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Load the GLTF model
    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        function (gltf) {
            model = gltf.scene;
            model.traverse((node) => {
                if (node.isMesh && node.material) {
                    node.material.roughness = 1;
                    node.material.metalness = 0.7;
                }
            });

            model.scale.set(2, 2, 2);
            scene.add(model);
            animate();
        },
        undefined,
        function (error) {
            console.error("An error occurred while loading the model:", error);
        }
    );

    // for custom camera position
    camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Fetch model path and camera position from query parameters
const urlParams = new URLSearchParams(window.location.search);
const modelPath = urlParams.get('model');
const modelNum = urlParams.get('modelNum'); // Retrieve the model number
if (modelPath && modelNum) {
    // Use cameraPositions to set the appropriate camera position
    const cameraPos = cameraPositions[modelNum] || { x: 0, y: 0, z: 20 };
    initViewer(modelPath, cameraPos);   
}

function view3DModel(num) {
    let modelPath;
    switch (num) {
        case 1:
            modelPath = './Products/appleLogo.glb';
            break;
        case 2:
            modelPath = './Products/appleIphone.glb';
            break;
        case 3:
            modelPath = './Products/airPods.glb';
            break;
        case 4:
            modelPath = './Products/appleVisionPro.glb';
            break;
        case 5:
            modelPath = './Products/appleWatch.glb';
            break;
        default:
            console.error("Invalid product number");
            return;
    }

    // Open new tab and pass both model path and model number as query parameters
    window.open(`viewer.html?model=${encodeURIComponent(modelPath)}&modelNum=${num}`, '_blank');
}

window.view3DModel = view3DModel;

