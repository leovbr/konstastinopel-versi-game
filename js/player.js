
export class Player{
  constructor(){
    this.damage=30; this.fireCooldown=380; this.lastShot=-9999;
    this.level=1;
  }
  shoot(game,x,y,now){
    if(now-this.lastShot<this.fireCooldown)return false;
    this.lastShot=now;
    const sx=game.width/2,sy=game.height*.70;
    const dx=x-sx,dy=y-sy,len=Math.hypot(dx,dy)||1;
    game.projectiles.push({x:sx,y:sy,vx:dx/len*760,vy:dy/len*760,life:1.5,damage:this.damage});
    game.particles.burst(sx,sy,5,"spark");
    return true;
  }
}
