/*
- Fix weird wire nonsense
- Fix collision holes
- Fix selection area problems



*/

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

    setInterval(handleTimedEvents,100);

    //html related:
    loadICUIElements();

    document.getElementById("input-upload").addEventListener("change",function(){loadFromSave(this.files[0]);});


    
}


function getMChunk(){
    var indx = round((-translationx/scalar+mouseX/scalar)/(overall_dim/10));
    var indy = round((-translationy/scalar+mouseY/scalar)/(overall_dim/10));
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
    
    

    
    try{ //anti-hang
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

        if(_mode_ == CursorModes.INTEGRATE){
            drawIntegrationArea();

        }

        handleMouseOverNodes();
    }catch(error){

        UIkit.notification({message: error, status:"danger"});

    }

}

























function handleMouseOverNodes(){

    
    var indx = round((-translationx/scalar+mouseX/scalar-(overall_dim/20))/(overall_dim/10));
    var indy = round((-translationy/scalar+mouseY/scalar-(overall_dim/20))/(overall_dim/10));
    var mx = (-translationx/scalar+mouseX/scalar);
    var my = (-translationy/scalar+mouseY/scalar);

    
    //overlay.fill(100,100,255,100);
    //overlay.rect(indx*(overall_dim/10),indy*(overall_dim/10),overall_dim/10,overall_dim/10);


    for(var g in gates[indx+indy*10]){
        if(gates[indx+indy*10][g]==undefined){
            continue;
        }
        var hbox = gates[indx+indy*10][g].gethbox();
        var x = hbox[0];
        var y = hbox[1];
        x-=10;
        y-=10;
        var w = hbox[2];
        var h = hbox[3];
        w+=10;
        h+=10;
        if(mx>x&&mx<x+w&&my>y&&my<y+h){
            
            var allnodes = gates[indx+indy*10][g].getNodes();
            for(var i = 0; i < 2;i++){
                for(var node in allnodes[i]){
                    if(dist(mx,my,allnodes[i][node].x,allnodes[i][node].y) < node_r){
                        nodeInHand = allnodes[i][node];
                        nodeInHand.mouseIsOver = true;
                        cursor(HAND);
                        return;
                    }else{
                        allnodes[i][node].mouseIsOver=false;
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
    if(circutInHand==undefined && _mode_ != CursorModes.INTEGRATE){
        cursor(ARROW);
    }
    nodeInHand = undefined;

}






function handleTimedEvents(){

    if(justPlacedWire&&Date.now()-lastWirePlace>100){
        justPlacedWire=false;
        lastWirePlace = Date.now();
    }



}















function placeGate(gate){
    if(gate.isWire){
        gate.place();
        lastWirePlace = Date.now();
        justPlacedWire = true;
        return;
    }
    var indx = round((-translationx/scalar+mouseX/scalar-(overall_dim/20))/(overall_dim/10));
    var indy = round((-translationy/scalar+mouseY/scalar-(overall_dim/20))/(overall_dim/10));
    var mx = (-translationx/scalar+mouseX/scalar);
    var my = (-translationy/scalar+mouseY/scalar);
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
    









    if(_mode_ == CursorModes.INTEGRATE){
        return;
    }










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






function wireNodeConnectionTest(wire, x,y, useNodeA){
    x=int(x);
    y=int(y);
    return ((dist(wire.nodeA.x,wire.nodeA.y,x,y)<=15&&useNodeA) || (dist(wire.nodeB.x,wire.nodeB.y,x,y)<=15&&!useNodeA));

}

function constructCircut(){



    var sx = -translationx/scalar+integrationArea[0]/scalar;
    var sy = -translationy/scalar+integrationArea[1]/scalar;
    integrationArea[2] = -translationx/scalar+integrationArea[2]/scalar;
    integrationArea[3] = -translationx/scalar+integrationArea[3]/scalar;


    if(integrationArea[2] < sx){
        var t = sx;
        sx = integrationArea[2];
        integrationArea[2]=t;
    }
    if(integrationArea[3] < sy){
        var t = sy;
        sy = integrationArea[3];
        integrationArea[3] = t;
    }
    //overlay.rect(sx,sy,integrationArea[2]-sx,integrationArea[3]-sy);
    //overlay.ellipse(sx,sy,20,20);

    var newCircut = new IntegratedCircut();
    
    //integrationArea = new Array(4);
    for(var chunk in gates){
        for (var g in gates[chunk]){
            var gate = gates[chunk][g];
            if(gate.x>sx&&gate.x<integrationArea[2]&&gate.y>sy&&gate.y<integrationArea[3]&&gate.isWire!=true){
                if(gate.isInputPin){
                    newCircut.i.push(gate.outNodes[0]);
                }else if(gate.isLEDOut){
                    newCircut.o.push(gate.inpNodes[0]);
                }else{
                    newCircut.gates.push(gate);
                }
            }
        }
    }
    for(var w in wires){
        newCircut.wires.push(wires[w]);
    }

    newCircut.generateInstructions();
    if(newCircut.gates.length<=0){
        return;
    }
    workingIntegrationCircut = newCircut;
    createNewCircutModal();
    integrationArea = new Array(4);
    _mode_ = CursorModes.MOVEMENT;





}




















function mouseReleased(){
    dragog = [];
    if(mouseButton === RIGHT){
        return;
    }
    if(_mode_ == CursorModes.INTEGRATE){
        _mode_ == CursorModes.MOVEMENT;

        constructCircut();



    }
    /*
    TODO: Occasional misdetection when circuts are placed on the line between chunks
    */
    if(circutInHand==undefined&&nodeInHand==undefined&&!justPlacedWire){
        var indx = round((-translationx/scalar+mouseX/scalar-(overall_dim/20))/(overall_dim/10));
        var indy = round((-translationy/scalar+mouseY/scalar-(overall_dim/20))/(overall_dim/10));
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
    resizeCanvas(document.body.clientWidth, document.body.clientHeight);
}
function mouseWheel(event) {
    if(_mode_ == CursorModes.EDIT||_mode_ == CursorModes.INMODAL){
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
    if(dragog[0]==undefined||_mode_==CursorModes.EDIT){return;}
    if(_mode_ == CursorModes.MOVEMENT){
        translationx=dragog[2]+mouseX;
        translationy=dragog[3]+mouseY;
    }else if (_mode_ == CursorModes.INTEGRATE){
        integrationArea[0] = dragog[0];
        integrationArea[1] = dragog[1];
        integrationArea[2] = mouseX;
        integrationArea[3] = mouseY;
    }
}

function drawIntegrationArea(){
    if(dragog[0]==undefined)return;
    fill(100,100,255,100);
    stroke(100,100,255);
    rect(dragog[0],dragog[1],mouseX-dragog[0],mouseY-dragog[1]);

}


function handleEdit(){

}


function keyPressed(){
    if(keyCode == 32){
        try{
            if(nodeInHand.gate.isInputPin){
                nodeInHand.value = !nodeInHand.value;
                nodeInHand.gate.value=nodeInHand.value;
                nodeInHand.gate.needsUpdate = true;
                nodeInHand.updateWires();
            }
        }catch(e){

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




    if(shiftDown && keyCode == 73){// i
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        placeGate(new PIN(mx,my));

    }else if (shiftDown && keyCode == 79){
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        placeGate(new LED(mx,my));
    }



    if(keyCode == SHIFT){
        shiftDown=true;
    }
}


function keyReleased(){
    if(keyCode==SHIFT){
        shiftDown=false;
    }
}

function startIntegrationMode(){
    var gatecount = 0;
    for(var gate in gates){
        for(var g in gates[gate]){
            gatecount++;
        }
    }
    if(gatecount == 0){
        UIkit.notification({message: 'You must create a circut before integrating.', status:"danger"});
        return;

    }
    cursor(CROSS);
    if(_mode_ != CursorModes.INTEGRATE){
        _mode_ = CursorModes.INTEGRATE;
    }else{
        _mode_ = CursorModes.MOVEMENT;
    }
}