var modaldiv;
var maindiv;
var ttable;
var ttablebody;
function createNewCircutModal(){

    modaldiv = document.getElementById("integratedCircutConfig");
    maindiv = document.getElementById("icc-main");
    if(workingIntegrationCircut.name!=undefined)
    document.getElementById("icc-name").value = workingIntegrationCircut.name.substring(3,workingIntegrationCircut.name.length);
    maindiv.innerHTML="";
    _mode_ = CursorModes.INMODAL;
    UIkit.modal(modaldiv).show();

}

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
function newCircut_Cancel(){
    workingIntegrationCircut = undefined;
    _mode_ = CursorModes.MOVEMENT;
    UIkit.modal(modaldiv).hide();
    var table = document.getElementById("truthTable");
    table.innerHTML="";
}

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

async function finishTruthTableOp(len,array,oarrtest,c,table){

    await generateAllBinaryStrings(len,array,0,oarrtest,c);
    
    table.appendChild(ttablebody);
    document.getElementById("spinnerDiv").innerHTML="";

}


function getIntegratedCircut(name){
    circutInHand = new IntegratedCircut(0,0);
    circutInHand.loadFromJson(name);
    circutInHand.name=name;
}

function openICSettings(name){
    workingIntegrationCircut = new IntegratedCircut();
    workingIntegrationCircut.loadFromJson(name);
    workingIntegrationCircut.name=name;
    createNewCircutModal();
}



function createDefaultICUIElement(name){

    var parent = document.createElement("li");
    parent.innerHTML = '<button class="uk-button uk-button-default uk-width-2-3" onclick="getIntegratedCircut(\'cc_'+name+'\');">'+name+'</button><button class="uk-button-default uk-margin"><span class=""uk-icon="icon: settings" onclick="openICSettings(\'cc_'+name+'\')"></span></button>'
    return parent;

}

function loadICUIElements(){
    var list = document.getElementById("custom_circuts_list");
    
    ttable = document.getElementById("truthTable");

    for(var key in localStorage){
        if(key.startsWith("cc_")){
            list.appendChild(createDefaultICUIElement(key.substring(3,key.length)));
        }
    }

}


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

function createStateFromFile(data){
    if(!data.startsWith("<gateboard/>")){
        UIkit.notification({message: "Error: Invalid .gateboard file", status:"danger"});
        return;
    }
    var input = data.substring(12,data.length);
    var J = JSON.parse(input);
    console.log(J);



}










function doSafely(f,args){

    try{
        f(args);
    }catch(error){
        UIkit.notification({message: error, status:"danger"});
    }


}