import {Player} from "./player.js";
import {City} from "./city.js";
import {Particles} from "./particles.js";
import {makeEnemy,wavePlan,TYPES} from "./entities.js";

export class Game{
  constructor(canvas,ui){
    this.canvas=canvas;this.ctx=canvas.getContext("2d");this.ui=ui;
    this.player=new Player();this.city=new City();this.particles=new Particles();
    this.enemies=[];this.projectiles=[];this.floaters=[];this.queue=[];
    this.active=false;this.wave=1;this.score=0;this.gold=0;this.supplies=60;
    this.spawnClock=0;this.waveClock=0;this.flash=0;this.shake=0;this.last=performance.now();
    this.costs={archer:35,cannon:90,repair:40,upgrade:80,ability:35};
    this.archers=0;this.cannonShots=0;
    this.resize();addEventListener("resize",()=>this.resize());
    canvas.addEventListener("pointermove",e=>{this.aim={x:e.clientX,y:e.clientY}});
    canvas.addEventListener("pointerdown",e=>{this.aim={x:e.clientX,y:e.clientY};this.fire()});
    this.aim={x:innerWidth/2,y:innerHeight/2};
  }
  resize(){this.width=innerWidth;this.height=innerHeight;this.canvas.width=this.width*devicePixelRatio;this.canvas.height=this.height*devicePixelRatio;this.canvas.style.width=this.width+"px";this.canvas.style.height=this.height+"px";this.ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}
  start(){this.ui.hideStart();this.resetState();this.active=true;this.nextWave(true)}
  reset(){this.ui.hideGameOver();this.ui.hideStart();this.resetState();this.active=true;this.nextWave(true)}
  resetState(){this.city=new City();this.player=new Player();this.particles=new Particles();this.enemies=[];this.projectiles=[];this.floaters=[];this.wave=0;this.score=0;this.gold=80;this.supplies=60;this.queue=[];this.spawnClock=0;this.waveClock=0}
  nextWave(first=false){
    this.wave++;
    this.queue=wavePlan(this.wave);
    this.waveClock=0;
    this.ui.banner(first?"THE SIEGE BEGINS":(this.wave%5===0?`⚠ COMMANDER WAVE ${this.wave}`:`WAVE ${this.wave}`));
  }
  fire(){if(!this.active)return;this.player.shoot(this,this.aim.x,this.aim.y,performance.now())}
  command(action){
    if(!this.active)return;
    if(action==="archer"&&this.gold>=this.costs.archer){this.gold-=this.costs.archer;this.archers++;this.costs.archer=Math.floor(this.costs.archer*1.35);this.ui.banner("ARCHER RECRUITED")}
    else if(action==="cannon"&&this.gold>=this.costs.cannon){this.gold-=this.costs.cannon;this.city.cannons++;this.costs.cannon=Math.floor(this.costs.cannon*1.45);this.ui.banner("CANNON INSTALLED")}
    else if(action==="repair"&&this.gold>=this.costs.repair){this.gold-=this.costs.repair;this.city.repair(25);this.costs.repair=Math.floor(this.costs.repair*1.3);this.ui.banner("WALLS REPAIRED")}
    else if(action==="upgrade"&&this.gold>=this.costs.upgrade){this.gold-=this.costs.upgrade;this.player.damage+=12;this.player.fireCooldown=Math.max(150,this.player.fireCooldown-25);this.costs.upgrade=Math.floor(this.costs.upgrade*1.5);this.ui.banner("WEAPONS UPGRADED")}
    else if(action==="ability"&&this.supplies>=this.costs.ability){this.supplies-=this.costs.ability;this.fireRain();this.ui.banner("FIRE RAIN")}
    else this.ui.banner("NOT ENOUGH RESOURCES");
  }
  fireRain(){
    for(const e of [...this.enemies]){e.hp-=this.player.damage*2.2;e.hit=.2;this.particles.burst(e.x,e.y,10,"fire")}
    this.shake=10;
  }
  spawn(type){
    this.enemies.push(makeEnemy(type,this,this.wave));
  }
  update(dt){
    if(!this.active)return;
    this.waveClock+=dt;this.spawnClock+=dt;
    if(this.queue.length && this.spawnClock>.52){this.spawn(this.queue.shift());this.spawnClock=0}
    if(!this.queue.length&&!this.enemies.length&&this.waveClock>1)this.nextWave();
    for(let i=this.projectiles.length-1;i>=0;i--){
      const p=this.projectiles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
      let hit=false;
      for(let j=this.enemies.length-1;j>=0;j--){
        const e=this.enemies[j];
        if(Math.hypot(p.x-e.x,p.y-e.y)<e.radius+5){
          e.hp-=p.damage;e.hit=.12;this.particles.burst(p.x,p.y,4,"spark");this.projectiles.splice(i,1);hit=true;
          if(e.hp<=0)this.killEnemy(j);
          break;
        }
      }
      if(!hit&&p.life<=0)this.projectiles.splice(i,1);
    }
    for(let i=this.enemies.length-1;i>=0;i--){
      const e=this.enemies[i];e.hit=Math.max(0,e.hit-dt);e.attack=Math.max(0,e.attack-dt);
      const tx=this.width/2,ty=this.height*.70,dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy);
      if(d>55){e.x+=dx/d*e.speed*dt;e.y+=dy/d*e.speed*dt}
      else if(e.attack<=0){this.city.damage(e.damage);e.attack=1.1;this.shake=5;this.particles.burst(tx,ty,8,"dust");if(this.city.hp<=0){this.end(false);return}}
    }
    this.autoDefenders(dt);
    this.particles.update(dt);
    for(let i=this.floaters.length-1;i>=0;i--){this.floaters[i].y-=25*dt;this.floaters[i].life-=dt;if(this.floaters[i].life<=0)this.floaters.splice(i,1)}
    this.shake=Math.max(0,this.shake-dt*18);this.flash=Math.max(0,this.flash-dt*2);
    this.ui.update(this.state());
  }
  autoDefenders(dt){
    if(this.archers>0&&Math.random()<dt*this.archers*.65){
      const target=this.enemies[Math.floor(Math.random()*this.enemies.length)];
      if(target){target.hp-=this.player.damage*.65;target.hit=.08;this.particles.burst(target.x,target.y,3,"spark");if(target.hp<=0)this.killEnemy(this.enemies.indexOf(target))}
    }
    if(this.city.cannons>0&&Math.random()<dt*this.city.cannons*.28){
      const target=this.enemies[Math.floor(Math.random()*this.enemies.length)];
      if(target){target.hp-=this.player.damage*2.5;this.particles.burst(target.x,target.y,14,"fire");this.shake=5;if(target.hp<=0)this.killEnemy(this.enemies.indexOf(target))}
    }
  }
  killEnemy(i){
    if(i<0)return;const e=this.enemies[i];this.enemies.splice(i,1);
    const bonus=e.type==="commander"?250:0;this.gold+=e.reward;this.supplies+=e.type==="commander"?15:1;this.score+=Math.round(e.reward*10)+bonus;
    this.floaters.push({x:e.x,y:e.y,text:`+${e.reward}G`,life:1});
    this.particles.burst(e.x,e.y,e.type==="commander"?35:13,e.type==="commander"?"fire":"dust");
  }
  end(survived){this.active=false;this.ui.gameOver(this.state(),survived)}
  state(){return{cityHp:this.city.hp,maxHp:this.city.maxHp,wave:this.wave,waveProgress:this.queue.length?1-this.queue.length/Math.max(1,5+Math.floor(this.wave*1.8)):0,gold:this.gold,supplies:this.supplies,score:this.score,costs:this.costs}}
  draw(){
    const c=this.ctx,w=this.width,h=this.height;c.save();
    if(this.shake)c.translate((Math.random()-.5)*this.shake,(Math.random()-.5)*this.shake);
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#070d18");sky.addColorStop(.6,"#11151a");sky.addColorStop(1,"#24150b");c.fillStyle=sky;c.fillRect(0,0,w,h);
    for(let i=0;i<70;i++){c.fillStyle="#ffffff88";c.fillRect((i*137)%w,(i*79)%(h*.5),1,1)}
    c.fillStyle="#d5cfb8";c.beginPath();c.arc(w*.78,h*.17,35,0,Math.PI*2);c.fill();
    c.fillStyle="#1b1610";c.fillRect(0,h*.80,w,h*.2);
    this.city.draw(c,w,h);
    for(const p of this.projectiles){c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.vy,p.vx));c.strokeStyle="#e0c17b";c.lineWidth=3;c.beginPath();c.moveTo(-12,0);c.lineTo(10,0);c.stroke();c.restore()}
    for(const e of this.enemies)this.drawEnemy(c,e);
    this.particles.draw(c);
    for(const f of this.floaters){c.globalAlpha=f.life;c.fillStyle="#e0c06b";c.font="bold 14px Georgia";c.textAlign="center";c.fillText(f.text,f.x,f.y)}
    this.drawCrosshair(c);
    c.restore();
  }
  drawEnemy(c,e){
    c.save();if(e.hit)c.globalAlpha=.55;const color={soldier:"#30353a",archer:"#394036",janissary:"#533c2b",cavalry:"#44343b",ram:"#43362a",commander:"#641d1d"}[e.type];
    c.fillStyle="#0008";c.beginPath();c.ellipse(e.x,e.y+e.radius,e.radius,e.radius*.4,0,0,Math.PI*2);c.fill();
    c.fillStyle=color;c.beginPath();c.arc(e.x,e.y,e.radius,0,Math.PI*2);c.fill();
    c.fillStyle="#77756d";c.beginPath();c.arc(e.x,e.y-e.radius*.25,e.radius*.7,Math.PI,0);c.fill();
    c.strokeStyle="#9d8761";c.lineWidth=2;c.beginPath();c.moveTo(e.x,e.y+e.radius);c.lineTo(e.x+(e.side<0?-1:1)*25,e.y-28);c.stroke();
    const bw=e.radius*2.2;c.fillStyle="#210b09";c.fillRect(e.x-bw/2,e.y-e.radius-9,bw,4);c.fillStyle=e.type==="commander"?"#d18b3c":"#a44237";c.fillRect(e.x-bw/2,e.y-e.radius-9,bw*Math.max(0,e.hp/e.maxHp),4);
    if(e.type==="commander"){c.fillStyle="#dfbd64";c.font="bold 11px Georgia";c.textAlign="center";c.fillText("COMMANDER",e.x,e.y-e.radius-15)}
    c.restore();
  }
  drawCrosshair(c){if(!this.active)return;c.strokeStyle="#ddc078aa";c.lineWidth=1;c.beginPath();c.arc(this.aim.x,this.aim.y,11,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(this.aim.x-19,this.aim.y);c.lineTo(this.aim.x-6,this.aim.y);c.moveTo(this.aim.x+6,this.aim.y);c.lineTo(this.aim.x+19,this.aim.y);c.moveTo(this.aim.x,this.aim.y-19);c.lineTo(this.aim.x,this.aim.y-6);c.moveTo(this.aim.x,this.aim.y+6);c.lineTo(this.aim.x,this.aim.y+19);c.stroke()}
  run(){const frame=now=>{const dt=Math.min(.033,(now-this.last)/1000);this.last=now;this.update(dt);this.draw();requestAnimationFrame(frame)};requestAnimationFrame(frame)}
}
