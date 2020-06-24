final int ELEM_DIM = 25;
int currentElement = 0;
int currentElementDir= 0;
PGraphics worldbuffer;
void setup(){
    fullScreen(P2D);
    world = new Element[width/ELEM_DIM][height/ELEM_DIM];
    thread("backgroundThread");
    worldbuffer = createGraphics(width,height);
    worldbuffer.beginDraw();
    worldbuffer.background(0);
    worldbuffer.endDraw();
}

void triangleSimple(float x, float y, float w, float h){
    // A wrapper for standard triangle() command. 
    // triangleSimple has the lower left corner as x,y 
    worldbuffer.pushMatrix();
    worldbuffer.stroke(255);
    worldbuffer.translate(x+w/2,y+w/2);
    worldbuffer.rotate(radians(90*currentElementDir));
    
    worldbuffer.ellipse(0,-w/2,5,5);
    worldbuffer.ellipse(0,0,1,1);
    worldbuffer.popMatrix();

}
void draw(){
    



    image(worldbuffer,0,0);
    fill(255,255,255,100);
    rect((int)(mouseX/ELEM_DIM)*ELEM_DIM, (int)(mouseY/ELEM_DIM)*ELEM_DIM, ELEM_DIM, ELEM_DIM);
    pushMatrix();
    stroke(255);
    int x = (int)((mouseX/ELEM_DIM))*ELEM_DIM;
    int y = (int)((mouseY/ELEM_DIM))*ELEM_DIM;
    int w = ELEM_DIM;
    int h = w;
    translate(x+w/2,y+w/2);
    rotate(radians(90*currentElementDir));
    
    ellipse(0,-w/2,5,5);
    ellipse(0,0,1,1);
    popMatrix();
    switch (currentElement) {
        case 0:
            new Wire(0,0);
            break;
        case 1:
            new Director(0,0,currentElementDir);
        default:
            new Empty(0,0);
            break;
    }

}

int incn(int n,int max){
    n++;
    if(n>max)return 0;
    return n;
}

void mousePressed(){
    
    tickStuff=true;
    Element adder;
    switch (currentElement) {
        case 0:
            adder = new Wire((int)(mouseX/ELEM_DIM),(int)(mouseY/ELEM_DIM));
            break;
        case 1:
            adder = new Director((int)(mouseX/ELEM_DIM),(int)(mouseY/ELEM_DIM),0);
        default:
            adder=new Empty(0,0);
            break;
    }
    world[(int)(mouseX/ELEM_DIM)][(int)(mouseY/ELEM_DIM)] = adder;



}

void keyPressed(){
    if(key == ' '){
        world[(int)(mouseX/ELEM_DIM)][(int)(mouseY/ELEM_DIM)] = new Empty((int)(mouseX/ELEM_DIM),(int)(mouseY/ELEM_DIM));
    }else if (key >= '0' && key <= '9'){
        int newnum = int(new String()+key);
        currentElement=newnum;
        
    }else{
        currentElementDir=incn(currentElementDir,3);
    }

}