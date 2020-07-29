
class Node{

    constructor(x,y,g,isInput){
        this.x=x;
        this.y=y;
        this.value=false;
        this.mouseIsOver = false;
        this.gate =g;
        this.wires = [];
        this.isInput = isInput;

    }
    createJSON(){
        var out = {};
        out[this.constructor.name] = [this.x,this.y];
        return out;
    }

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

    draw(){
        overlay.fill(node_color);
        if(!this.mouseIsOver){
            overlay.circle(this.x,this.y,node_r);
        }else{
            overlay.fill(node_mover);
            overlay.circle(this.x,this.y,node_r);

        }
    }

    set(x,y){
        this.x=x;
        this.y=y;
    }

}


class Gate{
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
    
    createJSON(){
        var out = {};
        out[this.constructor.name] = [this.x,this.y];
        return out;
    }
    
    copy(){
        return new Gate(this.x,this.y);
    }
    place(){}
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
        return [this.inpNodes,this.outNodes];
    }
    drawfordrag(){}
    draw(overlay){}
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

    integratedUpdate(){
        for(var node in this.inpNodes){
            this.inputs[node] = this.inpNodes[node].value;
            
        }
        
        this.passthrough();
        
        //this.draw(overlay);
        for(var node in this.inpNodes){
            this.inpNodes[node].updateWires();
        }
        for (var node in this.outNodes){
            this.outNodes[node].value = this.outputs[node];
            this.outNodes[node].updateWires();
        }
        if(!fullRedraw){
            fullRedraw=true;
        }

        this.needsUpdate=false;
    }

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
class IntegratedCircut{

    constructor(){
        //hybrid
        this.gates= [];
        this.wires = [];
        //for saving only
        this.s_inputs = [];
        this.s_outputs = [];

        //for runtime
        this.inpNodes = [];
        this.outNodes = [];
        this.inputs = [];
        this.outputs = [];

        this.width = IC_Width;
        this.x=0;
        this.y=0;
        this.name = "IntegratedCircut";
        this.needsUpdate = false;
    }

    copy(){
        var out = new IntegratedCircut();
        out.loadFromJson(this.name);
        out.x=this.x;
        out.y=this.y;
        return out;
    }

    loadFromJson(name){
        this.name=name;
        var J = localStorage.getItem(this.name);
        J = JSON.parse(J);
        if(J == null){
            return null;
        }
        console.log(J);

        for(var g in J.gates){
            var gate;
            var gname;
            for(var key in J.gates[g]){
                gname=key;
            }
            var coords = [J.gates[g][gname][0],J.gates[g][gname][1]];
            switch (gname){
                case "XORGate":
                    gate = new XORGate(coords[0],coords[1]);
                    break;
                case "NotGate":
                    gate = new NotGate(coords[0],coords[1]);
                    break;
                case "AndGate":
                    gate = new AndGate(coords[0],coords[1]);
                    break;
                case "OrGate":
                    gate = new OrGate(coords[0],coords[1]);
                    break;
                case "WireNode":
                    gate = new WireNode(coords[0],coords[1]);
                    break;
                case "IntegratedCircut":
                    gate = new IntegratedCircut();
                    gate.loadFromJson(J.gates[g][gname][2]);
                    gate.x=coords[0];
                    gate.y=coords[1];
                    break;
            }
            gate.place();
            this.gates.push(gate);

        }


        for(var n in J.inputs){
            this.inpNodes.push(new Node(J.inputs[n]["Node"][0],J.inputs[n]["Node"][1]));
            this.s_inputs.push(new Node(J.inputs[n]["Node"][0],J.inputs[n]["Node"][1]));
        }
        for(var n in J.outputs){
            this.outNodes.push(new Node(J.outputs[n]["Node"][0],J.outputs[n]["Node"][1]));
            this.s_outputs.push(new Node(J.outputs[n]["Node"][0],J.outputs[n]["Node"][1]));
        }
        this.prep();
        console.log(this);

        for(var w in J.wires){

            var wire = new Wire(undefined,undefined);
            wire.nodeA = new Node(J.wires[w]["Wire"][0],J.wires[w]["Wire"][1]);
            wire.nodeB = new Node(J.wires[w]["Wire"][2],J.wires[w]["Wire"][3]);

            var copiedWire = new Wire(undefined,undefined);
            //newCircut.wires.push(wire);

            //reconstruct wires with correct references

            //input nodes
            for(var n in this.s_inputs){
                var x = this.s_inputs[n].x;
                var y = this.s_inputs[n].y;
                
                if(wireNodeConnectionTest(wire,x,y,true)){
                    copiedWire.nodeA = this.inpNodes[n];
                    copiedWire.nodeA.gate=copiedWire;
                }
                else if(wireNodeConnectionTest(wire,x,y,false)){
                    copiedWire.nodeB = this.inpNodes[n];
                    copiedWire.nodeB.gate=copiedWire;
                }
            }

            //output nodes
            for(var n in this.s_outputs){
                var x = this.s_outputs[n].x;
                var y = this.s_outputs[n].y;
                if(wireNodeConnectionTest(wire,x,y,true)){
                    copiedWire.nodeA = this.outNodes[n];
                    copiedWire.nodeA.gate=copiedWire;

                }
                else if(wireNodeConnectionTest(wire,x,y,false)){
                    copiedWire.nodeB = this.outNodes[n];
                    copiedWire.nodeB.gate=copiedWire;

                }
            }
            //inside gates
            for(var gate in this.gates){

                //gate inps
                for(var n in this.gates[gate].inpNodes){
                    var x = this.gates[gate].inpNodes[n].x;
                    var y = this.gates[gate].inpNodes[n].y;
                    if(wireNodeConnectionTest(wire,x,y,true)){
                        copiedWire.nodeA = this.gates[gate].inpNodes[n];
                    }
                    else if(wireNodeConnectionTest(wire,x,y,false)){
                        copiedWire.nodeB = this.gates[gate].inpNodes[n];
                    }
                }

                //gate outs
                for(var n in this.gates[gate].outNodes){
                    var x = this.gates[gate].outNodes[n].x;
                    var y = this.gates[gate].outNodes[n].y;
                    if(wireNodeConnectionTest(wire,x,y,true)){
                        copiedWire.nodeA = this.gates[gate].outNodes[n];
                    }
                    else if(wireNodeConnectionTest(wire,x,y,false)){
                        copiedWire.nodeB = this.gates[gate].outNodes[n];
                    }
                }
            }
            console.log(copiedWire);
            //satisfy other end of references for re-construction
            copiedWire.place();
            copiedWire.nodeA.wires.push(copiedWire);
            copiedWire.nodeB.wires.push(copiedWire);
            this.wires.push(copiedWire);

        }
        console.log(this);
    }

    createJSON(){
        var out = {};
        out[this.constructor.name] = [this.x,this.y, this.name];
        return out;
    }

    drawfordrag(){
        scale(scalar);
        fill(255);
        rect(this.x,this.y,this.width,this.height);
        textSize(15);
        text(this.name,this.x,this.y,this.width,this.height);

    }
    gethbox(){
        return [this.x,this.y,this.width,this.height];
    }

    draw(overlay){
        if(overlay == undefined){
            this.drawfordrag();
            return;
        }
        overlay.fill(255);
        overlay.rect(this.x,this.y,this.width,this.height);
        overlay.textSize(15);
        overlay.fill(0);
        overlay.text(this.name.substring(3,this.name.length),this.x,this.y,this.width,this.height);
        



    }

    integratedUpdate(){
        if(this.inpNodes != []){
            for(var node in this.inpNodes){
                this.inputs[node] = this.inpNodes[node].value;
            }
            
            this.passthrough();
            
            for(var node in this.inpNodes){
                this.inpNodes[node].updateWires();
            }
            for (var node in this.outNodes){
                this.outputs[node] = this.outNodes[node].value;
                this.outNodes[node].updateWires();
            }
            if(!fullRedraw){
                fullRedraw=true;
            }

            this.needsUpdate=false;
        }else{
            console.log("issues")
        }
    }

    passthrough(){

        for(var gate in this.gates){
            this.gates[gate].integratedUpdate();
        }
        for(var wire in this.wires){
            this.wires[wire].integratedUpdate();
        }
        

    }
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


    update(){
        //this.needsUpdate||fullRedraw
        if(this.inpNodes != []){
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
                this.outputs[node] = this.outNodes[node].value;
                this.outNodes[node].updateWires();
            }
            if(!fullRedraw){
                fullRedraw=true;
            }

            this.needsUpdate=false;
        }else{
            console.log("issues")
        }
    }


    place(){
        if(this.inpNodes[0] == undefined){
            for(var n in this.s_inputs){
                this.inpNodes.push(new Node(this.x,this.y+25+(n)*(this.height/this.s_inputs.length),this,true));
            }
            for(var n in this.s_outputs){
                this.outNodes.push(new Node(this.x+this.width,this.y+n*(this.height/this.s_outputs.length),this,false));
            }
        }else{
            for(var n in this.s_inputs){
                this.inpNodes[n].set(this.x,this.y+25+n*(this.height/this.s_inputs.length));
            }
            for(var n in this.s_outputs){
                this.outNodes[n].set(this.x+this.width,this.y+n*(this.height/this.s_outputs.length));
            }
        }
    }

    prep(){
        this.s_inputs.sort(nodeSort);
        this.s_outputs.sort(nodeSort);
        if(this.s_inputs.length>this.s_outputs.length){
            this.height = this.s_inputs.length*25;
        }else{
            this.height = this.s_outputs.length*25;
        }
        
        
    }
    getNodes(){
        return [this.inpNodes,this.outNodes];
    }

}

