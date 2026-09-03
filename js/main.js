import { Game } from "./game.js";
import { UI } from "./ui.js";

const canvas=document.getElementById("game");
const ui=new UI();
const game=new Game(canvas,ui);

document.getElementById("startBtn").addEventListener("click",()=>game.start());
document.getElementById("restartBtn").addEventListener("click",()=>game.reset());

for(const button of document.querySelectorAll("#controls button")){
  button.addEventListener("click",()=>game.command(button.dataset.action));
}

game.run();
