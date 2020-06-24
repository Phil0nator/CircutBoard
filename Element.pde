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

    
    void d(){
        return;
    }



}
class Empty extends Element{
    Empty(int i, int j){
        super(i,j);
    }
    void d(){
        worldbuffer.beginDraw();
        worldbuffer.fill(0);
        worldbuffer.rect(i*ELEM_DIM,j*ELEM_DIM,ELEM_DIM,ELEM_DIM);
        worldbuffer.endDraw();
    }
}

Element[][] world;