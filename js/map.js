if (!Detector.webgl) Detector.addGetWebGLMessage();

var updateFcts = [];
var scene, renderer, camera, orbitControls, raycaster;
var mouse = new THREE.Vector2();

var W, H;
var stats, controls;
var gui;

var popup;

//Object containers
var asteroids_obj, planets_obj, characters_obj;

var config = {
    skyBoxPath: "assets/img/purple_nebula/space_",
    skyBoxFormat: ".jpg",
    
    models_path: "assets/models/",
    maps_path: "maps/",
    mapName: "gnr.min.sbs",
    zoom: 1000,
    planetScale: 1,
    asteroid_scale: 0.03
};

function init() {
    loadData(config.mapName);
	scene = new THREE.Scene();
	W = window.innerWidth;
    H = window.innerHeight;
    initStats();
    createRenderer();
    createCamera();
    createSkybox();
    createLight();
    createControls();
    createGUI();
    processData();
    raycaster = new THREE.Raycaster();

	document.getElementById("WebGL-output").appendChild(renderer.domElement);

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    window.addEventListener("resize", onResize, false);
    
    updateFcts.push(function(){
       renderer.render(scene, camera);
    });

	requestAnimationFrame(renderScene);
}

function initStats() {
    stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.getElementById("Stats-output").appendChild(stats.domElement);
    
    updateFcts.push(function(){
        stats.update();
    });
}

function createRenderer() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
}

function createCamera() {
    camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 100000000);
    camera.position.x = -30;
    camera.position.y = 40;
    camera.position.z = 30;
    camera.lookAt(scene.position);

    scene.add(camera);
}

function createSkybox() {
    var urls = [
        config.skyBoxPath + 'right1' + config.skyBoxFormat, config.skyBoxPath + 'left2' + config.skyBoxFormat,
        config.skyBoxPath + 'top3' + config.skyBoxFormat, config.skyBoxPath + 'bottom4' + config.skyBoxFormat,
        config.skyBoxPath + 'front5' + config.skyBoxFormat, config.skyBoxPath + 'back6' + config.skyBoxFormat
    ];
    var textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.mapping = THREE.CubeRefractionMapping;
    scene.background = textureCube;
}

function createLight() {
    var ambientLight = new THREE.AmbientLight(0x222222 );
    scene.add(ambientLight);

    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1525, -740, -2323);
    
    light.castShadow	= true
	light.shadow.camera.near = 0.01
	light.shadow.camera.far	= 15
	light.shadow.camera.fov	= 45
	light.shadow.camera.left= -1
	light.shadow.camera.right= 1
	light.shadow.camera.top	=  1
	light.shadow.camera.bottom = -1
	light.shadow.bias	= 0.001
	light.shadow.mapSize.width	= 1024
	light.shadow.mapSize.height	= 1024
    
    scene.add(light);
}

function createControls() {
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function createGUI() {
    gui = new dat.GUI();

    controls = new function (){
        this.pos = {
            x: 0,
            y: 0,
            z: 0
        };

        this.goto = {
            pos: {
                x: 0,
                y: 0,
                z: 0
            },
            go: function(){
                camera.position.x = this.pos.x / config.zoom;
                camera.position.y = this.pos.y / config.zoom;
                camera.position.z = this.pos.z / config.zoom;
            }
        };
        
        this.mark = {
            pos: {
                x: 0,
                y: 0,
                z: 0
            },
            markPosition: function(){
                var geometry = new THREE.SphereGeometry( 1, 32, 32 );
                var material = new THREE.MeshBasicMaterial( {color: 0xfe3939} );
                var sphere = new THREE.Mesh( geometry, material );
                sphere.position.set(this.pos.x / config.zoom, this.pos.y / config.zoom, this.pos.z / config.zoom);
                scene.add( sphere );
            }
        };
    };
    gui.remember(controls);
    
    var ppos = gui.addFolder("Your position");
        ppos.open();
        ppos.add(controls.pos, "x").listen();
        ppos.add(controls.pos, "y").listen();
        ppos.add(controls.pos, "z").listen();

    var pControl = gui.addFolder("Go to");
        pControl.add(controls.goto.pos, "x");
        pControl.add(controls.goto.pos, "y");
        pControl.add(controls.goto.pos, "z");
        pControl.add(controls.goto, "go");
    
    var mark = gui.addFolder("Mark position");
        mark.add(controls.mark.pos, "x");
        mark.add(controls.mark.pos, "y");
        mark.add(controls.mark.pos, "z");
        mark.add(controls.mark, "markPosition");
    
    popup = document.getElementById("poptext");
    
    updateFcts.push(function(){
        controls.pos.x = camera.position.x * config.zoom;
        controls.pos.y = camera.position.y * config.zoom;
        controls.pos.z = camera.position.z * config.zoom; 
    });
}

function processData() {
    planets_obj = new THREE.Object3D();
    asteroids_obj = new THREE.Object3D();

    processPlanets(data.planets);
    processAsteroids(data.asteroids);
    //processCharacters(data.characters);
    scene.add(planets_obj);
    scene.add(asteroids_obj);
}

function processPlanets(planets){
    if(planets === undefined)
        return;
    
    for(var i = 0; i < planets.length; ++i){
        var planet = null;
        switch(planets[i].generator){
            case "EarthLike":
                planet = THREEx.Planets.create("Earth");
                
                var geometry	= new THREE.SphereGeometry(0.95, 32, 32)
                var material	= THREEx.createAtmosphereMaterial()
                material.uniforms.glowColor.value.set(0x00b3ff)
                material.uniforms.coeficient.value	= 0.8
                material.uniforms.power.value		= 2.0
                var mesh	= new THREE.Mesh(geometry, material );
                mesh.scale.multiplyScalar(1.01);
                planet.add(mesh);
                
                var geometry	= new THREE.SphereGeometry(0.95, 32, 32)
                var material	= THREEx.createAtmosphereMaterial()
                material.side	= THREE.BackSide
                material.uniforms.glowColor.value.set(0x00b3ff)
                material.uniforms.coeficient.value	= 0.5
                material.uniforms.power.value		= 4.0
                var mesh	= new THREE.Mesh(geometry, material );
                mesh.scale.multiplyScalar(1.15);
                planet.add(mesh);
                
                updateFcts.push((function(){
                    this.earth = planet;
                    return function(delta, now){
                        earth.traverse(function(child) {
                            if (child.name.search("cloud") !== -1) child.rotation.y += 1/8 * delta;
                        });
                    }
                })()); // Don't be scared of this, it's simple lock
                break;
                
            case "Moon":
            case "OxygenMoon":
                planet = THREEx.Planets.create("Moon");
                break;
                
            case "Mars":
                planet = THREEx.Planets.create("Mars");
                break;
                
            default:
                var arr = ["Mercury", "Venus", "Vesta", 
                           "Ceres", "Jupiter", "Saturn", 
                           "Uranus", "Neptune", "Pluto"];
                var planetNum = Math.round(-0.5 + Math.random() * (arr.length));
                planet = THREEx.Planets.create(arr[planetNum], true); //Generating random planet from the list
                break;
        }
        if(planet === null)
            continue;
        
        planet.position.set(planets[i].pos.x / config.zoom, 
                            planets[i].pos.y / config.zoom,
                            planets[i].pos.z / config.zoom);
        planet.scale.set(config.planetScale * planets[i].radius / config.zoom,
                         config.planetScale * planets[i].radius / config.zoom,
                         config.planetScale * planets[i].radius / config.zoom);
        planet.name = planets[i].type + "-" + i;
        
        planet.receiveShadow = true;
        planet.castShadow = true;
        
        planets_obj.add(planet);
    }
    
    updateFcts.push(function(delta, now){
        planets_obj.traverse(function(child) {
            if (child.name.search("Planet") !== -1) child.rotation.x += 1/64 * delta;
        });
    });
    
}

function processAsteroids(asteroids) {
    var asteroid_model = "gold_asteroid.dae";

    if(asteroids === undefined || asteroids.length == 0)
        return;

    var loader = new THREE.ColladaLoader();
    loader.load(config.models_path + asteroid_model, function(result){
        for (var i = 0; i < asteroids.length; ++i) {
            var ad = result.scene.clone();
            ad.position.set(asteroids[i].pos.x / config.zoom, 
                            asteroids[i].pos.y / config.zoom,
                            asteroids[i].pos.z / config.zoom);
            ad.scale.set(config.asteroid_scale, config.asteroid_scale, config.asteroid_scale);
            ad.name = asteroids[i].name;
            ad.rotation.x = Math.random()*3;
            ad.rotation.y = Math.random()*3;
            ad.rotation.z = Math.random()*3;
            ad.receiveShadow = true;
            ad.castShadow = true;
            ad.traverse(function(obj){
                obj.name = ad.name;
            })
            asteroids_obj.add(ad);
        }
    });
}

function processCharacters(characters) {
    if(characters === undefined || characters.length == 0)
        return;

    for(var i = 0; i < characters.length; ++i){

    }
}

var lastTimeMsec = null;

function renderScene(nowMsec) {
    requestAnimationFrame(renderScene);
    
    lastTimeMsec	= lastTimeMsec || nowMsec-1000/60;
    var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
	lastTimeMsec	= nowMsec;
    
    updateFcts.forEach(function(updateFn){
			updateFn(deltaMsec/1000, nowMsec/1000);
    });
}

function onDocumentMouseDown( event ) {
    //event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    var obj, id;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( planets_obj.children);
    if (intersects.length > 0) {
        id = intersects[0].object.name.split('-')[1];
        obj = data.planets[id];     
    } else if ((intersects = raycaster.intersectObjects(asteroids_obj.children, true)).length > 0){
        id = intersects[0].object.name.split('-')[1];
        obj = data.asteroids[id];
    } else return;
    var x = (+obj.pos.x).toFixed(2), y = (+obj.pos.y).toFixed(2), z = (+obj.pos.z).toFixed(2);
        
    popup.textContent= "GPS:" + obj.name + ":" + x + ":" + y + ":" + z + ":";
}

function onResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = init;