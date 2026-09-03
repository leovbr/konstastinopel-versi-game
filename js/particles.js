export class Particles{
  constructor(){this.items=[]}

  burst(x,y,n,kind="dust"){
    for(let i=0;i<n;i++)this.items.push({
      x,y,
      vx:(Math.random()-.5)*180,
      vy:(Math.random()-.5)*180-20,
      life:.35+Math.random()*.45,
      max:.8,
      size:2+Math.random()*3,
      kind
    });
  }

  update(dt){
    for(let i=this.items.length-1;i>=0;i--){
      const p=this.items[i];
      p.x+=p.vx*dt;
      p.y+=p.vy*dt;
      p.vy+=220*dt;
      p.life-=dt;

      if(p.life<=0)this.items.splice(i,1);
    }
  }

  draw(ctx){
    for(const p of this.items){
      ctx.globalAlpha=Math.max(0,p.life/p.max);
      ctx.fillStyle=p.kind==="fire"?"#d88935":"#c6a766";
      ctx.fillRect(p.x,p.y,p.size,p.size);
    }

    ctx.globalAlpha=1;
  }
}
