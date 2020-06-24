class Wire extends Element{
    
    
    
    Wire(int i, int j){
        super(i,j);
    }

    int getc(){
        if(state){
            return color(255,255,255);
        }
        return color(100,100,150);
    }

    void d(){
        worldbuffer.beginDraw();
        worldbuffer.fill(getc());
        worldbuffer.rect(i*ELEM_DIM,j*ELEM_DIM,ELEM_DIM,ELEM_DIM);
        worldbuffer.endDraw();
    }


}