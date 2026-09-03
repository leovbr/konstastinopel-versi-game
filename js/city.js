export class City{
  constructor(){
    this.maxHp=100;
    this.hp=100;
    this.cannons=0;
  }

  repair(amount){
    this.hp=Math.min(this.maxHp,this.hp+amount);
  }

  damage(amount){
    this.hp=Math.max(0,this.hp-amount);
  }

  draw(c,w,h){
    const y=h*.70;

    // Walls
    c.fillStyle="#4a4034";
    c.fillRect(0,y,w,h*.13);

    // Wall blocks
    c.strokeStyle="#6d5b47";
    c.lineWidth=2;
    for(let x=0;x<w;x+=42){
      c.strokeRect(x,y,42,h*.065);
      c.strokeRect(x+21,y+h*.065,42,h*.065);
    }

    // Towers
    for(const x of [w*.12,w*.88]){
      c.fillStyle="#554938";
      c.fillRect(x-35,y-90,70,90);

      c.fillStyle="#665742";
      c.fillRect(x-42,y-98,84,16);

      c.fillStyle="#191715";
      c.fillRect(x-8,y-55,16,28);
    }

    // Main gate
    c.fillStyle="#2b241d";
    c.fillRect(w*.46,y-70,w*.08,70);

    c.fillStyle="#151310";
    c.fillRect(w*.485,y-48,w*.03,48);

    // City silhouettes
    c.fillStyle="#302921";
    for(let i=0;i<11;i++){
      const x=w*.22+i*w*.055;
      const bh=25+(i%4)*13;
      c.fillRect(x,y-bh,30,bh);
    }

    // Cannon positions
    for(let i=0;i<this.cannons;i++){
      const x=w*.35+i*45;
      c.fillStyle="#171717";
      c.beginPath();
      c.arc(x,y-18,10,0,Math.PI*2);
      c.fill();

      c.strokeStyle="#292929";
      c.lineWidth=5;
      c.beginPath();
      c.moveTo(x,y-18);
      c.lineTo(x+24,y-28);
      c.stroke();
    }
  }
}
