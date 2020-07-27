function createNewCircutModal(){

    var modaldiv = document.getElementById("integratedCircutConfig");
    var maindiv = document.getElementById("icc-main");
    maindiv.innerHTML="";
    _mode_ = CursorModes.EDIT;
    UIkit.modal(modaldiv).show();
    saveIntegratedCircut(workingIntegrationCircut, "new circut");

}


function saveIntegratedCircut(circut, name){

    var gates = circut.gates;
    var wires = circut.wires;
    

}