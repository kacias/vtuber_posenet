console.log("hi")


const canvas = document.querySelector('.webgl');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x004fff);


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6;
camera.position.y = 1;


const TVRMSHBN = THREE.VRMSchema.HumanoidBoneName;
let loader = new THREE.GLTFLoader();
let url = 'https://pixiv.github.io/three-vrm/packages/three-vrm/examples/models/three-vrm-girl.vrm'


loadVRMModel(url)

//VRM 모델을 위치 정보로 변환하는 함수
function loadVRMModel(url) {
    loader.crossOrigin = 'anonymous';
    loader.load(url,
        (gltf) => {
            THREE.VRMUtils.removeUnnecessaryVertices(gltf.scene);
            THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);
            THREE.VRM.from(gltf).then((vrm) => {

                console.log(vrm);
                const root = vrm.scene;
                root.scale.set(1.0, 1.0, 1.0);
                //root.rotation.y = 180;
                scene.add(root);

                //setDefaultPose(vrm);
                //cb(vrm);
            });
        },
        (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
        (error) => console.error(error)
    );
}


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2,2,5);
scene.add(light);


const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpaha: true,
    antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.gammaOutput = true;


function animate(){



    requestAnimationFrame(animate);
    renderer.render(scene, camera);

}

animate()






