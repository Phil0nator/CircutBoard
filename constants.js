const overall_dim = 10000;
const node_color = [50,100,255];
const node_mover = [100,150,255];
const bg_gscale = 150;
const node_r = 10;

var bg;
var overlay;

var translationx = -overall_dim/2;
var translationy = -overall_dim/2;
var scalar = 1;

var dragog = [];
var dragend = [];

const CursorModes = {
    MOVEMENT: 'Movement',
    EDIT: 'Edit',
    INTERACT: 'Interact'
}
var _mode_ = CursorModes.MOVEMENT;


var circutInHand = undefined;
var nodeInHand = undefined;

var fullRedraw = false;