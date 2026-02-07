// Welcome Guide - Draws the welcome screen tutorial canvases (Single Responsibility)

export class WelcomeGuide {
  draw() {
    this._drawPlayer();
    this._drawAsteroid();
    this._drawUFO();
    this._drawShield();
    this._drawRapidFire();
    this._drawTripleShot();
  }

  _drawPlayer() {
    const canvas = document.getElementById("guidePlayer");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 60, 60);
    ctx.save();
    ctx.translate(30, 30);
    ctx.strokeStyle = "#0f0";
    ctx.fillStyle = "#0f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-10, 15);
    ctx.lineTo(0, 10);
    ctx.lineTo(10, 15);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawAsteroid() {
    const canvas = document.getElementById("guideAsteroid");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 60, 60);
    ctx.save();
    ctx.translate(30, 30);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    const sides = 8;
    const radius = 18;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 6;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  _drawUFO() {
    const canvas = document.getElementById("guideUFO");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 60, 60);
    ctx.save();
    ctx.translate(30, 30);
    ctx.strokeStyle = "#0ff";
    ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, -3, 8, 0, Math.PI, true);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-8, -3);
    ctx.lineTo(8, -3);
    ctx.lineTo(15, 0);
    ctx.lineTo(10, 6);
    ctx.lineTo(-10, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  _drawShield() {
    const canvas = document.getElementById("guideShield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 60, 60);
    ctx.save();
    ctx.translate(30, 30);

    ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#0ff";
    ctx.fillStyle = "rgba(0, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0ff";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u25c6", 0, 0);
    ctx.restore();
  }

  _drawRapidFire() {
    const canvas = document.getElementById("guideRapidFire");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 60, 60);
    ctx.save();
    ctx.translate(30, 30);

    ctx.strokeStyle = "rgba(255, 128, 0, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#ff8800";
    ctx.fillStyle = "rgba(255, 136, 0, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ff8800";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("\u00bb", 0, 0);
    ctx.restore();
  }

  _drawTripleShot() {
    const canvas = document.getElementById("guideTripleShot");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 60, 60);
    ctx.save();
    ctx.translate(30, 30);

    ctx.strokeStyle = "rgba(160, 100, 255, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#a064ff";
    ctx.fillStyle = "rgba(160, 100, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#a064ff";
    ctx.beginPath();
    ctx.arc(-4, -2, 2, 0, Math.PI * 2);
    ctx.arc(0, -4, 2, 0, Math.PI * 2);
    ctx.arc(4, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
