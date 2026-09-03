export const TYPES={
  soldier:{hp:45,speed:30,damage:4,reward:12,radius:13},
  archer:{hp:32,speed:26,damage:3,reward:16,radius:12},
  janissary:{hp:85,speed:22,damage:7,reward:30,radius:16},
  cavalry:{hp:105,speed:55,damage:10,reward:42,radius:18},
  ram:{hp:260,speed:11,damage:20,reward:90,radius:25},
  commander:{hp:650,speed:15,damage:25,reward:250,radius:29}
};

export function makeEnemy(type,canvas,wave){
  const t=TYPES[type], side=Math.random()<.5?-1:1;
  const scale=1+Math.max(0,wave-1)*.055;
  return {
    type,x:side<0?-40:canvas.width+40,
    y:canvas.height*.67-Math.random()*canvas.height*.12,
    hp:t.hp*scale,maxHp:t.hp*scale,
    speed:t.speed*(.9+Math.random()*.25)*(1+wave*.008),
    damage:t.damage*(1+wave*.035),reward:t.reward,radius:t.radius,
    hit:0,attack:0,side
  };
}
