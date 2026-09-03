export function wavePlan(wave){
  const plan=[];
  const count=5+Math.floor(wave*1.8);

  for(let i=0;i<count;i++){
    let type="soldier";
    const r=Math.random();

    if(wave>=3 && r<.13) type="archer";
    if(wave>=4 && r<.10) type="janissary";
    if(wave>=7 && r<.07) type="cavalry";
    if(wave>=9 && r<.045) type="ram";

    plan.push(type);
  }

  if(wave%5===0) plan.push("commander");

  return plan;
}
