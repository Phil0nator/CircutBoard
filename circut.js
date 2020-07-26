

var gates = [];
var wires = []; //holds pointers to wires also in gates
function setup(){
    background(255);
    createCanvas(document.body.clientWidth,document.body.clientHeight);
    //bg = createGraphics(overall_dim,overall_dim);
    //bg.background(bg_gscale);
    overlay = createGraphics(overall_dim,overall_dim);
    overlay.background(bg_gscale);
    overlay.fill(255);
    textSize(25);
    //overlay.ellipse(5000,5000,50,50);
    for(var i = 0; i < 100; i++){
        gates.push([]);
    }

}


function getMChunk(){
    var indx = int((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
    var indy = int((-translationy/scalar+mouseY/scalar)/(overall_dim/10));
    return gates[indx+indy*10];
}


function draw(){
    background(0);
    stroke(0);
    push();
    translate(translationx,translationy);
    scale(scalar);
    //image(bg,0,0);
    overlay.fill(255,0,0,0);
    //overlay.strokeWeight(25);
    /*
    for(var i = 0 ; i < 10;i++){
        for(var j = 0 ; j < 10;j++){
            overlay.rect(i*overall_dim/10,j*overall_dim/10,overall_dim/10,overall_dim/10);
        }
    }
    */
    
    //overlay.strokeWeight(1);
    image(overlay,0,0);
    

    

    if(fullRedraw){
        overlay.background(bg_gscale);
        console.log("full-redraw was needed");
    }

    for(var gatechunk in gates){
        for(var gate in gates[gatechunk]){
            if(gates[gatechunk][gate]!=undefined)
            gates[gatechunk][gate].update();
        }
    }
    for(var wire in wires){
        if(wires[wire].finalized){
            wires[wire].update();
        }else{
            wires[wire].draw(undefined);
        }
    }
    if(fullRedraw){
        fullRedraw=!fullRedraw;
    }


    pop();
    handleDrag();
    //HUD




    


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
        if(gates[indx+indy*10][g]==undefined){
            continue;
        }
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
                        cursor(HAND);
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
    if(circutInHand==undefined){
        cursor(ARROW);
    }
    nodeInHand = undefined;

}

function placeGate(gate){
    if(gate.isWire){
        gate.place();
        return;
    }
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
        if(circutInHand==undefined){
            return;
        }
        circutInHand.cleanup();
        circutInHand.inpNodes=[];
        circutInHand.outNodes=[];
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
        cursor(ARROW);
    }
}
function mouseReleased(){
    dragog = [];
    if(mouseButton === RIGHT || _mode_ == CursorModes.INTEGRATE){
        return;
    }
    /*
    TODO: Occasional misdetection when circuts are placed on the line between chunks
    */
    if(circutInHand==undefined&&nodeInHand==undefined){
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
                _mode_ = CursorModes.EDIT;
                circutInHand = gates[indx+indy*10][g];
                fullRedraw = true;
                circutInHand.cleanup();
                cursor('grab');
                return;
            }
        }

        for(var wire in wires){
            
            var x1 = wires[wire].nodeA.x;
            var y1 = wires[wire].nodeA.y;
            var x2 = wires[wire].nodeB.x;
            var y2 = wires[wire].nodeB.y;
            var distance = dist(x1,y1,x2,y2);
            var mda = dist(mx,my,x1,y1);
            var mdb = dist(mx,my,x2,y2);
            if(mda+mdb < distance + wire_click_slack){
                _mode_ = CursorModes.EDIT;
                circutInHand = wires[wire];
                fullRedraw = true;
                circutInHand.cleanup();
                cursor('grab');

                return;
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
    if(keyCode == 32){
        if(nodeInHand.gate.isInputPin){
            nodeInHand.value = !nodeInHand.value;
            nodeInHand.gate.value=nodeInHand.value;
            nodeInHand.gate.needsUpdate = true;
            nodeInHand.updateWires();
        }
    }
    if(keyCode == UP_ARROW){
        var inp = new Object();
        inp.delta = -53;
        mouseWheel(inp);
    }else if(keyCode == DOWN_ARROW){
        var inp = new Object();
        inp.delta = +53;
        mouseWheel(inp);
    }
}


function startIntegrationMode(){
    cursor(CROSS);
    _mode_ = CursorModes.INTEGRATE;
}