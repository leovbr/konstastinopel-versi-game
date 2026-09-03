export class UI{
  constructor(){
    this.el={
      cityHpText:document.getElementById("cityHpText"),
      cityHpBar:document.getElementById("cityHpBar"),
      waveText:document.getElementById("waveText"),
      waveBar:document.getElementById("waveBar"),
      goldText:document.getElementById("goldText"),
      suppliesText:document.getElementById("suppliesText"),
      scoreText:document.getElementById("scoreText"),
      banner:document.getElementById("banner"),
      start:document.getElementById("start"),
      gameover:document.getElementById("gameover"),
      endingTitle:document.getElementById("endingTitle"),
      endingText:document.getElementById("endingText"),
      finalWave:document.getElementById("finalWave"),
      finalScore:document.getElementById("finalScore"),
      finalGold:document.getElementById("finalGold"),
      archerCost:document.getElementById("archerCost"),
      cannonCost:document.getElementById("cannonCost"),
      repairCost:document.getElementById("repairCost"),
      upgradeCost:document.getElementById("upgradeCost"),
      abilityCost:document.getElementById("abilityCost")
    };
  }

  update(s){
    this.el.cityHpText.textContent=`${Math.max(0,Math.ceil(s.cityHp))} / ${s.maxHp}`;
    this.el.cityHpBar.style.width=`${Math.max(0,s.cityHp/s.maxHp*100)}%`;
    this.el.waveText.textContent=s.wave;
    this.el.waveBar.style.width=`${Math.min(100,s.waveProgress*100)}%`;
    this.el.goldText.textContent=Math.floor(s.gold);
    this.el.suppliesText.textContent=Math.floor(s.supplies);
    this.el.scoreText.textContent=Math.floor(s.score);

    this.el.archerCost.textContent=`${s.costs.archer}G`;
    this.el.cannonCost.textContent=`${s.costs.cannon}G`;
    this.el.repairCost.textContent=`${s.costs.repair}G`;
    this.el.upgradeCost.textContent=`${s.costs.upgrade}G`;
    this.el.abilityCost.textContent=`${s.costs.ability}S`;
  }

  banner(text){
    this.el.banner.textContent=text;
    this.el.banner.style.opacity="1";

    clearTimeout(this.bannerTimer);

    this.bannerTimer=setTimeout(
      ()=>this.el.banner.style.opacity="0",
      1200
    );
  }

  hideStart(){
    this.el.start.classList.add("hidden");
  }

  gameOver(s,survived){
    this.el.endingTitle.textContent=
      survived?"CONSTANTINOPLE SURVIVES":"THE CITY HAS FALLEN";

    this.el.endingTitle.style.color=
      survived?"#d7b45e":"#a94b3f";

    this.el.endingText.textContent=
      survived
      ?"Against impossible odds, the walls held. History changed tonight."
      :"The final gate has broken. The city falls after the last defense.";

    this.el.finalWave.textContent=s.wave;
    this.el.finalScore.textContent=Math.floor(s.score);
    this.el.finalGold.textContent=Math.floor(s.gold);

    this.el.gameover.classList.remove("hidden");
  }

  hideGameOver(){
    this.el.gameover.classList.add("hidden");
  }
}
