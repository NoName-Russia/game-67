loadGame();

function calculateLevel(){return Math.floor(game.experience/100)+1;}
function addExperience(amount){game.experience+=amount;const newLevel=calculateLevel();if(newLevel>game.level){game.level=newLevel;notify("🎉 Новый уровень: "+game.level);}}
function animateCharacter(){const c=document.getElementById("character");if(!c)return;c.classList.remove("clicking");void c.offsetWidth;c.classList.add("clicking");setTimeout(()=>c.classList.remove("clicking"),200);}
function updateCharacterSkin(){const c=document.getElementById("character");if(!c)return;c.classList.remove("classic","neon","cyber","galaxy","golden");c.classList.add(game.selectedSkin||"classic");}
function click67(){const booster=window.get67Multiplier?window.get67Multiplier():1;const earned=game.clickPower*game.multiplier*booster;game.coins+=earned;game.totalEarned+=earned;game.totalClicks++;animateCharacter();addExperience(1);checkMissions();checkAchievements();updateGame();}
function autoIncome(){if(game.autoPower<=0)return;const booster=window.get67Multiplier?window.get67Multiplier():1;const earned=game.autoPower*game.multiplier*booster;game.coins+=earned;game.totalEarned+=earned;addExperience(game.autoPower);checkMissions();checkAchievements();updateGame();}
function updateGame(){document.getElementById("coins").textContent=formatNumber(game.coins);document.getElementById("level").textContent=game.level;document.getElementById("perSecond").textContent=game.autoPower;document.getElementById("clickPower").textContent=game.clickPower*game.multiplier;document.getElementById("clickCost").textContent=formatNumber(getClickCost());document.getElementById("autoCost").textContent=formatNumber(getAutoCost());document.getElementById("multiplierCost").textContent=formatNumber(getMultiplierCost());updateCharacterSkin();renderSkins();renderMissions();renderAchievements();saveGame();window.dispatchEvent(new Event("67:render"));}
function formatNumber(number){if(number<1000)return Math.floor(number);if(number<1000000)return(number/1000).toFixed(1)+"K";if(number<1000000000)return(number/1000000).toFixed(1)+"M";return(number/1000000000).toFixed(1)+"B";}
function notify(message){const e=document.getElementById("notification");if(!e)return;e.textContent=message;e.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>e.classList.remove("show"),1800);}
function claimDailyReward(){const today=new Date().toISOString().slice(0,10);if(game.lastDailyReward===today){notify("🎁 Ты уже получил бонус сегодня!");return;}const reward=500+game.level*100;game.coins+=reward;game.totalEarned+=reward;game.lastDailyReward=today;notify("🎁 Получено +"+reward+" 67!");updateGame();}

document.getElementById("clickButton").addEventListener("click",click67);
document.getElementById("buyClick").addEventListener("click",buyClickUpgrade);
document.getElementById("buyAuto").addEventListener("click",buyAutoUpgrade);
document.getElementById("buyMultiplier").addEventListener("click",buyMultiplierUpgrade);
document.getElementById("dailyReward").addEventListener("click",claimDailyReward);
document.getElementById("resetGame").addEventListener("click",()=>{if(!confirm("Удалить весь прогресс?"))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem("67_features_v1");localStorage.removeItem("67_flight_best");location.reload();});
setInterval(autoIncome,1000);
updateGame();