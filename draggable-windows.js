document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector(".interactive-section");
  if (!section) return;

  const canvas = section.querySelector("#ripple-bg");
  const imgEl = section.querySelector(".ripple-bg-img img, .ripple-bg-img");
  if (!canvas || !imgEl) return;

  const imgURL = imgEl.src || imgEl.getAttribute("src");

  const app = new PIXI.Application({
    view: canvas,
    resizeTo: section,
    backgroundAlpha: 0
  });

  const bg = PIXI.Sprite.from(imgURL);
  bg.width = section.offsetWidth;
  bg.height = section.offsetHeight;
  app.stage.addChild(bg);

  const disp = PIXI.Sprite.from("https://cdn.jsdelivr.net/gh/robin-dela/hover-effect@master/images/disp4.jpg");
  disp.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

  const filter = new PIXI.filters.DisplacementFilter(disp);
  disp.scale.set(0.8);
  app.stage.addChild(disp);
  bg.filters = [filter];

  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  section.addEventListener("mousemove", e => {
    const rect = section.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  app.ticker.add(() => {
    targetX += (mouseX - targetX) * 0.08;
    targetY += (mouseY - targetY) * 0.08;

    disp.x = targetX;
    disp.y = targetY;

    // animate displacement texture
    disp.x += 0.5;
    disp.y += 0.5;
  });

  window.addEventListener("resize", () => {
    bg.width = section.offsetWidth;
    bg.height = section.offsetHeight;
  });
});
