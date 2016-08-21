var data = {};

function loadData(name) {
    name = name || "SANDBOX_0_0_0_.sbs";
    var xmlDoc = loadXMLDoc(config.maps_path + name);
    if (xmlDoc === null)
        return;

    var planets = [], asteroids = [], characters = [];
    var entityBase = xmlDoc.getElementsByTagName("MyObjectBuilder_EntityBase");
    for (var i = 0; i < entityBase.length; ++i){
        var obj = {
            name: "",
            type: "",
            pos: {
                x: 0,
                y: 0,
                z: 0
            },
        };

        var pos = entityBase[i].getElementsByTagName("Position");
        obj.pos.x = pos[0].getAttribute("x");
        obj.pos.y = pos[0].getAttribute("y");
        obj.pos.z = pos[0].getAttribute("z");

        obj.public_name = getValueByTag("StorageName");

        switch (entityBase[i].getAttribute("xsi:type")){
            case "MyObjectBuilder_Planet":
                obj.type = "Planet";
                obj.name = obj.type + "-" + planets.length;
                obj.generator = getValueByTag("PlanetGenerator");
                obj.radius = getValueByTag("Radius");
                obj.atmosphere = getValueByTag("HasAtmosphere");
                if(obj.atmosphere == true)
                    obj.aRadius = getValueByTag("AtmosphereRadius");
                obj.gravity_mod = getValueByTag("GravityFalloff");
                obj.surface_gravity = getValueByTag("SurfaceGravity");
                planets.push(obj);
                break;

            case "MyObjectBuilder_VoxelMap":
                obj.type = "Asteroid";
                obj.name = obj.type + "-" + asteroids.length;
                asteroids.push(obj);
                break;

            case "MyObjectBuilder_Character":
                obj.type = "Character";
                characters.push(obj);
                break;

            default:
                continue;
        }

        function getValueByTag(tag){
            var element = entityBase[i].getElementsByTagName(tag)[0];
            if(!element)
                return null;
            return element.childNodes[0].nodeValue;
        }
    }
    data.planets = planets;
    data.asteroids = asteroids;
    data.characters = characters;
}

function loadXMLDoc(dname)
{
    var xhttp;
    if (window.XMLHttpRequest)
        xhttp = new XMLHttpRequest();
    else
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    xhttp.open("GET", dname, false);
    xhttp.send();
    return xhttp.responseXML;
}