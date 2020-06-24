class Director extends Element{
    int dir;
    Director(int i, int j, int dir){
        super(i,j);
        this.dir=dir;
    }

    void d(){
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