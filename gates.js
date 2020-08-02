/**
 * A class used to represent and facilitate the connection between wires and gates.
 */
class Node{
    /**
     * 
     * @param {int} x coord
     * @param {int} y coord
     * @param {Gate} g attached gate
     * @param {Boolean} isInput 
     */
    constructor(x,y,g,isInput){
        this.x=x;
        this.y=y;
        this.value=false;
        this.mouseIsOver = false;
        this.gate =g;
        this.wires = [];
        this.isInput = isInput;

    }
    /**
     * Spread instruction backprop
     * @param {Array} destination 
     */
    constructInstructions(destination){
    
        for(var w in this.wires){
            if(this.wires[w].nodeA !== this){
                this.wires[w].nodeA.gate.constructInstructions(destination);
            }else{
                this.wires[w].nodeB.gate.constructInstructions(destination);
            }
        }
    
    
    
    }
    
    /**
     * Pass info through connected wires
     */
    updateWires(){
        for(var wire in this.wires){
            this.wires[wire].needsUpdate=true;
            
            //this.wires[wire].s_inputs[0] = this.value;
            this.wires[wire].value = this.value;
        }
        this.gate.needsUpdate=true;
        if(this.wires[0] != undefined){
            this.value = this.wires[0].value;
        }
    }
    /**
     * visuals
     */
    draw(){
        overlay.fill(node_color);
        if(!this.mouseIsOver){
            overlay.circle(this.x,this.y,node_r);
        }else{
            overlay.fill(node_mover);
            overlay.circle(this.x,this.y,node_r);

        }
    }
    /**
     * Shortcut
     * @param {int} x 
     * @param {int} y 
     */
    set(x,y){
        this.x=x;
        this.y=y;
    }

}

/**
 * Parent class (treated as abstract) for all gates/things that can be placed.
 */
class Gate{
    /**
     * 
     * @param {int} x 
     * @param {int} y 
     */
    constructor(x,y){
        this.inputs = [];
        this.outputs = [];
        this.value = false;
        this.x = x;
        this.y = y;

        this.hboxw = 0;
        this.hboxh = 0;
        this.inpNodes = [];
        this.outNodes = [];

        this.needsUpdate = true;


        

    }
    

    /**
     * To be overriden
     * @param {Array} destination 
     */
    constructInstructions(destination){
        console.log("something is wrong");
    }

    /**
     * Create basic JSON representation of the gate
     */
    createJSON(){
        var out = {};
        out[this.constructor.name] = [this.x,this.y];
        return out;
    }
    /**
     * To be overriden
     */
    copy(){
        return new Gate(this.x,this.y);
    }
    /**
     * To be overriden
     */
    place(){}
    /**
     * @return a bounding box based on the format [x,y,w,h];
     */
    gethbox(){
        var out = new Array(4);
        out[0]=this.x;
        out[1] = this.y;
        out[2] = this.hboxw;
        out[3] = this.hboxh;
        return out;
    }
    /**
     * To be overriden
     */
    passthrough(){}
    /**
     * @return an array containing the input nodes, and output nodes of the gate
     */
    getNodes(){
        return [this.inpNodes,this.outNodes];
    }
    /**
     * To be overriden
     */
    drawfordrag(){}
    /**
     * To be overriden
     */
    draw(overlay){}
    /**
     * Remove the gate from the workplane
     */
    cleanup(){
        //this.inpNodes=undefined;
        //this.outNodes=undefined;
        
        
        var chunk = getMChunk();
        if(chunk.indexOf(this)==-1){
            return;
        }else{
            chunk.splice(chunk.indexOf(this),1);
        }
        
        //delete this;
    }

    
    /**
     * Universal function for basic gates.
     * Handles drawing, logic, and information movement.
     */
    update(){
        //this.needsUpdate||fullRedraw
        if(true){
            for(var node in this.inpNodes){
                this.inputs[node] = this.inpNodes[node].value;
                
            }
            
            this.passthrough();
            
            this.draw(overlay);
            for(var node in this.inpNodes){
                this.inpNodes[node].draw();
                this.inpNodes[node].updateWires();
            }
            for (var node in this.outNodes){
                this.outNodes[node].draw();
                this.outNodes[node].value = this.outputs[node];
                this.outNodes[node].updateWires();
            }
            if(!fullRedraw){
                fullRedraw=true;
            }

            this.needsUpdate=false;
        }else{
            for(var node in this.inpNodes){
                this.inpNodes[node].draw();
            }
            for (var node in this.outNodes){
                this.outNodes[node].draw();
            }
        }
    }

}
const wire_hbox_h = 25;
class Wire extends Gate{

    constructor(x,y){
        super(x,y);
        this.isWire = true;
        if(this.x!=undefined&&this.y!=undefined)
        wires.push(this);
    }
    place(){
        this.finalize(this.x2,this.y2);
        
    }
    createJSON(){
        //this.x=this.nodeA.x;this.y=this.nodeA.y;
        //this.x2=this.nodeB.x;this.y2=this.nodeB.y;
        var out = {};
        out[this.constructor.name] = [this.nodeA.x,this.nodeA.y,this.nodeB.x,this.nodeB.y];
        return out;
    }
    cleanup(){
        //this.inpNodes=undefined;
        //this.outNodes=undefined;
        
        
        wires.splice(wires.indexOf(this));
        this.nodeA.wires.splice(this.nodeA.wires.indexOf(this));
        if(this.finalized)
        this.nodeB.wires.splice(this.nodeB.wires.indexOf(this));
    }
    gethbox(){
        if(this.finalized){
            this.hboxh=(this.nodeB.y-this.nodeA.y);
            this.hboxw=(this.nodeB.x-this.nodeA.x);
            return this.hboxh/this.hboxw;
        }
        return [0,0,0,0];
    }

    finalize(x,y){
        this.x2=x;
        this.y2=y;
        this.finalized=true;
        
        if(this.nodeB == undefined){
            this.nodeB = new Node(this.x2,this.y2,this,"wire");
        }
    }

    passthrough(){
        this.outputs[0]=this.inputs[0];
        this.value = this.inputs[0];
        this.nodeB.value = this.nodeA.value;
        this.nodeB.updateWires();
    }
    drawfordrag(){
        scale(scalar);

        if(true){
            strokeWeight(5);
            if(this.value){
                stroke(0,255,0);
            }else{
                stroke(255,0,0);
            }
            
            line(this.nodeA.x+translationx/scalar,this.nodeA.y+translationy/scalar,mouseX/scalar,mouseY/scalar);
            strokeWeight(1);
        }else{
            


        }
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        if(this.finalized == true){
            overlay.strokeWeight(5);
            if(this.value){
                overlay.stroke(0,255,0);
            }else{
                overlay.stroke(255,0,0);
            }
            //var h = this.gethbox();
            //overlay.rect(h[0],h[1],h[2],h[3]);
            overlay.line(this.nodeA.x,this.nodeA.y,this.nodeB.x,this.nodeB.y);
            overlay.strokeWeight(1);
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





class NotGate extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxh = 60;
        this.hboxw = 60;
        
    }
    constructInstructions(destination){
        

        this.inpNodes[0].constructInstructions(destination);

        destination.push([this.inpNodes[0].assignedVariable,"!",this.inpNodes[0].assignedVariable,this.outNodes[0].assignedVariable]);

    
    }

    place(){
        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x,this.y+25, this,true)];
            this.outNodes = [new Node(this.x+50,this.y+25, this,false)];
        }else{
            this.inpNodes[0].x = this.x;this.inpNodes[0].y=this.y+25;
            this.outNodes[0].x=this.x+50;this.outNodes[0].y=this.y+25;
        }
    }

    copy(){
        var out = new NotGate(this.x,this.y);
        out.place();
        return out;
    }

    passthrough(){


        this.outputs[0]=!this.inputs[0];

    }

    drawfordrag(){
        scale(scalar);

        fill(255);
        triangle(this.x,this.y,this.x,this.y+50,this.x+50,this.y+25);
        
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.triangle(this.x,this.y,this.x,this.y+50,this.x+50,this.y+25);
        

    }

}
const OrGatew = 100;
class OrGate extends Gate{


    constructor(x,y){
        super(x,y);
        this.hboxh = 60;
        this.hboxw = OrGatew;
    }


    constructInstructions(destination){
        

        this.inpNodes[0].constructInstructions(destination);
        this.inpNodes[1].constructInstructions(destination);

        destination.push([this.inpNodes[0].assignedVariable,"OR",this.inpNodes[1].assignedVariable,this.outNodes[0].assignedVariable]);

    
    }


    copy(){
        var out = new OrGate(this.x,this.y);
        out.place();
        return out;
    }
    place(){
        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x+10,this.y-15, this,true), new Node(this.x+10,this.y+15, this,true)];
            this.outNodes = [new Node(this.x+OrGatew/2,this.y, this,false)];
        }else{
            this.inpNodes[0].x = this.x+10;this.inpNodes[0].y = this.y-15;
            this.inpNodes[1].x = this.x+10;this.inpNodes[1].y=this.y+15;
            this.outNodes[0].x=this.x+OrGatew/2;this.outNodes[0].y=this.y;
        }
    }
    passthrough(){

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

    }

}

class AndGate extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxw = OrGatew;
        this.hboxh = 60;
    }
    constructInstructions(destination){
        

        this.inpNodes[0].constructInstructions(destination);
        this.inpNodes[1].constructInstructions(destination);

        destination.push([this.inpNodes[0].assignedVariable,"AND",this.inpNodes[1].assignedVariable,this.outNodes[0].assignedVariable]);

    
    }
    copy(){
        var out = new AndGate(this.x,this.y);
        out.place();
        return out;
    }
    place(){
        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x,this.y-15, this,true), new Node(this.x,this.y+15, this,true)];
            this.outNodes = [new Node(this.x+OrGatew/2,this.y, this,false)];
        }else{
            this.inpNodes[0].x = this.x; this.inpNodes[0].y = this.y-15;
            this.inpNodes[1].x = this.x; this.inpNodes[1].y=this.y+15;
            this.outNodes[0].x=this.x+OrGatew/2;this.outNodes[0].y=this.y;
        }
    }
    passthrough(){

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

    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.arc(this.x, this.y,OrGatew,50, -HALF_PI, HALF_PI, CHORD);

    }



}

class XORGate extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxw = OrGatew;
        this.hboxh = 60;
    }
    constructInstructions(destination){
        

        this.inpNodes[0].constructInstructions(destination);
        this.inpNodes[1].constructInstructions(destination);
        destination.push([this.inpNodes[0].assignedVariable,"XOR",this.inpNodes[1].assignedVariable,this.outNodes[0].assignedVariable]);

    
    }
    copy(){
        var out = new XORGate(this.x,this.y);
        out.place();
        return out;
    }
    place(){
        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x+10,this.y-15, this,true), new Node(this.x+10,this.y+15, this,true)];
            this.outNodes = [new Node(this.x+OrGatew/2,this.y, this,false)];
        }else{
            this.inpNodes[0].x = this.x+10;this.inpNodes[0].y = this.y-15;
            this.inpNodes[1].x = this.x+10;this.inpNodes[1].y=this.y+15;
            this.outNodes[0].x=this.x+OrGatew/2;this.outNodes[0].y=this.y;
        }
    }

    passthrough(){


        this.outputs[0] = Boolean(this.inputs[0] ^ this.inputs[1]);

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


    }


}
class PIN extends Gate{
    constructor(x,y){
        super(x,y);
        this.hboxw = node_r*4;
        this.hboxh = node_r*4;
        this.isInputPin = true;
    }
    constructInstructions(destination){
        


        //destination.push(["i"+this.outNodes[0].assignedInputNotation]);

    
    }
    place(){
        if(this.outNodes[0] == undefined){
            this.outNodes = [new Node(this.x+10,this.y+10, this,false)];
        }else{
            this.outNodes[0].x=this.x+node_r;this.outNodes[0].y=this.y+node_r;
        }
    }

    passthrough(){
        this.outputs[0] = this.value;
        
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

    }


}
class LED extends Gate{
    constructor(x,y){
        super(x,y);
        this.hboxw = node_r*4;
        this.hboxh = node_r*4;
        this.isLEDOut = true;
    }
    place(){
        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x+10,this.y+10, this,true)];
        }else{
            this.inpNodes[0].x=this.x+node_r;
            this.inpNodes[0].y= this.y+node_r;
        }
    }
    passthrough(){
        this.value = this.inputs[0];
        if(this.inpNodes[0]!=undefined)
        this.value = this.inpNodes[0].value;
    }

    drawfordrag(){
        scale(scalar);

        if(this.value){
            fill(0,255,0);

        }else{
            fill(255,0,0)
        }
        circle(this.x+10,this.y+10,node_r*2);

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

    }

}
class WireNode extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxh = 60;
        this.hboxw = 60;
        
    }
    constructInstructions(destination){
        

        this.inpNodes[0].constructInstructions(destination);

        destination.push([this.inpNodes[0].assignedVariable,"=",this.inpNodes[0].assignedVariable,this.outNodes[0].assignedVariable]);

    
    }
    copy(){
        var out = new WireNode(this.x,this.y);
        out.place();
        return out;
    }

    place(){
        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x,this.y+25, this,true)];
            this.outNodes = [new Node(this.x+50,this.y+25, this,false)];
        }else{
            this.inpNodes[0].x = this.x;this.inpNodes[0].y=this.y+25;
            this.outNodes[0].x=this.x+50;this.outNodes[0].y=this.y+25;
        }
    }

    passthrough(){


        this.outputs[0]=this.inputs[0];

    }

    drawfordrag(){
        scale(scalar);

        fill(255);
        rect(this.x,this.y,50,50);
        //triangle(this.x,this.y,this.x,this.y+50,this.x+50,this.y+25);
        
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.rect(this.x,this.y,50,50);
        //overlay.triangle(this.x,this.y,this.x,this.y+50,this.x+50,this.y+25);
        

    }

}
class SRFlipFlop extends Gate{


    constructor(x,y){
        super(x,y);
        this.hboxw = 100;
        this.hboxh = 100;
        
    }
    constructInstructions(destination){
        

        this.inpNodes[0].constructInstructions(destination);

        //destination.push([this.inpNodes[0].assignedVariable, "AND", this.inpNodes[1].assignedVariable, this.storagePointer]);
        //destination.push([this.inpNodes[2].assignedVariable, "AND", this.inpNodes[1].assignedVariable, this.storagePointer]);


        //destination.push([this.storagePointer, "=", this.storagePointer, this.outNodes[0].assignedVariable]);
        destination.push([this.inpNodes[0].assignedVariable,"SRFLIP",this.inpNodes[1].assignedVariable,this.storagePointer,this.inpNodes[2].assignedVariable,this.outNodes[0].assignedVariable]);
    
    }
    copy(){
        var out = new SRFlipFlop(this.x,this.y);
        out.place();
        return out;
    }

    place(){

        if(this.inpNodes[0] == undefined){
            this.inpNodes = [new Node(this.x,this.y+15, this,true), new Node(this.x,this.y+45, this,true),new Node(this.x,this.y+75, this,true)];
            this.outNodes = [new Node(this.x+100,this.y+50, this,false)];
        }else{
            this.inpNodes[0].set(this.x,this.y+15);
            this.inpNodes[1].set(this.x,this.y+45);
            this.inpNodes[2].set(this.x,this.y+75);
            this.outNodes[0].set(this.x+100,this.y+50);
        }

    }
    passthrough(){
        if(this.inputs[0]){
            this.value = this.inputs[1];
            
        }else if(this.inputs[2]&&this.inputs[1]){
            this.value=false;
        }
        this.outputs[0] = this.value;
    }

    drawfordrag(){
        scale(scalar);
        rect(this.x,this.y,100,100);
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
        overlay.rect(this.x,this.y,100,100);
        overlay.fill(0);
        overlay.text("S",this.x+10,this.y+10);
        overlay.text(">", this.x+15,this.y+50);
        overlay.text("R",this.x+10,this.y+90);
    }







}

























function nodeSort(a,b){

    if(a.y<b.y){
        return -1;
    }
    return 1;


}




/**
 * Used to compress a large system of gates and wires into a single gate
 * @see Gate
 */
class IntegratedCircut extends Gate{

    constructor(x,y){
        super(x,y);
        this.hboxw = 100;
        this.hboxh = 100;
        this.storage = [];
        this.variables = [];
        this.i=[];
        this.o=[];
        this.instructionset=[];
        this.outputThroughPointers=[];
        this.wires=[];
        this.gates=[];
        this.width = 100;
        this.height;

    }

    copy(){
        var out = new IntegratedCircut();
        out.place();
        return out;
    }

    place(){
        if(this.inpNodes[0] == undefined){
            this.i.sort(nodeSort);
            this.o.sort(nodeSort);
            for(var n in this.i){
                this.inpNodes.push(new Node(this.x,this.y+25+(n)*(this.height/this.i),this,true));
            }
            for(var n in this.o){
                this.outNodes.push(new Node(this.x+this.width,this.y+n*(this.height/this.o),this,false));
            }
        }else{
            for(var n in this.inpNodes){
                this.inpNodes[n].set(this.x,this.y+25+n*(this.height/this.i));
            }
            for(var n in this.outNodes){
                this.outNodes[n].set(this.x+this.width,this.y+n*(this.height/this.o));
            }
        }
    }
    /**
     * Will execute the assembly like instructions in this.instructionset and will use this.outputThroughPointers to return outputs correctly.
     * @see generateInstructions
     * @param {Boolean} rec isRecursive?
     */
    passthrough(rec){
        if(rec==undefined){
            for(var n in this.inpNodes){
                this.inputs[n] = this.inpNodes[n].value;
            }
            this.variables = new Array(this.variables.length);
        }
        for(var p in this.instructionset){
            for(var inst in this.instructionset[p]){

                let instruction = this.instructionset[p][inst];
                if(instruction == undefined){
                    continue;
                }
                if(instruction[0] == "EXEC"){

                    var subIC = new IntegratedCircut(-1000,-1000);
                    subIC.loadFromJson(instruction[1]);
                    subIC.place();
                    for(var n in instruction[2]){
                        if(typeof instruction[2][n] != "string"){
                            subIC.inpNodes[n].value = this.variables[instruction[2][n]];
                        }else{
                            subIC.inpNodes[n].value = this.inputs[parseInt(instruction[2][n].substring(1,instruction[2][n].length))];;
                        }
                    }
                    
                    
                    subIC.passthrough();
                    for(var n in instruction[3]){
                        this.variables[instruction[3][n]]=subIC.outNodes[n].value;
                    }
                    continue;

                }



                var operation = instruction[1];
                var op1;
                var op2;
                var dest;
                if(typeof instruction[0] == "string"){
                    if(instruction[0].startsWith("i")){
                        op1 = this.inputs[parseInt(instruction[0].substring(1,instruction[0].length))];
                    }else if (instruction[0].startsWith("s")){
                        op1 = this.storage[parseInt(instruction[0].substring(1,instruction[0].length))];
                    }
                }
                else{
                    op1 = this.variables[instruction[0]];
                }

                if(typeof instruction[2] == "string"){
                    if(instruction[2].startsWith("i")){
                        op2 = this.inputs[parseInt(instruction[2].substring(1,instruction[2].length))];
                    }else if(instruction[2].startsWith("s")){
                        op2 = this.storage[parseInt(instruction[2].substring(1,instruction[2].length))];
                    }
                }else{
                    op2 = this.variables[instruction[2]];
                }
                var destloc;
                if(typeof instruction[3] == "string"){
                    if(instruction[3].startsWith("s")){
                        dest = parseInt(instruction[3].substring(1,instruction[3].length));
                        destloc = this.storage;
                    }
                }else{

                    dest = instruction[3];
                    destloc=this.variables;
                }


                switch(operation){
                    case "!":
                        destloc[dest] = !op1;
                        break;
                    case "OR":
                        destloc[dest] = op1 || op2;
                        break;
                    case "AND":
                        destloc[dest] = op1 && op2;
                        break;
                    case "XOR":
                        destloc[dest] = Boolean(op1 ^ op2);
                        break;
                    case "=":
                        destloc[dest] = op1;
                        break;
                    case "SRFLIP":
                        var arg3;
                        if(typeof instruction[4] == "string"){
                            if(instruction[4].startsWith("i")){
                                arg3 = this.inputs[parseInt(instruction[4].substring(1,instruction[4].length))];
                            }else if (instruction[4].startsWith("s")){
                                arg3 = this.storage[parseInt(instruction[4].substring(1,instruction[4].length))];
                            }
                        }
                        else{
                            arg3 = this.variables[instruction[4]];
                        }


                        if(arg3&&op2){
                            destloc[dest] = false;
                        }
                        if(op1){
                            destloc[dest] = op2;
                        }
                        this.variables[instruction[5]] = destloc[dest];
                        break;


                    default:
                        console.log("Unkown Operator: "+operation);
                        break;

                }





            }
        }
        for(var p in this.outputThroughPointers){
            this.outputs[p] = this.variables[this.outputThroughPointers[p]];
            this.outNodes[p].value = this.outputs[p];
        }



    }
    gethbox(){
        return [this.x,this.y,this.width,this.height];
    }
    drawfordrag(){
        scale(scalar);
        rect(this.x,this.y,100,this.height);
    }


    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }

        overlay.fill(255);
        overlay.rect(this.x,this.y,100,this.height);
        overlay.fill(0);
        overlay.text(this.name.substring(3,this.name.length),this.x,this.y,this.width,this.height);
    }
    /**
     * Load the state of this Gate based on saved data from localStorage
     * @param {string} name name in localStorage
     */
    loadFromJson(name){
        this.name=name;
        var J = localStorage.getItem(this.name);
        J = JSON.parse(J);
        if(J == null){
            return null;
        }
        this.instructionset = J.instructionset;
        this.variables = new Array(J.numberOfVariables);
        this.storage = new Array(J.numberOfStoragePointers);
        this.outputThroughPointers = J.outputThroughPointers;
        this.i=J.i;
        this.o=J.o;
       
        //this.place();
        for(var n = 0; n < J.i;n++){
            this.inpNodes.push(new Node(this.x,this.y+25+(n)*(this.height/J.i),this,true));
        }
        for(var n = 0; n < J.o;n++){
            this.outNodes.push(new Node(this.x+this.width,this.y+n*(this.height/J.o),this,false));
        }

        if(this.i>this.o){
            this.height = this.i*25;
        }else{
            this.height = this.o*25;
        }
    }
    
    constructInstructions(destination){
        var invars = [];
        var outvars = [];
        for(var n in this.inpNodes){
            this.inpNodes[n].constructInstructions(destination);
            if(this.inpNodes[n].assignedInputNotation==undefined){
                invars.push(this.inpNodes[n].assignedVariable);
            }else{
                invars.push(this.inpNodes[n].assignedInputNotation);
            }
        }
        for(var n in this.outNodes){
            
            outvars.push(this.outNodes[n].assignedVariable);
        
        }
        //Will need to create a new IC object to execute the instructions, to be loaded again from json. outnodes will need to be calculated somehow.
        destination.push(["EXEC",this.name,invars,outvars]);
        


    }
    /**
     * Generate the assembly-like instructionset based on the given gates and wires for later execution/saving
     */
    generateInstructions(){
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //The instructions will act like an assembly type sudo language used to determine outputs based on inputs
        //Each node of each gate will be given a variable
        //The function used to determine these variables will be determined by stepping back through the circut recursively.
        //Each instruction will take the form ["vA", "operand", "vB", "destination variable"]
        //Instructions will be executed in order
        //For example, and XOR gate:
        //["the xor gate input 1 variable", "^", "the xor gate input 2 variable", "the xor gate output variable"]
        //overall inputs to the system will be denoted as "i#", # meaning the index of the input node
        //storage of the system will be denoted as "s#", # meaning the index of the stored value in this IC's storage array
        //Each variable will be represented by a number, which is an index in the array containing variables
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        if(this.i.length>this.o.length){
            this.height = this.i.length*25;
        }else{
            this.height = this.o.length*25;
        }
        


        this.i.sort(nodeSort);
        this.o.sort(nodeSort);






        var numberOfVariables = 0;
        var numberOfStoragePointers = 0;
        for(var i in this.i){
            this.i[i].assignedInputNotation = i;
        }
        for(var g in this.gates){
            
            for(var n in this.gates[g].outNodes){
                this.gates[g].outNodes[n].assignedVariable = numberOfVariables;
                
                numberOfVariables++;
            }
            
            if(this.gates[g].constructor.name == "SRFlipFlop"){
                this.gates[g].storagePointer = "s"+numberOfStoragePointers;
                numberOfStoragePointers++;
            }
        }
        for(var g in this.gates){
            for(var n in this.gates[g].inpNodes){

                this.gates[g].inpNodes[n].assignedVariable = this.gates[g].inpNodes[n].wires[0].nodeA.assignedVariable;
                if(this.gates[g].inpNodes[n].assignedVariable == undefined){
                    this.gates[g].inpNodes[n].assignedVariable = "i"+this.gates[g].inpNodes[n].wires[0].nodeA.assignedInputNotation;
                }    
            }
        }
        this.variables = new Array(numberOfVariables);
        this.storage = new Array(numberOfStoragePointers);
        this.outputThroughPointers = new Array(this.o.length);
        for(var o in this.o){
            this.outputThroughPointers[o]=this.o[o].wires[0].nodeA.assignedVariable;
            this.instructionset.push([]);
            this.o[o].constructInstructions(this.instructionset[this.instructionset.length-1]);
            




        }
        console.log(this.instructionset);
        console.log(this.variables);
        console.log(this.outputThroughPointers);
        console.log(this.storage);
        


    }


}

