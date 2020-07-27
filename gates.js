
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

    updateWires(){
        for(var wire in this.wires){
            this.wires[wire].needsUpdate=true;
            
            //this.wires[wire].inputs[0] = this.value;
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

class IntegratedCircut{

    constructor(){
        this.gates= [];
        this.wires = [];
        this.inputs = [];
        this.outputs = [];
    }

}

