// HUD Manager - Renders all heads-up display elements (Single Responsibility)

import { settings } from "./settings.js";

export class HUDManager {
  constructor() {
    this.elements = {
      hud: document.getElementById("hud"),
      controls: document.getElementById("controls"),
      score: document.getElementById("score"),
      highScore: document.getElementById("highScore"),
      highScoreHolderName: document.getElementById("highScoreHolderName"),
      level: document.getElementById("level"),
      lives: document.getElementById("lives"),
      activeEffects: document.getElementById("active-effects-container"),
    };
  }

  hide() {
    this.elements.hud.style.display = "none";
    this.elements.controls.style.display = "none";
  }

  show() {
    this.elements.hud.style.display = "block";
    this.elements.controls.style.display = "flex";
  }

  update(gameState) {
    this.updateScore(gameState.score, gameState.highScore, gameState.highScoreHolder);
    this.updateLevel(gameState.level);
    this.updateLives(gameState.lives);
    this.updateActiveEffects(gameState.player, gameState.playerPowerUps);
  }

  updateScore(score, highScore, highScoreHolder) {
    this.elements.score.textContent = score;
    this.elements.highScore.textContent = highScore;
    if (this.elements.highScoreHolderName && highScoreHolder) {
      this.elements.highScoreHolderName.textContent = highScoreHolder;
    }
  }

  updateLevel(level) {
    this.elements.level.textContent = level;
  }

  updateLives(lives) {
    const container = this.elements.lives;
    container.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const lifeIcon = document.createElement("span");
      lifeIcon.className = "life-icon";
      if (i >= lives) {
        lifeIcon.classList.add("lost");
      }
      lifeIcon.textContent = "\u25b2";
      container.appendChild(lifeIcon);
    }
  }

  updateActiveEffects(player, playerPowerUps) {
    const container = this.elements.activeEffects;
    const activeEffects = [];

    if (
      player &&
      player.playerController &&
      player.playerController.invulnerable > 0
    ) {
      activeEffects.push({
        name: "SHIELD",
        icon: "\u25c6",
        color: "#0ff",
        remaining: player.playerController.invulnerable,
        max: settings.powerUps.shieldDuration,
      });
    }

    if (playerPowerUps.rapidFire && playerPowerUps.rapidFire.remaining > 0) {
      activeEffects.push({
        name: "RAPID FIRE",
        icon: "\u00bb",
        color: "#ff8800",
        remaining: playerPowerUps.rapidFire.remaining,
        max: settings.powerUps.rapidFireDuration,
      });
    }

    if (playerPowerUps.tripleShot && playerPowerUps.tripleShot.remaining > 0) {
      activeEffects.push({
        name: "TRIPLE SHOT",
        icon: "\u2217",
        color: "#a064ff",
        remaining: playerPowerUps.tripleShot.remaining,
        max: settings.powerUps.tripleShotDuration,
      });
    }

    container.innerHTML = "";
    activeEffects.forEach((effect) => {
      const effectDiv = document.createElement("div");
      effectDiv.className = "active-effect";

      const header = document.createElement("div");
      header.className = "effect-header";

      const icon = document.createElement("span");
      icon.className = "effect-icon";
      icon.textContent = effect.icon;
      icon.style.color = effect.color;

      const name = document.createElement("span");
      name.className = "effect-label";
      name.textContent = effect.name;
      name.style.color = effect.color;

      header.appendChild(icon);
      header.appendChild(name);

      const progressContainer = document.createElement("div");
      progressContainer.className = "effect-progress-container";

      const progress = document.createElement("div");
      progress.className = "effect-progress";
      const percentage = (effect.remaining / effect.max) * 100;
      progress.style.width = percentage + "%";
      progress.style.backgroundColor = effect.color;
      progress.style.boxShadow = `0 0 10px ${effect.color}`;

      progressContainer.appendChild(progress);

      effectDiv.appendChild(header);
      effectDiv.appendChild(progressContainer);
      container.appendChild(effectDiv);
    });
  }
}
