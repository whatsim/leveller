var context = world.getContext('2d')

var zoom = 2;

var platformSprite = new Image()
platformSprite.src = 'platform_16x16.png'

platformSprite.addEventListener('mouseup',function(e){
	tileToPaint = Math.floor(e.clientY / 16)
})
platformSprite.id = "palette"
document.body.appendChild(platformSprite)

var tileToPaint = 3;

var rightMask = 0b11110000
var leftMask = 0b00001111

var worldSettings = {
	width : 32,
	height : 16
}
var worldArray = []

var canvasOrigin = {
	x:0,
	y:0
}

for(var x = 0; x < worldSettings.width / 2; x++){
	for(var y = 0; y < worldSettings.height; y++){
		worldArray[x + y * worldSettings.width / 2] = 0
	}
}

world.addEventListener('mousedown',mouseDown)
world.addEventListener('mousemove',mouseMove)
world.addEventListener('mouseup',mouseUp)
document.addEventListener('keyup',handleKeys)

var mouseIsDown = false

var downPos = {
	x:0,
	y:0
}
function mouseDown(e){
	mouseIsDown = true
	downPos.x = e.clientX
	downPos.y = e.clientY
	if(!e.metaKey) {
		paintTile(e)
	} else {
		panCanvas(e)
	}
}	
function mouseMove(e){
	if(mouseIsDown){

			paintTile(e)
	}
}	
function mouseUp(e){
	mouseIsDown = false
}	

function handleKeys(e){
	e.preventDefault()
	e.stopPropagation()
	if(e.keyCode >= 37 && e.keyCode <= 40) panCanvas(e)
	if(e.keyCode >= 49 && e.keyCode <= 57) zoom = (e.keyCode - 48) / 2
	return false
}

function panCanvas(e){
	var x = e.keyCode == 37 ? 1 : e.keyCode == 39 ? -1 : 0
	var y = e.keyCode == 38 ? 1 : e.keyCode == 40 ? -1 : 0
	var mul = e.altKey ? 10 : 1
	canvasOrigin.x += x * mul
	canvasOrigin.y += y * mul
	
}


function paintTile(e){
	var x = Math.floor((e.clientX) / 16 / zoom) - canvasOrigin.x;
	var y = Math.floor((e.shiftKey ? downPos.y : e.clientY) / 16 / zoom) - canvasOrigin.y;
	var tileId = worldArray[Math.floor(x/2) + y * worldSettings.width/2]
	if(x % 2 == 0) {
		tileId = (rightMask | tileToPaint) & (tileId | leftMask)
	} else {
		tileId = (leftMask | (tileToPaint << 4)) & (tileId | rightMask)
	}
	worldArray[Math.floor(x/2) + y * worldSettings.width/2] = tileId
}


window.requestAnimationFrame(drawCanvas)

function drawCanvas(){
	world.width = window.innerWidth / zoom;
	world.height = window.innerHeight / zoom;
	for(var x = 0; x < worldSettings.width; x++){
		for(var y = 0; y < worldSettings.height; y++){
			var x8 = Math.floor(x / 2);
    		var tileId = worldArray[x8 + y * worldSettings.width/2];
    		if(x % 2 == 1) tileId = tileId >> 4;
    		tileId &= 15
			context.drawImage(platformSprite,0,tileId*16,16,16,canvasOrigin.x*16 + x*16,canvasOrigin.y*16 + y*16,16,16)
		}
	}
	context.strokeStyle = "white"
	context.strokeRect(canvasOrigin.x * 16,canvasOrigin.y * 16,worldSettings.width * 16, worldSettings.height * 16)
	window.requestAnimationFrame(drawCanvas)
}

function printLevel(){
	var array = []
	array.push(worldSettings.width)
	array.push(worldSettings.height)
	array = array.concat(worldArray)
	console.log(JSON.stringify(array))
}