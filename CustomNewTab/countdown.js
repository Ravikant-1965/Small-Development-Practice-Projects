const grid = document.getElementById("grid");
const countdown = document.getElementById("countdown");

// Create 8 big vertical boxes
const BOX_COUNT = 8;

for (let i = 0; i < BOX_COUNT; i++) {
  const box = document.createElement("div");
  box.className = "box";
  grid.appendChild(box);
}

function update() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const total = end - start;
  const passed = now - start;
  const percentage = (passed / total) * 100;

  const filledCount = Math.floor((percentage / 100) * BOX_COUNT);
  [...grid.children].forEach((box, index) => {
    box.classList.toggle("filled", index < filledCount);
  });

  const left = end - now;
  const ms = left % 1000;
  const totalSec = Math.floor(left / 1000);
  const sec = totalSec % 60;
  const min = Math.floor(totalSec / 60) % 60;
  const hrs = Math.floor(totalSec / 3600) % 24;
  const days = Math.floor(totalSec / 86400);

  const format = (num, digits = 2) => String(num).padStart(digits, "0");

  countdown.innerHTML = `
    <div>${format(days)} <span>DAYS</span></div>
    <div>${format(hrs)} <span>HOURS</span></div>
    <div>${format(min)} <span>MINUTES</span></div>
    <div>${format(sec)} <span>SECONDS</span></div>
    <div>${format(ms, 3)} <span>MS</span></div>
  `;
}

update();
setInterval(update, 100);