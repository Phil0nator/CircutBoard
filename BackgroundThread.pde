boolean tickStuff = false;
void backgroundThread(){

    while (true){
        if(tickStuff){
            tick();
        }
    }

}
void tick(){}