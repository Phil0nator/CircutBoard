//wrappers
let D = new Date();



var lineStarter = "user@webterm:";
var lineEnder = "$ ";
var textsize = 20;
var lineHeight = textsize*2;
var linePadd = 10;
var cursorTime = 300;
var indent = "     ";
var terminal_cursor = String.fromCharCode(5);


var ctrl = false;




class Webterm{




    constructor(x,y,w,h){
        
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.content = [];
        this.colordata = [];
        
        this.currentPath = "/";
        
        this.filesystem = {"/":{}};
        var previousState = window.localStorage.getItem("fsys");
        if(previousState != undefined){
            this.filesystem = JSON.parse(previousState);
        }

        this.currentDir = this.filesystem["/"];
        this.style={"color":[0,255,0,255],"bg-color":[0,0,0,255],"cursor-color":[255,255,255,100]}


        this.uphist = [""];
        this.uphistindx = 0;

        this.videoBuffer = createGraphics(this.w,this.h);
        this.videoBuffer.textSize(textsize+1);

        this.needsRerender = true;
        this.currentLine = lineStarter+""+this.currentPath+lineEnder;
        this.lineBuffers = [];
        this.currentLineInsertLocation = this.currentLine.length;


        this.lastCursorTick = Date.now();
        this.showCursorUnderscore = false;

        this.inputAllowed = true;
        //this.renderNewLine(this.currentLine);

        this.currentProcess = undefined;

    }

    clear(){
        this.lineBuffers = [];
        this.needsRerender = true;
    }

    saveState(){
        window.localStorage.setItem("fsys", JSON.stringify(this.filesystem));
    }


    executeCommand(line){

        var command = line.split(lineEnder)[1];
        command = command.trim();
        //console.log("C "+command);
        var instruction = command.split(" ")[0];
        instruction = instruction.replace(" ","");
        //console.log("'"+instruction+"'");
        switch(instruction){
            case "mkdir" || " mkdir":
                mkdir(command.split(" ")[1]);
                break;
            case "ls" || " ls" || "dir" || " dir":
                ls();
                break;
            case "cd":
                cd(command.split(" ")[1]);
                break;
            case "rmdir":
                rmdir(command.split(" ")[1]);
                break;
            case "clear":
                this.clear();
                break;
            case "nano":
                __nano.terminal = this;
                __nano.args = command.split(" "); 
                __nano.run();
                break;

            case "run":
                this.querryProcess();
                break;
            default:
                this.renderNewLine(indent+"Command '"+instruction+"' not found.");
                break;
        }

    }
    querryProcess(){

    }

    renderNewLine(line){
        var g = createGraphics(this.w,lineHeight);
        g.textSize(textsize);
        g.background(0);
        g.fill(this.style["color"]);
        g.text(line,linePadd,lineHeight/2);
        this.lineBuffers.push(g);

        if(this.lineBuffers.length > (document.body.clientHeight/lineHeight)-1){
            this.lineBuffers.shift();
        }

        this.needsRerender = true;
    }

    getFile(path){
        if(path.startsWith("/")){
            
            path = path.split("/");
            console.log(path);

        }else{
            return this.currentDir[path];
        }
    }
    createFile(name){
        this.currentDir[name] = "";
        this.saveState();
    }

    enterLine(line){
        this.renderNewLine(line);
        this.executeCommand(line);
        this.resetLine();
        //this.uphist.push(line.slice(line.indexOf(lineEnder),line.length));
        this.uphistindx=0;
    }

    resetLine(){
        this.currentLine = lineStarter+this.currentPath+lineEnder;
        this.currentLineInsertLocation = this.currentLine.length;

        //console.log("RESETLOG: '"+this.currentLine+"'");
        //mainterm.currentLine = mainterm.currentLine.slice(0,-1);
    }

    backspace(){
        if(this.inputAllowed){
            if(mainterm.currentLine.length>0&&mainterm.currentLine.substring(mainterm.currentLine.length-2,mainterm.currentLine.length)!=lineEnder){
                mainterm.currentLine = mainterm.currentLine.slice(0,this.currentLineInsertLocation-1)+mainterm.currentLine.slice(this.currentLineInsertLocation);
                this.currentLineInsertLocation--;
            }
        }
    }

    input(keyinp){
        if(this.inputAllowed){
            mainterm.currentLine = mainterm.currentLine.slice(0,this.currentLineInsertLocation)+keyinp+mainterm.currentLine.slice(this.currentLineInsertLocation);
            this.currentLineInsertLocation++;
        }
    }

    getLast(){
        return mainterm.currentLine.substring(mainterm.currentLine.length-1,mainterm.currentLine.length);
    }

    startProcess(process){

        this.currentProcess = process;
        process.compile();
        process.run();

    }


    draw(){

        if(this.currentProcess != undefined){
            this.currentProcess.tick();
            return;
        }

        if(Date.now() - this.lastCursorTick > cursorTime){
            this.showCursorUnderscore=!this.showCursorUnderscore;
            this.lastCursorTick=Date.now();
        }

        var lastline = this.lineBuffers.length*lineHeight;
        if(this.needsRerender){
    
    
            this.videoBuffer.background(this.style["bg-color"]);
            
            for(var i = 0 ; i < this.lineBuffers.length;i++){
                this.videoBuffer.image(this.lineBuffers[i], 0,(i)*lineHeight);
            }

            this.needsRerender=false;


        }
        this.videoBuffer.fill(0);
        this.videoBuffer.rect(0,lastline,document.body.clientWidth,lineHeight);
        this.videoBuffer.fill(this.style["color"]);

        if(this.showCursorUnderscore){
            //this.videoBuffer.text(this.currentLine,linePadd,lastline+lineHeight/2);
            this.videoBuffer.text(mainterm.currentLine.slice(0,this.currentLineInsertLocation)+terminal_cursor+mainterm.currentLine.slice(this.currentLineInsertLocation+1),linePadd,lastline+lineHeight/2);
            


        }else{
            this.videoBuffer.text(this.currentLine,linePadd,lastline+lineHeight/2);
        }
        
        image(this.videoBuffer,0,0);



    }



}


class Process{


    constructor(terminal, instructions){

        this.stack = [];
        this.heap = {};
        this.terminal = terminal;
        this.instructions = instructions;
        this.args = "";
    }

    compile(){

    }

    run(){

    }

    cleanup(){
        this.terminal.currentProcess = undefined;
    }

    keyPressed(key){

    }


}


var mainterm;

function setup(){
    createCanvas(document.body.clientWidth, document.body.clientHeight);
    mainterm= new Webterm(0,0,document.body.clientWidth, document.body.clientHeight);
    textSize(textsize);

}
function keyReleased(){
    if(keyCode == CONTROL){
        ctrl=false;
    }
}
function keyPressed(){
    if(keyCode==ENTER){
        mainterm.enterLine(mainterm.currentLine);
        mainterm.backspace();
        //mainterm.resetLine();
    }else if (keyCode == BACKSPACE){
        mainterm.backspace();
    }else if (keyCode == 37){ //right arrow
        console.log("  fsdfsdfs");
        if(mainterm.currentLine.length>0&&mainterm.currentLine.substring(mainterm.currentLineInsertLocation-2,mainterm.currentLineInsertLocation)!=lineEnder){
            mainterm.currentLineInsertLocation--;
        }
    }
    else if (keyCode == 39){
        if(mainterm.currentLineInsertLocation <= mainterm.currentLine.length);
        mainterm.currentLineInsertLocation++;
    }else if(keyCode == CONTROL){
        ctrl=true;
    }

    

    if(mainterm.currentProcess!=undefined){
        mainterm.currentProcess.keyPressed(key);
    }

    
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyTyped(){
    if(key!=ENTER)
    mainterm.input(key);
    //console.log("\""+mainterm.currentLine+"\"");
}

function draw(){
    mainterm.draw();
    
}

//builtins




function mkdir(newpath){
    //console.log('mkdir');
    mainterm.currentDir[newpath] = {};
    mainterm.saveState();
}
function ls(){
    for(var k in mainterm.currentDir){  
        mainterm.renderNewLine(indent+k);
    }
}
function rmdir(dir){

    if(dir in mainterm.currentDir){
        if(typeof mainterm.currentDir[dir] == "string"){
            mainterm.renderNewLine("rmdir: "+dir+": Not a directory.");
        }else{
            delete mainterm.currentDir[dir];
            mainterm.saveState();
        }
    }else{
        mainterm.renderNewLine("rmdir: "+dir+": Not a directory.");
    }

}
function cd(newdir){
    var through = [newdir];

    if(newdir == "/"){
        mainterm.currentDir = mainterm.filesystem["/"];
        mainterm.currentPath = "/";
        return;
    }

    if(newdir == ".."|| newdir == " .."){
        var to = mainterm.currentPath.substring(0,mainterm.currentPath.trim().slice(0,-1).lastIndexOf("/"));
        if (mainterm.currentPath.slice(-1).lastIndexOf("/") == -1 || to == " " || to=="" || to == undefined){
            cd("/");
            return;
        }
        
        
        cd(to);
        return;
    }

    if(newdir.startsWith("/")){
        through = newdir.split("/");
        through.shift();
        mainterm.currentDir = mainterm.filesystem["/"];
        mainterm.currentPath = "/";
        for(var p in through){
            cd(through[p]);
        }
        return;
    }else{
        
        if(!(newdir in mainterm.currentDir)){

            mainterm.renderNewLine("cd: "+newdir+": Not a folder.");
            return;

        }
        if( typeof mainterm.currentDir[newdir] == "string" ){
            mainterm.renderNewLine("cd: "+newdir+": Not a folder.");
            return;
        }
        
        mainterm.currentDir = mainterm.currentDir[newdir];
        mainterm.currentPath+=newdir+"/";
        
        return;
    }


}



//builtins
var __nano = new Process(mainterm,undefined);
__nano.run = function(){
    this.file = this.args;
    if(this.file == undefined || this.file.length!=2){
        this.terminal.renderNewLine(indent+"nano: No input file given.");
        this.cleanup();
        return;
    }
    
    
    console.log(this.file);
    this.file = this.terminal.getFile(this.file[1]);
    if(this.file == undefined){
        this.file = "";
        this.terminal.createFile(this.args[1]);
    }



    var __nano_editor = document.getElementById("nano");
    __nano_editor.style.visibility="visible";


}
__nano.tick = function(){
    this.terminal.clear();
    this.terminal.renderNewLine("~Nano Editor~");
    
}
