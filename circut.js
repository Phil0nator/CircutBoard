/*
- Fix weird wire nonsense
- Fix collision holes
- Fix selection area problems



*/

var gates = []; //2D array of chunks (flat)
var wires = []; //1D array of wires

function setup(){
    background(255);
    createCanvas(document.body.clientWidth,document.body.clientHeight);
    //bg = createGraphics(overall_dim,overall_dim);
    //bg.background(bg_gscale);
    overlay = createGraphics(overall_dim,overall_dim);
    overlay.background(bg_gscale);
    overlay.fill(bg_gscale)
    for(let x = 0; x < overall_dim/100;x++){
        for(let y =0; y < overall_dim/100; y++){
            overlay.circle(x*100,y*100,7);
        }
    }
    overlay.fill(255);
    
    textSize(25);
    
    //overlay.ellipse(5000,5000,50,50);
    for(var i = 0; i < 100; i++){
        gates.push([]);
    }

    setInterval(handleTimedEvents,100);

    //html related:
    loadICUIElements();
    contextmenu = document.getElementById("contextmenu");
    contextmenu.onmouseover = function(){this.isMouseOver=true;};
    contextmenu.onmouseleave = function() {this.isMouseOver=false;};


    placeablesmenu = document.getElementById("offcanvas-flip");
    placeablesmenu.onmouseover = function(){this.isMouseOver=true;};
    placeablesmenu.onmouseleave = function(){this.isMouseOver=false;};


    document.getElementById("input-upload").addEventListener("change",function(){loadFromSave(this.files[0]);});


    
}

/**
 * @return the chunk of gates that the mouse is currenly over.
 */
function getMChunk(){
    var indx = round((-translationx/scalar+mouseX/scalar-(overall_dim/20))/(overall_dim/10));
    var indy = round((-translationy/scalar+mouseY/scalar-(overall_dim/20))/(overall_dim/10));
    let indexA = indx+indy*10;
    if(indexA > 99 || indexA < 0)return [];
    let out = gates[indexA];
    for(let i = -1; i < 2;i++){

        for(let j = -1; j < 2; j++){
            let index = indx+i+(indy+j)*10;
            if(index < 100 && index > -1){
                out = out.concat(gates[index]);
            }
            
        }

    }
    return out;
}
function getChunk(x,y){
    var indx = round(x/(overall_dim/10));
    var indy = round(y/(overall_dim/10));
    let indexA = indx+indy*10;
    if(indexA > 99 || indexA < 0)return [];
    let out = gates[indexA];
    for(let i = -1; i < 2;i++){

        for(let j = -1; j < 2; j++){
            let index = indx+i+(indy+j)*10;
            if(index < 100 && index > -1){
                out = out.concat(gates[index]);
            }
            
        }

    }
    return out;
}
function getGlobalMCoords(){
    return [-translationx/scalar+mouseX/scalar,-translationy/scalar+mouseY/scalar];
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
            for(let x = 0; x < overall_dim/100;x++){
                for(let y =0; y < overall_dim/100; y++){
                    overlay.circle(x*100,y*100,7);
                }
            }
            console.log("full-redraw was needed");
        }

        for(let gatechunk in gates){
            for(let gate in gates[gatechunk]){
                if(gates[gatechunk][gate]!=undefined)
                gates[gatechunk][gate].update();
            }
        }
        
        for(let wire in wires){
            if(wires[wire].finalized){
                wires[wire].update();
            }else{
                //wires[wire].draw(undefined);
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

        if(_mode_ == CursorModes.INTEGRATE || _mode_ == CursorModes.COPYSELECT || _mode_ == CursorModes.CUTSELECT){
            drawIntegrationArea();

        }

        handleMouseOverNodes();
    }catch(error){

        //UIkit.notification({message: error, status:"danger"});
        generalErrorMessage(error);
    }

}























/**
 * Determine what node the mouse is over
 */

function handleMouseOverNodes(){


    var mx = (-translationx/scalar+mouseX/scalar);
    var my = (-translationy/scalar+mouseY/scalar);
    
    //overlay.fill(100,100,255,100);
    //overlay.rect(indx*(overall_dim/10),indy*(overall_dim/10),overall_dim/10,overall_dim/10);
    var currentChunk = getMChunk();

    for(var g in currentChunk){
        if(currentChunk[g]==undefined){
            continue;
        }
        var hbox = currentChunk[g].gethbox();
        var x = hbox[0];
        var y = hbox[1];
        x-=10;
        y-=10;
        var w = hbox[2];
        var h = hbox[3];
        w+=10;
        h+=10;
        if(mx>x&&mx<x+w&&my>y&&my<y+h){
            
            var allnodes = currentChunk[g].getNodes();
            for(var i = 0; i < 2;i++){
                for(var node in allnodes[i]){
                    if(dist(mx,my,allnodes[i][node].x,allnodes[i][node].y) < node_r&& _mode_ != CursorModes.INTEGRATE && _mode_ != CursorModes.COPYSELECT && _mode_ != CursorModes.CUTSELECT){
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
    if(circutInHand==undefined && _mode_ != CursorModes.INTEGRATE && _mode_ != CursorModes.COPYSELECT && _mode_ != CursorModes.CUTSELECT){
        cursor(ARROW);
    }
    nodeInHand = undefined;

}






function handleTimedEvents(){

    if(justPlacedWire&&Date.now()-lastWirePlace>500){
        justPlacedWire=false;
        //lastWirePlace = Date.now();
    }



}














/**
 * Put down a gate correctly on the workplane
 * @param {Gate} gate 
 */
function placeGate(gate){
    if(gate.isWire){
        if(gate.nodeB==undefined){
            circutInHand.cleanup();
            circutInHand=undefined;
            return;
        }
        gate.place();
        lastWirePlace = Date.now();
        justPlacedWire = true;
        return;
    }
    var indx = round((-translationx/scalar+mouseX/scalar-(overall_dim/20))/(overall_dim/10));
    var indy = round((-translationy/scalar+mouseY/scalar-(overall_dim/20))/(overall_dim/10));
    
    gates[indx+indy*10].push(gate);
    gate.indx=indx;
    gate.indy=indy;
    gate.place();
    for(var wire in wires){
        wires[wire].needsUpdate = true;
        
    }

    if(closed_placeables_forplace){
        closed_placeables_forplace=false;
        UIkit.offcanvas(placeablesmenu).show();
    }
    

    fullRedraw=true;
    

}











/**
 * Contains placement algorithm
 */

function mousePressed(){
    
    if(mouseButton === RIGHT){
        
    }

    if(placeablesmenu.isMouseOver){
        return;
    }
    

    if(shiftDown && mouseButton === LEFT){// i
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        placeGate(new PIN(mx,my));

    }else if (shiftDown && mouseButton === RIGHT){//o
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        placeGate(new LED(mx,my));
    }
    if(!contextmenu.hidden){
        if(!contextmenu.isMouseOver){
            closeContextMenu();
        }
    }











    dragog = [mouseX,mouseY,translationx-mouseX,translationy-mouseY];
    









    if(_mode_ == CursorModes.INTEGRATE || _mode_ ==CursorModes.COPYSELECT){
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





/**
 * 
 * @param {Wire} wire the wire in question
 * @param {int} x x coordinate of the node
 * @param {int} y y coordinate of the node 
 * @param {Boolean} useNodeA nodeA or nodeB of the wire 
 */
function wireNodeConnectionTest(wire, x,y, useNodeA){
    x=int(x);
    y=int(y);
    return ((dist(wire.nodeA.x,wire.nodeA.y,x,y)<=15&&useNodeA) || (dist(wire.nodeB.x,wire.nodeB.y,x,y)<=15&&!useNodeA));

}
/**
 * Build a new IntegratedCircut based on a selection area
 */
function constructCircut(){

    _mode_ = CursorModes.MOVEMENT;

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
    var sw = integrationArea[2]-sx;
    var sh = integrationArea[3]-sy;
    
    
    





    overlay.rect(sx,sy,sw,sh);
    overlay.ellipse(sx,sy,20,20);
    //overlay.ellipse(integrationArea[2],integrationArea[3],20,20);

    var newCircut = new IntegratedCircut();
    
    //integrationArea = new Array(4);
    for(var chunk in gates){
        for (var g in gates[chunk]){
            var gate = gates[chunk][g];
            if(gate.x>sx&&gate.x<sw+sx&&gate.y>sy&&gate.y<sy+sh){
                if(gate.isInputPin || gate.isbuspin){
                    newCircut.i.push(gate.outNodes[0]);
                }else if(gate.isLEDOut || gate.isbusout){
                    newCircut.o.push(gate.inpNodes[0]);
                }else{
                    newCircut.gates.push(gate);
                }
            }else{
                
            }
        }
    }
    for(var w in wires){
        newCircut.wires.push(wires[w]);
    }

    newCircut.generateInstructions();
    if(newCircut.gates.length<=0){
        _mode_ = CursorModes.MOVEMENT;
        return;
    }
    workingIntegrationCircut = newCircut;
    createNewCircutModal();
    integrationArea = new Array(4);
    _mode_ = CursorModes.MOVEMENT;





}











function setClipboard(value){
    clipboard=value;
}

function copySelection(){

    createSaveFile(integrationArea).then(setClipboard);
    _mode_ = CursorModes.MOVEMENT;
    //UIkit.notification({message: "Gates copied to clipboard", status:"success"})
    successMessage("Gates copied to clipboard. ");

}

function paste(){
    console.log(clipboard);
    createStateFromFile(clipboard,true);
}


function deleteCircut(){
    var mx = parseInt(contextmenu.style.left);
    var my = parseInt(contextmenu.style.top);
    mx = (-translationx/scalar+mx/scalar);
    my = (-translationy/scalar+my/scalar);
    
    //overlay.fill(100,100,255,100);
    //overlay.rect(indx*(overall_dim/10),indy*(overall_dim/10),overall_dim/10,overall_dim/10);
    mouseX = mx;
    mouseY = my;
    var currentChunk = getChunk(mx,my);

    for(var g in currentChunk){
        if(currentChunk[g]==undefined){
            continue;
        }
        var hbox = currentChunk[g].gethbox();
        var x = hbox[0];
        var y = hbox[1];
        x-=10;
        y-=10;
        var w = hbox[2];
        var h = hbox[3];
        w+=10;
        h+=10;
        if(mx>x&&mx<x+w&&my>y&&my<y+h){
            
           currentChunk[g].cleanup();
           fullRedraw=true;
           circutInHand=undefined;

        }else{
            
            
        }
    }
}


/**
 * Handles picking up gates
 */
function mouseReleased(){
    
    dragog = [];
    if(mouseButton === RIGHT || placeablesmenu.isMouseOver){
        return;
    }
    if(_mode_ == CursorModes.INTEGRATE){
        _mode_ = CursorModes.MOVEMENT;

        constructCircut();


        (-translationx/scalar+mouseX/scalar)
    }


    if(_mode_ == CursorModes.COPYSELECT){

        _mode_=CursorModes.MOVEMENT;
        copySelection();
    }

    if(circutInHand==undefined&&nodeInHand==undefined&&!justPlacedWire){
        let currentChunk = getMChunk();
        var mx = (-translationx/scalar+mouseX/scalar);
        var my = (-translationy/scalar+mouseY/scalar);
        for(var g in currentChunk){
            var hbox = currentChunk[g].gethbox();
            var x = hbox[0];
            var y = hbox[1];
            var w = hbox[2]/scalar;
            var h = hbox[3]/scalar;
            if(mx>x&&mx<x+hbox[2]&&my>y&&my<y+hbox[3]){
                _mode_ = CursorModes.EDIT;
                circutInHand = currentChunk[g];
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

    

    }else if (nodeInHand!=undefined && circutInHand==undefined && !justPlacedWire){
        var nw;
        if(!nodeInHand.isBus){
            nw = new Wire(nodeInHand.x,nodeInHand.y);
        }else{
            nw = new Bus(nodeInHand.x,nodeInHand.y);
        }
        nw.tmpx=mouseX;
        nw.tmpy=mouseY;
        nw.nodeA = nodeInHand;
        nodeInHand.wires.push(nw);
        circutInHand = nw;
        
    }else if (nodeInHand!=undefined && circutInHand!=undefined){
        
    }
}












/**
 * responsive
 */
function windowResized() {
    resizeCanvas(document.body.clientWidth, document.body.clientHeight);
}
/**
 * Handle zooming
 * @param {Object} event 
 */
function mouseWheel(event) {
    if(_mode_ == CursorModes.EDIT||_mode_ == CursorModes.INMODAL){
        return;
    }
    if(event.delta>0){
        event.delta = 53;
    }else{
       event.delta=-53;
    }
    scalar-=5/event.delta;
    var mcoords = getGlobalMCoords();
    if(scalar >= 0){
        var d = 5/event.delta;
        //d*overall_dim/2
        translationx+=d*overall_dim/2+d*mouseX;
        translationy+=d*overall_dim/2+d*mouseY;
        //translationx+=d*mcoords[0]+d*mouseX;
        //translationy+=d*mcoords[1]+d*mouseY;
    }else{
        scalar+=5/event.delta
    }
}
/**
 * Handle both panning, and selection through dragog array, and the integrationArea array
 */
function handleDrag(){
    if(dragog[0]==undefined||_mode_==CursorModes.EDIT){return;}
    if(_mode_ == CursorModes.MOVEMENT){
        translationx=dragog[2]+mouseX;
        translationy=dragog[3]+mouseY;
    }else if (_mode_ == CursorModes.INTEGRATE ||_mode_ == CursorModes.COPYSELECT ||_mode_ == CursorModes.CUTSELECT){
        integrationArea[0] = dragog[0];
        integrationArea[1] = dragog[1];
        integrationArea[2] = mouseX;
        integrationArea[3] = mouseY;
    }
}
/**
 * Debugging
 */
function drawIntegrationArea(){
    if(dragog[0]==undefined)return;
    fill(100,100,255,100);
    stroke(100,100,255);
    rect(dragog[0],dragog[1],mouseX-dragog[0],mouseY-dragog[1]);

}


function handleEdit(){

}

/**
 * Handles shortcuts and interaction
 */
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






    if(keyCode == BACKSPACE){
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


        if(closed_placeables_forplace){
            closed_placeables_forplace=false;
            UIkit.offcanvas(placeablesmenu).show();
        }


        return;
    }


    

    if(shiftDown && keyCode == 65){// shift + a for placeables
        
        if(!placeablesmenu.isOpen){
            UIkit.offcanvas("#offcanvas-flip").show();
            placeablesmenu.isOpen =true;
        }else{
            UIkit.offcanvas("#offcanvas-flip").hide();
            placeablesmenu.isOpen =false;
        }

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
/**
 * Callback for 'new integrated circut' button
 */
function startIntegrationMode(){
    var gatecount = 0;
    for(var gate in gates){
        for(var g in gates[gate]){
            gatecount++;
        }
    }
    if(gatecount == 0){
        //UIkit.notification({message: 'You must create a circut before integrating.', status:"danger"});
        warningMessage("You must create a circut before integrating");
        return;

    }
    cursor(CROSS);
    if(_mode_ != CursorModes.INTEGRATE){
        _mode_ = CursorModes.INTEGRATE;
    }else{
        _mode_ = CursorModes.MOVEMENT;
    }
}


function closeContextMenu(){

    contextmenu.hidden=true;
}

function openContextMenu(){
    if(shiftDown){return;}
    contextmenu.style.top = mouseY;
    contextmenu.style.left = mouseX;
    contextmenu.visibility = "visible";
    contextmenu.hidden = false;


}