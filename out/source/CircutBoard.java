import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class CircutBoard extends PApplet {

final int ELEM_DIM = 25;
int currentElement = 0;
int currentElementDir= 0;
PGraphics worldbuffer;
public void setup(){
    
    world = new Element[width/ELEM_DIM][height/ELEM_DIM];
    thread("backgroundThread");
    worldbuffer = createGraphics(width,height);
    worldbuffer.beginDraw();
    worldbuffer.background(0);
    worldbuffer.endDraw();
}

public void triangleSimple(float x, float y, float w, float h){
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
public void draw(){
    



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

public int incn(int n,int max){
    n++;
    if(n>max)return 0;
    return n;
}

public void mousePressed(){
    
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

public void keyPressed(){
    if(key == ' '){
        world[(int)(mouseX/ELEM_DIM)][(int)(mouseY/ELEM_DIM)] = new Empty((int)(mouseX/ELEM_DIM),(int)(mouseY/ELEM_DIM));
    }else if (key >= '0' && key <= '9'){
        int newnum = PApplet.parseInt(new String()+key);
        currentElement=newnum;
        
    }else{
        currentElementDir=incn(currentElementDir,3);
    }

}
boolean tickStuff = false;
public void backgroundThread(){

    while (true){
        if(tickStuff){
            tick();
        }
    }

}
public void tick(){}
class Director extends Element{
    int dir;
    Director(int i, int j, int dir){
        super(i,j);
        this.dir=dir;
    }

    public void d(){
        worldbuffer.beginDraw();
        worldbuffer.fill(100,100,100);
        worldbuffer.rect(i*ELEM_DIM,j*ELEM_DIM,ELEM_DIM,ELEM_DIM);
        worldbuffer.pushMatrix();
        worldbuffer.rotate(radians(90*dir));
        triangleSimple(i*ELEM_DIM,j*ELEM_DIM,ELEM_DIM,ELEM_DIM);
        worldbuffer.popMatrix();
        worldbuffer.endDraw();
    }


}
abstract class Element{


    protected int i;
    protected int j;
    protected boolean state = false;
    protected double status=0.0d;



    Element(int i, int j){
        this.i=i;
        this.j=j;
        d();
    }

    
    public void d(){
        return;
    }



}
class Empty extends Element{
    Empty(int i, int j){
        super(i,j);
    }
    public void d(){
        worldbuffer.beginDraw();
        worldbuffer.fill(0);
        worldbuffer.rect(i*ELEM_DIM,j*ELEM_DIM,ELEM_DIM,ELEM_DIM);
        worldbuffer.endDraw();
    }
}

Element[][] world;
class Wire extends Element{
    
    
    
    Wire(int i, int j){
        super(i,j);
    }

    public int getc(){
        if(state){
            return color(255,255,255);
        }
        return color(100,100,150);
    }

    public void d(){
        worldbuffer.beginDraw();
        worldbuffer.fill(getc());
        worldbuffer.rect(i*ELEM_DIM,j*ELEM_DIM,ELEM_DIM,ELEM_DIM);
        worldbuffer.endDraw();
    }


}
  public void settings() {  fullScreen(P2D); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "CircutBoard" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
