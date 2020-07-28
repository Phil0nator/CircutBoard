var modaldiv;
var maindiv;
function createNewCircutModal(){

    modaldiv = document.getElementById("integratedCircutConfig");
    maindiv = document.getElementById("icc-main");
    maindiv.innerHTML="";
    _mode_ = CursorModes.EDIT;
    UIkit.modal(modaldiv).show();

}

function newCircut_Save(){
    var name = document.getElementById("icc-name").value;
    document.getElementById('icc-name').value="";
    saveIntegratedCircut(workingIntegrationCircut, name);
    _mode_ = CursorModes.MOVEMENT;
    document.getElementById("custom_circuts_list").innerHTML="";
    loadICUIElements();

}
function newCircut_Cancel(){
    workingIntegrationCircut = undefined;
    _mode_ = CursorModes.MOVEMENT;
    UIkit.modal(modaldiv).hide();
}

function saveIntegratedCircut(circut, name){

    var gates = circut.gates;
    var wires = circut.wires;
    var output = {};
    output.gates = [];
    output.wires = [];
    output.inputs = [];
    output.outputs = [];
    for(var g in gates){
        //console.log(gates[g].createJSON());
        if(!gates[g].isInputPin&&!gates[g].isLEDOut)
        output.gates.push(gates[g].createJSON());
    }
    for(var w in wires){
        output.wires.push(wires[w].createJSON());
    }
    for(var n in circut.s_inputs){
        output.inputs.push(circut.s_inputs[n].createJSON());
    }
    for(var n in circut.s_outputs){
        output.outputs.push(circut.s_outputs[n].createJSON());
    }
    
    

    localStorage.setItem("cc_"+name,JSON.stringify(output));

}








function generateAllBinaryStrings(n,arr,i,oarr,c){
    if(i == n) {
        console.log(arr.concat());
        console.log(passTest(c,arr.concat()));
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
    circut.update();
    for(var i = 0 ; i < circut.outNodes.length;i++){
        circut.outputs[i]=circut.outNodes[i].value;
    }
    return circut.outputs.concat();
}


function generateTruthTable(name){
    var c = new IntegratedCircut();
    c.loadFromJson(localStorage.getItem(name));
    c.name=name;
    var len = c.inpNodes.length;
    var io_i = [];
    var io_o = [];
    var oarrtest = [];
    var array = new Array(len);
    generateAllBinaryStrings(len,array,0,oarrtest,c);
    

    


}


function getIntegratedCircut(name){
    circutInHand = new IntegratedCircut();
    circutInHand.loadFromJson(localStorage.getItem(name));
    circutInHand.name=name;
}

function openICSettings(name){

}



function createDefaultICUIElement(name){

    var parent = document.createElement("li");
    parent.innerHTML = '<button class="uk-button uk-button-default uk-width-2-3" onclick="getIntegratedCircut(\'cc_'+name+'\');">'+name+'</button><button class="uk-button-default uk-margin"><span class=""uk-icon="icon: settings" onclick="openICSettings(\''+name+'\')"></span></button>'
    return parent;

}

function loadICUIElements(){
    var list = document.getElementById("custom_circuts_list");
    
    for(var key in localStorage){
        console.log(key);
        if(key.startsWith("cc_")){
            list.appendChild(createDefaultICUIElement(key.substring(3,key.length)));
        }
    }

}

