/**
 * Worlplane Dimentions
 */
const overall_dim = 5000;

const node_color = [50,100,255];
/**
 * Node mouseover
 */
const node_mover = [100,150,255];
/**
 * backround color
 */
const bg_gscale = [50,150,50];
/**
 * node radius
 */
const node_r = 10;
/**
 * Range allowed away from a wire for a click to count
 */
const wire_click_slack = 5;
/**
 * standard pixelwidth for an IC
 */
const IC_Width = 75;


const NotificationTimeout = 1200;

const ZoomFactor = 53;



var bg;

/**
 * {PGraphics} graphics buffer
 */
var overlay;
//Panning
var translationx = -overall_dim/2;
var translationy = -overall_dim/2;
//Overall scale
var scalar = 1;
//Dragging
var dragog = [];
var dragend = [];
//Enum for usage mode
const CursorModes = {
    MOVEMENT: 'Movement',
    EDIT: 'Edit',
    INTERACT: 'Interact',
    INTEGRATE: "Integrate",
    INMODAL: "Inmodal",
    COPYSELECT: "Copyselect",
    CUTSELECT: "Cutselect"
}
var _mode_ = CursorModes.MOVEMENT;

//is shift button pressed
var shiftDown = false;
//Currently held gate
var circutInHand = undefined;
//node that the mouse is over
var nodeInHand = undefined;
//Does the entire graphics buffer need to be redrawn?
var fullRedraw = false;

/**
 * A bounding box for the querried newIC area
 */
var integrationArea = [];
/**
 * IC that is being created or edited
 */
var workingIntegrationCircut;

/**
 * Usability
 */
var justPlacedWire = false;
var lastWirePlace = Date.now();


/**
 * Used to store what the user is copying and pasting without interfearing with the real computer clipboard
 */
var clipboard = "";
var contextmenu;
var placeablesmenu;



