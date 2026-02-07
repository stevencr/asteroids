// Input Manager - Handles keyboard and touch input (Single Responsibility)

export class InputManager {
  constructor() {
    this.keys = {};
    this._startGameCallback = null;
    this._restartGameCallback = null;
  }

  onStartGame(callback) {
    this._startGameCallback = callback;
  }

  onRestartGame(callback) {
    this._restartGameCallback = callback;
  }

  setup() {
    // Keyboard controls
    window.addEventListener("keydown", (e) => {
      if (e.key === " " && this._startGameCallback) {
        this._startGameCallback();
        return;
      }
      if (e.key === " " && this._restartGameCallback) {
        this._restartGameCallback();
        return;
      }
      this.keys[e.key] = true;
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
    });

    // Touch controls
    const buttons = {
      leftBtn: "ArrowLeft",
      rightBtn: "ArrowRight",
      thrustBtn: "ArrowUp",
      shootBtn: " ",
    };

    for (const [id, key] of Object.entries(buttons)) {
      const btn = document.getElementById(id);
      ["touchstart", "touchend", "touchcancel"].forEach((eventType) => {
        btn.addEventListener(eventType, (e) => {
          e.preventDefault();
          this.keys[key] = eventType === "touchstart";
        });
      });
    }

    // Touch/click on welcome screen to start
    const welcomeScreen = document.getElementById("welcomeScreen");
    welcomeScreen.addEventListener("click", () => {
      if (this._startGameCallback) {
        this._startGameCallback();
      }
    });
  }

  isPressed(key) {
    return !!this.keys[key];
  }
}
