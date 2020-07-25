

var gates = [];
var wires = []; //holds pointers to wires also in gates
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
    overlay.fill(255,0,0,0);
    overlay.strokeWeight(25);

    for(var i = 0 ; i < 10;i++){
        for(var j = 0 ; j < 10;j++){
            overlay.rect(i*overall_dim/10,j*overall_dim/10,overall_dim/10,overall_dim/10);
        }
    }
    overlay.strokeWeight(1);
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
    if(nodeInHand!=undefined)
    text("V: "+nodeInHand.value,0,25);


    if(circutInHand!=undefined){
        var hbox = circutInHand.gethbox();
            fill(50,50,200,100);
            var x = hbox[0]*scalar;
            var y = hbox[1]*scalar;
            var w = hbox[2]*scalar;
            var h = hbox[3]*scalar;
            rect(x,y,w,h);
        if(circutInHand.isWire){
            circutInHand.tx = mouseX/scalar;
            circutInHand.ty = mouseY/scalar;
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
    var indy = int((-translationy/scalar+mouseY/scalar)/(overall_dim/10));
    var mx = (-translationx/scalar+mouseX/scalar);
    var my = (-translationy/scalar+mouseY/scalar);
    for(var g in gates[indx+indy*10]){
        var hbox = gates[indx+indy*10][g].gethbox();
        var x = hbox[0];
        var y = hbox[1];
        var w = hbox[2]/scalar;
        var h = hbox[3]/scalar;
        if(mx>x&&mx<x+hbox[2]&&my>y&&my<y+hbox[3]){
            
            var allnodes = gates[indx+indy*10][g].getNodes();
            for(var i = 0; i < 2;i++){
                for(var node in allnodes[i]){
                    if(dist(mx,my,allnodes[i][node].x,allnodes[i][node].y) < node_r){
                        nodeInHand = allnodes[i][node];
                        nodeInHand.mouseIsOver = true;
                        return;
                    }
                }
            }


        }else{
            
            
        }
    }
    if(nodeInHand!=undefined){
        nodeInHand.mouseIsOver=false;
        nodeInHand.needsUpdate = true;
    }
    nodeInHand = undefined;

}

function placeGate(gate){
    
    var indx = int(gate.x/(overall_dim/10));
    var indy = int(gate.y/(overall_dim/10));
    gates[indx+indy*10].push(gate);
    gate.place();
    for(var wire in wires){
        wires[wire].needsUpdate = true;
    }
    fullRedraw=true;

}
function mousePressed(){

    if(mouseButton === RIGHT){
        circutInHand.cleanup();
        circutInHand = undefined;
        nodeInHand = undefined;
        _mode_ = CursorModes.MOVEMENT;
        fullRedraw=true;
        return;
    }

    dragog = [mouseX,mouseY,translationx-mouseX,translationy-mouseY];
    

    if(circutInHand!=undefined){
        if(circutInHand.isWire == true){

            circutInHand.x2 = -translationx/scalar+mouseX/scalar;
            circutInHand.y2 = -translationy/scalar+mouseY/scalar;
            circutInHand.finalized=true;
            if(nodeInHand!=undefined){
                circutInHand.nodeB = nodeInHand;
                circutInHand.nodeB.wires.push(circutInHand);
            }
            
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
    if(mouseButton === RIGHT){
        return;
    }
    if(circutInHand==undefined&&nodeInHand==undefined){
        var indx = int((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
        var indy = int((-translationy/scalar+mouseY/scalar)/(overall_dim/10));
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        console.log(indx+" : "+indy);
        console.log(gates[indx+indy*10]);
        for(var g in gates[indx+indy*10]){
            var hbox = gates[indx+indy*10][g].gethbox();
            var x = hbox[0];
            var y = hbox[1];
            var w = hbox[2]/scalar;
            var h = hbox[3]/scalar;
            if(mx>x&&mx<x+hbox[2]&&my>y&&my<y+hbox[3]){
                _mode_ = CursorModes.EDIT;
                circutInHand = gates[indx+indy*10][g];
                fullRedraw = true;
                gates[indx+indy*10].slice(g);
            }
        }
    }else if (nodeInHand!=undefined && circutInHand==undefined){
        var nw = new Wire(nodeInHand.x,nodeInHand.y);
        nw.tmpx=mouseX;
        nw.tmpy=mouseY;
        nw.nodeA = nodeInHand;
        nodeInHand.wires.push(nw);
        circutInHand = nw;
        
    }else if (nodeInHand!=undefined && circutInHand!=undefined){
        
    }
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
function mouseWheel(event) {
    if(_mode_ == CursorModes.EDIT){
        return;
    }
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
    if(nodeInHand.gate.isInputPin){
        nodeInHand.value = !nodeInHand.value;
        nodeInHand.gate.value=nodeInHand.value;
        nodeInHand.gate.needsUpdate = true;
        nodeInHand.updateWires();
        console.log(nodeInHand);
    }
}