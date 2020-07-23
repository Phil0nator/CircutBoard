const overall_dim = 10000;
var bg;
var overlay;

var translationx = -overall_dim/2;
var translationy = -overall_dim/2;
var scalar = 1;

var dragog = [];
var dragend = [];

const CursorModes = {
    MOVEMENT: 'mv',
    EDIT: 'edit',
    INTERACT: 'interact'
}

function setup(){
    background(255);
    createCanvas(document.body.clientWidth,document.body.clientHeight);
    bg = createGraphics(overall_dim,overall_dim);
    bg.background(150);
    overlay = createGraphics(overall_dim,overall_dim);
    overlay.background(0,0,0,0);
    overlay.fill(255);
    overlay.ellipse(5000,5000,50,50);

}

function draw(){
    translate(translationx,translationy);
    scale(scalar);
    image(bg,0,0);
    image(overlay,0,0);
    
    handleDrag();
    console.log(translationx,translationy);
}

function mousePressed(){
    dragog = [mouseX,mouseY,translationx-mouseX,translationy-mouseY];
}
function mouseReleased(){
    dragog = [];
}
function mouseWheel(event) {
    scalar-=5/event.delta;
    var d = 5/event.delta;
    translationx+=d*overall_dim/2;
    translationy+=d*overall_dim/2;
}
function handleDrag(){
    if(dragog[0]==undefined){return;}
    translationx=dragog[2]+mouseX;
    translationy=dragog[3]+mouseY;
}