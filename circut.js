const overall_dim = 10000;
const node_color = [50,100,255];
const bg_gscale = 150;
const node_r = 10;

var bg;
var overlay;

var translationx = -overall_dim/2;
var translationy = -overall_dim/2;
var scalar = 1;

var dragog = [];
var dragend = [];

const CursorModes = {
    MOVEMENT: 'Movement',
    EDIT: 'Edit',
    INTERACT: 'Interact'
}
var _mode_ = CursorModes.MOVEMENT;


var circutInHand = undefined;
var nodeInHand = undefined;

var fullRedraw = false;


class Gate{
    constructor(x,y){
        this.inputs = [];
        this.outputs = [];
        this.value = false;
        this.parents = [];
        this.children = [];
        this.x = x;
        this.y = y;

        this.hboxw = 0;
        this.hboxh = 0;


        this.needsUpdate = true;


    }
    gethbox(){
        var out = new Array(4);
        out[0]=this.x;
        out[1] = this.y;
        out[2] = this.hboxw;
        out[3] = this.hboxh;
        return out;
    }
    passthrough(){}
    getNodes(){

    }
    drawfordrag(){}
    draw(overlay){}

    update(){
        if(this.needsUpdate||fullRedraw){
            this.passthrough();
            this.draw(overlay);
            this.needsUpdate=false;
            for(var child in this.children){
                children[child].needsUpdate = true;
            }
        }
    }

}
const wire_hbox_h = 25;
class Wire extends Gate{

    constructor(x,y){
        super(x,y);
        this.isWire = true;
    }

    finalize(x,y){
        this.x2=x;
        this.y2=y;
        this.finalized=true;
        this.hboxh=abs(this.y-this.y2);
        this.hboxw=abs(this.x-this.x2);
    }

    passthrough(){
        this.outputs[0]=this.inputs[0];
        this.value = this.inputs[0];
    }
    drawfordrag(){
        scale(scalar);

        if(this.finalized != true){
            strokeWeight(5);
            if(this.value){
                stroke(0,255,0);
            }else{
                stroke(255,0,0);
            }
            line(this.tmpx,this.tmpy,mouseX,mouseY);
            fill(node_color);
            circle(this.tmpx,this.tmpy,node_r);
            circle(mouseX,mouseY,node_r);
            strokeWeight(1);
        }
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        if(this.finalized == true){
            strokeWeight(5);
            if(this.value){
                overlay.stroke(0,255,0);
            }else{
                overlay.stroke(255,0,0);
            }
            overlay.line(this.x,this.y,this.x2,this.y2);
            overlay.fill(node_color);
            overlay.circle(this.x,this.y,node_r);
            overlay.circle(this.x2,this.y2,node_r);
            overlay.text(2,this.x2,this.y2);
            strokeWeight(1);
            overlay.stroke(0);
        }
    }

    getNodes(){
        if(this.finalized == true){
            return [this.x,this.y,this.x2,this.y2];
        }else{
            return [this.x,this.y];
        }
    }

}



//TODO:
//Make drag buffer possible



class NotGate extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxh = 60;
        this.hboxw = 60;
    }

    passthrough(){

        if(this.parents[0] != undefined){
            if(this.parents[0].outputs[0]!=undefined)
            this.inputs[0] = this.parents[0].outputs[0];
        }
        this.outputs[0]=!this.inputs[0];

    }

    drawfordrag(){
        scale(scalar);

        fill(255);
        triangle(this.x,this.y,this.x,this.y+50,this.x+50,this.y+25);
        fill(node_color)
        circle(this.x,this.y+25,node_r);
        circle(this.x+50,this.y+25,node_r);
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.triangle(this.x,this.y,this.x,this.y+50,this.x+50,this.y+25);
        overlay.fill(node_color)
        overlay.circle(this.x,this.y+25,node_r);
        overlay.circle(this.x+50,this.y+25,node_r);

    }
    getNodes(){
        return [this.x,this.y+25,this.x+50,this.y+25];
    }

}
const OrGatew = 100;
class OrGate extends Gate{


    constructor(x,y){
        super(x,y);
        this.hboxh = 60;
        this.hboxw = OrGatew;
    }

    passthrough(){
        if(this.parents[0] != undefined){
            if(this.parents[0].outputs[0]!=undefined)
            this.inputs[0] = this.parents[0].outputs[0];
        }
        if(this.parents[1] != undefined){
            if(this.parents[1].outputs[1]!=undefined)
            this.inputs[1] = this.parents[1].outputs[0];
        }

        this.outputs[0] = this.inputs[0] || this.inputs[1];

    }
    gethbox(){
        var out = new Array(4);
        out[0]=this.x;
        out[1] = this.y-25;
        out[2] = this.hboxw;
        out[3] = this.hboxh;
        return out;
    }
    drawfordrag(){
        scale(scalar);
        fill(255);
        arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, OPEN);
        fill(bg_gscale)
        arc(this.x,this.y,OrGatew/3,50,-HALF_PI,HALF_PI);
        fill(node_color);
        circle(this.x+10,this.y-15,node_r);
        circle(this.x+10,this.y+15,node_r);
        circle(this.x+OrGatew/2,this.y,node_r);
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, OPEN);
        overlay.fill(bg_gscale)
        overlay.arc(this.x,this.y,OrGatew/3,50,-HALF_PI,HALF_PI);
        overlay.fill(node_color);
        overlay.circle(this.x+10,this.y-15,node_r);
        overlay.circle(this.x+10,this.y+15,node_r);
        overlay.circle(this.x+OrGatew/2,this.y,node_r);
    }

    getNodes(){
        return [this.x+10,this.y-15,this.x+10,this.y+15,this.x+OrGatew/2,this.y];
    }

}

class AndGate extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxw = OrGatew;
        this.hboxh = 60;
    }

    passthrough(){
        if(this.parents[0] != undefined){
            if(this.parents[0].outputs[0]!=undefined)
            this.inputs[0] = this.parents[0].outputs[0];
        }
        if(this.parents[1] != undefined){
            if(this.parents[1].outputs[1]!=undefined)
            this.inputs[1] = this.parents[1].outputs[0];
        }

        this.outputs[0] = this.inputs[0] && this.inputs[1];

    }
    gethbox(){
        var out = new Array(4);
        out[0]=this.x;
        out[1] = this.y-25;
        out[2] = this.hboxw;
        out[3] = this.hboxh;
        return out;
    }
    drawfordrag(){
        scale(scalar);
        fill(255);
        arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, CHORD);

        fill(node_color);
        circle(this.x,this.y-15,node_r);
        circle(this.x,this.y+15,node_r);
        circle(this.x+OrGatew/2,this.y,node_r);
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, CHORD);

        overlay.fill(node_color);
        overlay.circle(this.x,this.y-15,node_r);
        overlay.circle(this.x,this.y+15,node_r);
        overlay.circle(this.x+OrGatew/2,this.y,node_r);
    }

    getNodes(){
        return [this.x,this.y-15,this.x,this.y+15,this.x+OrGatew/2,this.y];
    }

}

class XORGate extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxw = OrGatew;
        this.hboxh = 60;
    }

    passthrough(){
        if(this.parents[0] != undefined){
            if(this.parents[0].outputs[0]!=undefined)
            this.inputs[0] = this.parents[0].outputs[0];
        }
        if(this.parents[1] != undefined){
            if(this.parents[1].outputs[1]!=undefined)
            this.inputs[1] = this.parents[1].outputs[0];
        }

        this.outputs[0] = this.inputs[0] ^ this.inputs[1];

    }
    gethbox(){
        var out = new Array(4);
        out[0]=this.x;
        out[1] = this.y-25;
        out[2] = this.hboxw;
        out[3] = this.hboxh;
        return out;
    }
    drawfordrag(){
        scale(scalar);
        fill(255);
        arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, OPEN);
        fill(bg_gscale)
        arc(this.x,this.y,OrGatew/3,50,-HALF_PI,HALF_PI);

        arc(this.x-10,this.y,OrGatew/3,50,-HALF_PI,HALF_PI)


        fill(node_color);
        circle(this.x+10,this.y-15,node_r);
        circle(this.x+10,this.y+15,node_r);
        circle(this.x+OrGatew/2,this.y,node_r);
    }


    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, OPEN);
        overlay.fill(bg_gscale)
        overlay.arc(this.x,this.y,OrGatew/3,50,-HALF_PI,HALF_PI);

        overlay.arc(this.x-10,this.y,OrGatew/3,50,-HALF_PI,HALF_PI)


        overlay.fill(node_color);
        overlay.circle(this.x+10,this.y-15,node_r);
        overlay.circle(this.x+10,this.y+15,node_r);
        overlay.circle(this.x+OrGatew/2,this.y,node_r);
    }

    getNodes(){
        return [this.x+10,this.y-15,this.x+10,this.y+15,this.x+OrGatew/2,this.y];
    }

}
class PIN extends Gate{
    constructor(x,y){
        super(x,y);
        this.hboxw = node_r*2;
        this.hboxh = node_r*2;
    }

    passthrough(){
        this.outputs[0] = this.value;
        for(var child in this.children){
            this.children[child].needsUpdate = true;
        }
    }
    gethbox(){
        var out = new Array(4);
        out[0]=this.x;
        out[1] = this.y;
        out[2] = this.hboxw;
        out[3] = this.hboxh;
        return out;
    }

    drawfordrag(){
        scale(scalar);

        if(this.value){
            fill(0,255,0);

        }else{
            fill(255,0,0)
        }
        circle(this.x+10,this.y+10,node_r*2);
        fill(node_color);
        circle(this.x+10,this.y+10,node_r);
    }


    draw(overlay){

        if(overlay == undefined){
            this.drawfordrag();
            return;
        }

        if(this.value){
            overlay.fill(0,255,0);

        }else{
            overlay.fill(255,0,0)
        }
        overlay.circle(this.x+10,this.y+10,node_r*2);
        overlay.fill(node_color);
        overlay.circle(this.x+10,this.y+10,node_r);
    }

    getNodes(){
        return [this.x+10,this.y+10];
    }

}
class LED extends Gate{
    constructor(x,y){
        super(x,y);
        this.hboxw = node_r*2;
        this.hboxh = node_r*2;
    }

    passthrough(){
        this.value = this.inputs[0];
    }

    drawfordrag(){
        scale(scalar);

        if(this.value){
            fill(0,255,0);

        }else{
            fill(255,0,0)
        }
        circle(this.x+10,this.y+10,node_r*2);
        fill(node_color);
        circle(this.x+10,this.y+10,node_r);
    }


    draw(overlay){

        if(overlay == undefined){
            this.drawfordrag();
            return;
        }

        if(this.value){
            overlay.fill(0,255,0);

        }else{
            overlay.fill(255,0,0)
        }
        overlay.circle(this.x+10,this.y+10,node_r*2);
        overlay.fill(node_color);
        overlay.circle(this.x+10,this.y+10,node_r);
    }

    getNodes(){
        return [this.x+10,this.y+10];
    }
}






var gates = [];

function setup(){
    background(255);
    createCanvas(document.body.clientWidth,document.body.clientHeight);
    bg = createGraphics(overall_dim,overall_dim);
    bg.background(bg_gscale);
    overlay = createGraphics(overall_dim,overall_dim);
    overlay.background(0,0,0,0);
    overlay.fill(255);
    textSize(25);
    //overlay.ellipse(5000,5000,50,50);
    for(var i = 0; i < overall_dim/100; i++){
        gates.push([]);
    }
}

function draw(){
    background(0);
    stroke(0);
    push();
    translate(translationx,translationy);
    scale(scalar);
    image(bg,0,0);
    image(overlay,0,0);
    
    if(fullRedraw){
        overlay.background(bg_gscale);
    }

    for(var gatechunk in gates){
        for(var gate in gates[gatechunk]){
            gates[gatechunk][gate].update();
        }
    }
    if(fullRedraw){
        fullRedraw=!fullRedraw;
    }


    pop();
    handleDrag();
    //HUD


    fill(0);
    text("Mode: "+_mode_,0,25);
    text("Gates: "+gates.length,0,50);

    if(circutInHand!=undefined){
        var hbox = circutInHand.gethbox();
            fill(50,50,200,100);
            var x = hbox[0]*scalar;
            var y = hbox[1]*scalar;
            var w = hbox[2]*scalar;
            var h = hbox[3]*scalar;
            rect(x,y,w,h);
        if(circutInHand.isWire){
            circutInHand.x = mouseX/scalar;
            circutInHand.y = mouseY/scalar;
        }else{
            if(circutInHand.origined == undefined){
                circutInHand.x = mouseX/scalar;
            circutInHand.y = mouseY/scalar;
            }
        }
        circutInHand.draw(undefined);
    }

    handleMouseOverNodes();


}

function handleMouseOverNodes(){

    
    var indx = int((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
    var indy = int((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
    var mx = (-translationx/scalar+mouseX/scalar);
    var my = (-translationy/scalar+mouseY/scalar);
    for(var g in gates[indx+indy*10]){
        var hbox = gates[indx+indy*10][g].gethbox();
        var x = hbox[0];
        var y = hbox[1];
        var w = hbox[2]/scalar;
        var h = hbox[3]/scalar;
        if(mx>x&&mx<x+hbox[2]&&my>y&&my<y+hbox[3]){
            var nodes = gates[indx+indy*10][g].getNodes();
            for(var i = 0 ; i < nodes.length;i+=2){
                if(dist(mx,my,nodes[i],nodes[i+1]) < node_r){
                    fill(255);
                    circle(mouseX,mouseY,node_r*1.5*scalar);
                    nodeInHand = gates[indx+indy*10][g];
                    return;
                }
            }
        }
    }
    nodeInHand = undefined;

}

function placeGate(gate){
    
    var indx = int(gate.x/(overall_dim/10));
    var indy = int(gate.y/(overall_dim/10));
    console.log(gates);
    gates[indx+indy*10].push(gate);

}
function mousePressed(){
    dragog = [mouseX,mouseY,translationx-mouseX,translationy-mouseY];
    

    if(circutInHand!=undefined){
        if(circutInHand.isWire == true){

            circutInHand.x2 = -translationx/scalar+mouseX/scalar;
            circutInHand.y2 = -translationy/scalar+mouseY/scalar;
            circutInHand.finalized=true;
            
        }else{
            circutInHand.x = -translationx/scalar+mouseX/scalar;
            circutInHand.y = -translationy/scalar+mouseY/scalar;
        }
        circutInHand.needsUpdate = true;
        
        placeGate(circutInHand);
        _mode_ = CursorModes.MOVEMENT;
        circutInHand = undefined;
    }
}
function mouseReleased(){
    dragog = [];
    if(circutInHand==undefined&&nodeInHand==undefined){
        var indx = int((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
        var indy = int((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        console.log("IDX: "+indx);
        for(var g in gates[indx+indy*10]){
            var hbox = gates[indx+indy*10][g].gethbox();
            var x = hbox[0];
            var y = hbox[1];
            var w = hbox[2]/scalar;
            var h = hbox[3]/scalar;
            if(mx>x&&mx<x+hbox[2]&&my>y&&my<y+hbox[3]){
                console.log("collisoin");
                _mode_ = CursorModes.EDIT;
                circutInHand = gates[indx+indy*10][g];
                fullRedraw = true;
                delete gates[indx+indy*10][g];
            }
        }
    }else if (nodeInHand!=undefined && circutInHand==undefined){
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        var nw = new Wire(mx,my);
        nw.tmpx=mouseX;
        nw.tmpy=mouseY;
        circutInHand = nw;
        
    }else if (nodeInHand!=undefined && circutInHand!=undefined){
        
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function mouseWheel(event) {
    scalar-=5/event.delta;
    if(scalar >= 0){
        var d = 5/event.delta;
        translationx+=d*overall_dim/2;
        translationy+=d*overall_dim/2;
    }else{
        scalar+=5/event.delta
        }
}
function handleDrag(){
    if(dragog[0]==undefined||_mode_!=CursorModes.MOVEMENT){return;}
    translationx=dragog[2]+mouseX;
    translationy=dragog[3]+mouseY;
}

function handleEdit(){

}


function keyPressed(){
    
}