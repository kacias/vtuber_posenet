// layout
let sidebar = document.getElementById("thesidebar");
let moodbar = document.getElementById("themoodbar");
let layout = document.getElementById("layout");       //이건 사용 안하는 듯
let system = document.getElementById("system");



// 시스템 메시지
//let systemtext = document.getElementById("systemtext");

//=================================================================================================

// Three.js 시작
// 3D renderer
let renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// camera
let camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.4, -1.4);

// camera controls
let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.4, 0.0);
controls.update();

// 윈도우 화면 리사이즈 콜백 함수
window.addEventListener('resize', onWindowResize, false);
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// 카메라 리셋 함수
function resetCameraPos(pos){
    camera.position.set(pos.x, pos.y, pos.z - 1.4);
    controls.target.set(pos.x, pos.y, pos.z);
}

// 백그라운드 색 셋업
function setBackGround(){
    if(getCMV('BG_UPLOAD')){
        renderer.setClearColor('#000', 0);
        document.getElementById('bgimg').style.backgroundImage = getCMV('BG_UPLOAD');
    }else{
        renderer.setClearColor(getCMV('BG_COLOR'), 1);
    }
}

// 카메라 콜백 함수
function setCameraCallBack(){
    let dbg = document.getElementById("dbg");
    linkCamera2Context(dbg, getCMV('CANVAS_RATIO'));
    createCameraLayout();
    reSettingDone();
}

// UI 만들기 메인 함수
function createLayout()
{
    setBackGround();
    // document link

    // vrm loading button
    let vrmbtn = document.getElementById("vrmbtn");
    vrmbtn.onchange = function(){
        let txt = "";
        if('files' in vrmbtn && vrmbtn.files.length > 0){
            let files = vrmbtn.files;
            let file = files[0];
            let blob = new Blob([file], {type: "application/octet-stream"});
            let url = URL.createObjectURL(blob);
            setCMV("MODEL", url);
            loadVRM(url);
        }else{
            console.log("No VRM Loaded");
        }
    }


}

// 카메라 선택
function createCameraLayout(){
    let videoselect = document.getElementById("videoselect");
    videoselect.innerHTML = "";
    
    listCameras(carr => {
        for(let cobj of carr){
            let option = document.createElement('option');
            option.value = cobj['id'];
            option.innerHTML = cobj['name'];
            videoselect.appendChild(option);
            if(cobj['id'] == getCurrentVideoId()){
                videoselect.value = cobj['id'];
            }
        }
    });
}


// 모드 선택
function createMoodLayout(){
    // reset MoodLayout
    moodbar.innerHTML = "";
    let tmp = document.createElement("div");
    tmp.className = "w3-bar-item";
    tmp.style.height = "65px";
    tmp.style.color = "#0000";
    tmp.innerHTML = ".";
    moodbar.appendChild(tmp);
    
    // mood
    let moods = getAllMoods();
    for(let i = 0; i < moods.length; i ++){
        let mood = moods[i];
        if(checkVRMMood(mood))
        {

            let moodobj = document.createElement('img');
            moodobj.id = "moodobj_" + mood;
            moodobj.src = "asset/mood/" + mood + ".png";
            moodobj.style.width = "30px";
            moodobj.style.cursor = "pointer";
            moodobj.style.marginLeft = "12px";
            moodobj.onclick = function(){
                setMoodSelect(mood);
                setMood(mood);
            }
            moodbar.appendChild(moodobj);
            moodbar.appendChild(document.createElement("br"));
            moodbar.appendChild(document.createElement("br"));
        }
    }
    setMoodSelect(getCMV('DEFAULT_MOOD'));
}

function setMoodSelect(newmood){
    let moods = getAllMoods();
    for(let i = 0; i < moods.length; i ++){
        let mood = moods[i];
        if(checkVRMMood(mood)){
            let moodobj = document.getElementById("moodobj_" + mood);
            moodobj.style.filter = "";
        }
    }
    let moodobj = document.getElementById("moodobj_" + newmood);
    moodobj.style.filter = "invert(1)";
}

function clearDebugCvs(){
    if(isVisible("dbgbox")){
        // get debug camera canvas
        let dbg = document.getElementById("dbg").getContext('2d');
        dbg.clearRect(0, 0, dbg.canvas.width, dbg.canvas.height);
        dbg.fillStyle = 'rgba(0,0,0,0.8)';
        dbg.fillRect(0, 0, dbg.canvas.width, dbg.canvas.height);
    }
}

//디버그 캔퍼스인 듯
function drawImage(image){
    if(isVisible("dbgbox")){
        // get debug camera canvas
        let dbg = document.getElementById("dbg").getContext('2d');
        dbg.save();
        if(getCMV('CAMERA_FLIP')){
            dbg.translate(dbg.canvas.width, 0);
            dbg.scale(-getCMV('CANVAS_RATIO'), getCMV('CANVAS_RATIO'));
        }else{
            dbg.scale(getCMV('CANVAS_RATIO'), getCMV('CANVAS_RATIO'));
        }
        dbg.drawImage(image, 0, 0); // print the camera
        dbg.restore();
    }
}

//랜드마크 그리기
function drawLandmark(landmark){
    if(isVisible("dbgbox")){
        // get debug camera canvas
        let dbg = document.getElementById("dbg").getContext('2d');
        dbg.save();
        if (getCMV('CAMERA_FLIP')){
            dbg.translate(dbg.canvas.width, 0);
            dbg.scale(-getCMV('CANVAS_RATIO'), getCMV('CANVAS_RATIO'));
        }else{
            dbg.scale(getCMV('CANVAS_RATIO'), getCMV('CANVAS_RATIO'));
        }
        Object.keys(landmark).forEach(function(key){
            for (let i = 0; i < landmark[key].length; i++){
                let p = landmark[key][i];
                dbg.fillStyle = MARKCOLOR[key];
                dbg.beginPath();
                dbg.arc(p[0], p[1], 4, 0, 2 * Math.PI);
                dbg.fill();
            }
        });
        dbg.restore();
    }
}

function printLog(keys){
    if(isVisible("logbox")){
        let logitems = getLogItems();
        for(let ikey of logitems){
            if(isVisible("logbox_" + ikey)){
                let logbox = document.getElementById("logbox_" + ikey);
                logbox.innerHTML = '';
                if(keys[ikey]){
                    Object.keys(keys[ikey]).forEach(function(key){
                        let jsonItem = document.createElement('text');
                        jsonItem.innerHTML = key + ": " + Math.floor(keys[ikey][key] * 1000) / 1000 + "<br/>";
                        jsonItem.style.color = "white";
                        logbox.appendChild(jsonItem);
                    });
                }else{
                    logbox.innerHTML = 'No ' + ikey + ' Detected';
                }
            }
        }
    }
}

// 렌더러 출력 (화면 반전 기능 포함)
function drawScene(scene){
    if(getCMV('CAMERA_FLIP') != getCMV('SCENE_FLIP')){
        setCMV('SCENE_FLIP', getCMV('CAMERA_FLIP'));
        scene.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
    }
    renderer.render(scene, camera);
}

function hideLoadbox(){
    let loadbox = document.getElementById('loadbox');
    loadbox.style.display = "none";
    loadbox.innerHTML = "";
}

function drawMobile(){
    let loadbox = document.getElementById('loadinfo');
    loadbox.innerHTML = "MOBILE NOT SUPPORTED!!";
}

function isVisible(target){
    let obj = document.getElementById(target);
    return obj.className.indexOf("w3-hide") == -1 &&
        sidebar.style.display != "none";
}

function hideObj(target){
    let obj = document.getElementById(target);
    if(obj.className.indexOf("w3-hide") == -1){
        obj.className += " w3-hide";
    }else{
        obj.className = obj.className.replace(" w3-hide", "");
    }
}
