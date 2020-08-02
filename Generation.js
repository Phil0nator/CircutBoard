var modaldiv;
var maindiv;
var ttable;
var ttablebody;
/**
 * Pull up IC modal for the current workingIntegrationCircut
 */
function createNewCircutModal(){

    modaldiv = document.getElementById("integratedCircutConfig");
    maindiv = document.getElementById("icc-main");
    if(workingIntegrationCircut.name!=undefined)
    document.getElementById("icc-name").value = workingIntegrationCircut.name.substring(3,workingIntegrationCircut.name.length);
    maindiv.innerHTML="";
    _mode_ = CursorModes.INMODAL;
    UIkit.modal(modaldiv).show();

}
/**
 * Save the working IC
 */
function newCircut_Save(){
    var name = document.getElementById("icc-name").value;
    
    saveIntegratedCircut(workingIntegrationCircut, name);
    document.getElementById('icc-name').value="";
    _mode_ = CursorModes.MOVEMENT;
    document.getElementById("custom_circuts_list").innerHTML="";
    loadICUIElements();
    UIkit.modal(modaldiv).hide();
    var table = document.getElementById("truthTable");
    table.innerHTML="";
}
/**
 * Cancel the new IC modal
 */
function newCircut_Cancel(){
    workingIntegrationCircut = undefined;
    _mode_ = CursorModes.MOVEMENT;
    UIkit.modal(modaldiv).hide();
    var table = document.getElementById("truthTable");
    table.innerHTML="";
}
/**
 * Compile an IC for localStorage
 * @param {IntegratedCircut} circut 
 * @param {string} name 
 */
function saveIntegratedCircut(circut, name){

    if(name == "" || name == undefined)return;
    var output = {};

    
    output.instructionset = circut.instructionset;
    output.numberOfVariables = circut.variables.length;
    output.storageSize = circut.storage.length;
    output.outputThroughPointers = circut.outputThroughPointers;
    output.i = circut.i.length;
    output.o = circut.o.length;
    

    localStorage.setItem("cc_"+name,JSON.stringify(output));

}







/**
 * Recursive function to test all possible binary values for a given bitwidth
 * @param {int} n bitwidth
 * @param {Array} arr array of length n for internal use
 * @param {int} i incrementor
 * @param {Array} oarr 2D array of outputs
 * @param {IntegratedCircut} c circut to test results against
 */
async function generateAllBinaryStrings(n,arr,i,oarr,c){
    if(i == n) {
        var o = passTest(c,arr.concat());

        var tr = document.createElement("tr");
        for(var j = 0 ; j < arr.length;j++){
            var td = document.createElement("td");
            td.innerHTML = arr[j];
            tr.appendChild(td);
        }
        for(var j = 0 ; j < o.length;j++){
            var td = document.createElement("td");
            td.innerHTML = o[j];
            tr.appendChild(td);
        }
        ttablebody.appendChild(tr);
        

        return;
    }
    
    arr[i] = true;
    generateAllBinaryStrings(n,arr,i+1,oarr,c);
    arr[i]=false;
    generateAllBinaryStrings(n,arr,i+1,oarr,c);
    

    




}



/**
 * Determine the outputs from a given IC based on given inputs
 * @param {IntegratedCircut} circut the IC to test
 * @param {Array} inputs inputs to give to IC
 */
function passTest(circut, inputs){
    circut.inputs = inputs.concat();
    for(var i = 0 ; i < circut.inputs.length; i ++){
        circut.inpNodes[i].value = inputs[i];
    }
    circut.x=-1000;
    circut.y=-1000;
    circut.passthrough();
    for(var i = 0 ; i < circut.outNodes.length;i++){
        circut.outputs[i]=circut.outNodes[i].value;
    }
    return circut.outputs.concat();
}

function startSpinner(){
    document.getElementById("spinnerDiv").innerHTML="<div uk-spinner></div>";

}
/**
 * Create the html elements to display a truth table for a given IC
 * @param {string} name name if IC in localStorage
 */
async function generateTruthTable(name){
    if(true){
        var c = new IntegratedCircut(-1000,-1000);
        
        c.loadFromJson(name);
        c.place();
        c.name=name;
    }else{
        var c = workingIntegrationCircut.copy();
    }
    var len = c.inpNodes.length;

    var oarrtest = [];
    var array = new Array(len);

    var table = document.getElementById("truthTable");
    table.innerHTML="";
    var header = document.createElement("thead");
    if(true){
        for(var  i = 0 ; i < len ; i ++){
            var th = document.createElement("th");
            th.innerHTML="I<sub>"+i+"</sub>";
            header.appendChild(th);
        }
        for(var i = 0 ; i < c.outNodes.length;i++){
            var th = document.createElement("th");
            th.innerHTML="O<sub>"+i+"</sub>";
            header.appendChild(th);
        }
    }
    table.appendChild(header);

    ttablebody = document.createElement("tbody");


    finishTruthTableOp(len,array,oarrtest,c,table);
    


}
/**
 * Finalize HTML table
 * @param {int} len bitwidth
 * @param {Array} array array of length len
 * @param {Array} oarrtest 2D array of outputs
 * @param {IntegratedCircut} c IC to test
 * @param {DOMElement} table output element to add html children to
 */
async function finishTruthTableOp(len,array,oarrtest,c,table){

    await generateAllBinaryStrings(len,array,0,oarrtest,c);
    
    table.appendChild(ttablebody);
    document.getElementById("spinnerDiv").innerHTML="";

}

/**
 * place a given IC in hand
 * @param {string} name name of IC in localStorage
 */
function getIntegratedCircut(name){
    circutInHand = new IntegratedCircut(0,0);
    circutInHand.loadFromJson(name);
    circutInHand.name=name;
}
/**
 * open modal for existing IC
 * @param {string} name name of IC in localStorage
 */
function openICSettings(name){
    workingIntegrationCircut = new IntegratedCircut();
    workingIntegrationCircut.loadFromJson(name);
    workingIntegrationCircut.name=name;
    createNewCircutModal();
}


/**
 * generate buttons for existing IC's
 * @param {string} name name if IC in localStorage
 */
function createDefaultICUIElement(name){

    var parent = document.createElement("li");
    //temporary sloppy solution.
    var card = document.createElement("div");
    card.setAttribute("class","uk-card uk-card-default")
    parent.appendChild(card);
    var button1 = document.createElement("button");
    button1.setAttribute("class", "uk-button uk-button-secondary uk-width-2-3");
    button1.onclick = function(){
        getIntegratedCircut(name);
    }
    var b1tn = document.createTextNode(name);
    button1.appendChild(b1tn);
    card.appendChild(button1);
    var button2 = document.createElement("button");
    button2.setAttribute("class","uk-button-secondary uk-margin");
    var sp1 = document.createElement("span");
    sp1.onclick=function(){
        openICSettings("cc_"+name);
    }
    sp1.setAttribute("uk-icon","icon: settings");
    button2.appendChild(sp1);
    card.appendChild(button2);
    card.innerHTML+='</button><span class="uk-sortable-handle uk-margin-small-right" uk-icon="icon: table"></span></div>';
    
    
    return parent;

}
/**
 * Update menu for existing IC's
 */
function loadICUIElements(){
    var list = document.getElementById("custom_circuts_list");
    
    ttable = document.getElementById("truthTable");

    for(var key in localStorage){
        if(key.startsWith("cc_")){
            list.appendChild(createDefaultICUIElement(key.substring(3,key.length)));
        }
    }

}

/**
 * Save everything on the board as a file
 */
async function createSaveFile(){

    var output = {};
    output.integratedCircuts = {};
    output.gates = [];
    output.wires = [];
    for(var k in localStorage){
        if(k.startsWith("cc_")){
            output.integratedCircuts[k] = localStorage.getItem(k);
        }
    }
    let inc = 0;
    for(let chunk in gates){
        inc++;
        for(let g in gates[chunk]){
            var gate = gates[chunk][g];
            gate.id = inc; 
            inc++;
            if(gate.isIntegrated == true){
                output.gates.push({type: gate.name, coords: [gate.x,gate.y], id: gate.id});
                continue
            }
            output.gates.push({type: gate.constructor.name, coords: [gate.x,gate.y], id: gate.id});
        }
    }
    for(let w in wires){

        let nodeAInfo = wires[w].nodeA.gate.outNodes.indexOf(wires[w].nodeA);
        let nodeBInfo = wires[w].nodeB.gate.inpNodes.indexOf(wires[w].nodeB);
        let nodeAID = wires[w].nodeA.gate.id;
        let nodeBID = wires[w].nodeB.gate.id;

        output.wires.push({nodeA_ID: nodeAID,nodeB_ID: nodeBID, nodeA_index: nodeAInfo, nodeB_index:nodeBInfo});

    }

    var output = JSON.stringify(output);
    var blob = new Blob(["<gateboard/>"+output],{ type: "text/plain;charset=utf-8" });
    saveAs(blob, "New Gateboard.gateboard");



}


/**
 * Load savefile into a string for processing
 * @param {Blob} file file from input
 */
async function loadFromSave(file){

    console.log(file);
    var content;
    
    var fr = new FileReader();
    fr.customDataDestination = content;
    
    fr.onload = function(){
        doSafely(createStateFromFile,this.result);
    }
    fr.readAsText(file);



}
/**
 * Fill in gates, wires, and IC's based on the state of a savefile.
 * @param {string} data savefile content
 */
function createStateFromFile(data){
    if(!data.startsWith("<gateboard/>")){
        UIkit.notification({message: "Error: Invalid .gateboard file", status:"danger"});
        return;
    }


    if(!confirm("This will overwrite your current workplane, and will update IC's")){
        return;
    }


    var input = data.substring(12,data.length);
    var J = JSON.parse(input);
    console.log(J);
    wires = [];
    gates = [];
    let GIDlist = new Array(J.gates.length);
    for(let i = 0; i < 100; i++){
        gates.push([]);
    }



    for(let IC in J.integratedCircuts){
        localStorage.setItem(IC,J.integratedCircuts[IC]);
    }







    for(let g in J.gates){
        let type = J.gates[g].type;
        let x = J.gates[g].coords[0];
        let y = J.gates[g].coords[1];
        let newgate;
        switch(type){
            case "WireNode":
                newgate = new WireNode(x,y);
                break;
            case "NotGate":
                newgate = new NotGate(x,y);
                break;
            case "OrGate":
                newgate = new OrGate(x,y);
                break;
            case "AndGate":
                newgate = new AndGate(x,y);
                break;
            case "XORGate":
                newgate = new XORGate(x,y);
                break;
            case "PIN":
                newgate = new PIN(x,y);
                break;
            case "LED":
                newgate = new LED(x,y);
                break;
            case "SRFlipFlop":
                newgate = new SRFlipFlop(x,y);
                break;
            default:
                //IC
                if(type.startsWith("cc_")){
                    newgate = new IntegratedCircut(x,y);
                    newgate.loadFromJson(type);
                    
                }else{
                    throw "Invalid gate type: "+type;
                }

        }
        newgate.id = J.gates[g].id;
        GIDlist[newgate.id]= newgate;

        let indx = round(newgate.x/(overall_dim/10));
        let indy = round(newgate.y/(overall_dim/10));
        gates[indx+indy*10].push(newgate);
        newgate.place();
        for(var wire in wires){
            wires[wire].needsUpdate = true;
            
        }
    }

    for(let w in J.wires){
        let nodeA = GIDlist[J.wires[w].nodeA_ID].outNodes[J.wires[w].nodeA_index];
        let nodeB = GIDlist[J.wires[w].nodeB_ID].inpNodes[J.wires[w].nodeB_index];
        var newwire = new Wire(0,0);
        newwire.nodeA=nodeA;
        newwire.nodeB=nodeB;
        nodeB.wires.push(newwire);
        nodeA.wires.push(newwire);
        placeGate(newwire);
    }



}









/**
 * Execute a function safely with a clean UIkit notification for errors.
 * @param {Function} f function
 * @param {*} args arguments for the function
 */
function doSafely(f,args){

    try{
        f(args);
    }catch(error){
        UIkit.notification({message: error, status:"danger"});
    }


}