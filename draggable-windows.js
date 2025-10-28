document.addEventListener("DOMContentLoaded", function () {
  let zCounter = 1000;

  // Ensure docks exist and surfaces are positioned
  document.querySelectorAll(".draggable-surface, .draggable_surface").forEach(surface => {
    if (!surface.querySelector(".window-dock")) {
      const dock = document.createElement("div");
      dock.className = "window-dock";
      surface.appendChild(dock);
    }
    if (getComputedStyle(surface).position === "static") {
      surface.style.position = "relative";
    }
  });
// === DRAGGABLE SETUP ===
interact("[data-draggable]").draggable({
  inertia: false,
  modifiers: [interact.modifiers.restrictRect({ restriction: "parent", endOnly: true })],
  listeners: {
    start(event) {
      const target = event.target;
      target.style.zIndex = (++zCounter).toString();

      // 🚀 Disable transitions for real-time drag responsiveness
      target.dataset.prevTransition = target.style.transition || "";
      target.style.transition = "none";
      target.classList.add("dragging");
    },
    move(event) {
      const target = event.target;
      if (target.dataset.minimized === "true") return;

      const x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
      const y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

      target.style.transform = `translate(${x}px, ${y}px)`;
      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);
    },
    end(event) {
      const target = event.target;
      target.classList.remove("dragging");

      // 🧩 Restore transitions (so minimize/restore animations still work)
      target.style.transition = target.dataset.prevTransition || "";

      preventOverlap(target);
    }
  }
});

 // --- MINIMIZE / RESTORE TOGGLE ---
document.addEventListener("click", e => {
  const toggleBtn = e.target.closest("[data-minimize]");
  const win = e.target.closest("[data-draggable]");
  if (!toggleBtn || !win) return;

  const surface = win.closest(".draggable-surface, .draggable_surface");
  const dock = surface.querySelector(".window-dock");

  // --- If currently minimized → RESTORE ---
  if (win.dataset.minimized === "true") {
    const origX = parseFloat(win.dataset.origX) || 0;
    const origY = parseFloat(win.dataset.origY) || 0;

    win.dataset.minimized = "false";
    surface.insertBefore(win, surface.querySelector(".window-dock"));
    win.style.position = "absolute";
    win.style.zIndex = (++zCounter).toString();
    win.classList.add("slide-up");

    setTimeout(() => {
      win.classList.remove("slide-up");
      win.style.transform = `translate(${origX}px, ${origY}px)`;
      win.setAttribute("data-x", origX);
      win.setAttribute("data-y", origY);
    }, 350);

    return;
  }

  // --- Otherwise → MINIMIZE ---
  win.dataset.origX = win.getAttribute("data-x") || 0;
  win.dataset.origY = win.getAttribute("data-y") || 0;

  win.classList.add("slide-down");
  setTimeout(() => {
    win.classList.remove("slide-down");
    win.dataset.minimized = "true";
    dock.prepend(win);

    // Reset for dock layout
    win.style.position = "relative";
    win.style.transform = "none";
    win.setAttribute("data-x", 0);
    win.setAttribute("data-y", 0);
  }, 350);
});

  // --- DOUBLE CLICK TITLE TO RESET POSITION ---
  document.addEventListener("dblclick", e => {
    const title = e.target.closest(".win__title, .video_window-header, .media_window-header");
    if (!title) return;
    const win = title.closest("[data-draggable]");
    if (!win) return;
    win.dataset.minimized = "false";
    win.style.transition = "transform 0.25s ease";
    win.style.transform = "translate(0px, 0px)";
    win.setAttribute("data-x", 0);
    win.setAttribute("data-y", 0);
    setTimeout(() => (win.style.transition = ""), 250);
  });

  // --- Prevent full overlap ---
  function preventOverlap(target) {
    const allWins = document.querySelectorAll("[data-draggable]:not([data-minimized='true'])");
    const tRect = target.getBoundingClientRect();

    allWins.forEach(other => {
      if (other === target) return;
      const r = other.getBoundingClientRect();
      const fullyCovered =
        r.left >= tRect.left &&
        r.right <= tRect.right &&
        r.top >= tRect.top &&
        r.bottom <= tRect.bottom;

      if (fullyCovered) {
        const currentX = parseFloat(other.getAttribute("data-x")) || 0;
        const currentY = parseFloat(other.getAttribute("data-y")) || 0;
        const nudge = 40;
        const newX = currentX + nudge;
        const newY = currentY + nudge;
        other.style.transition = "transform 0.25s ease";
        other.style.transform = `translate(${newX}px, ${newY}px)`;
        other.setAttribute("data-x", newX);
        other.setAttribute("data-y", newY);
        setTimeout(() => (other.style.transition = ""), 250);
      }
    });
  }
});
