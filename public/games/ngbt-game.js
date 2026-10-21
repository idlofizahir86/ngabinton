/**
 * Penghubung mini-game statis dengan Pang-Jagona.
 *
 * Game memanggil `window.NGBT.submitScore(skor)` saat selesai. Endpoint
 * `/api/mainan/score` yang menentukan apakah skor masuk leaderboard
 * (hanya pengguna login). Pengunjung tetap bisa bermain.
 */
(() => {
  "use strict";

  const script = document.currentScript;
  const game = script ? script.dataset.game : "";
  const toast = document.getElementById("ngbt-toast");
  let loggedIn = false;
  let hideTimer = null;

  function showToast(text, kind) {
    if (!toast) return;
    toast.textContent = text;
    toast.className = `show ${kind || ""}`.trim();
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.className = "";
    }, kind === "guest" ? 9000 : 4500);
  }

  fetch("/api/session", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      loggedIn = Boolean(data && data.user);
      if (!loggedIn) {
        showToast("Mode pengunjung · login dulu untuk masuk Pang-Jagona", "guest");
      }
    })
    .catch(() => {});

  window.NGBT = {
    isLoggedIn: () => loggedIn,
    notify(text, kind) {
      showToast(text, kind);
    },
    submitScore(score) {
      if (!game || !Number.isFinite(score) || score <= 0) return;

      const send = (attempt) => {
        fetch("/api/mainan/score", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ game, score: Math.floor(score) }),
        })
          .then(async (response) => {
            const data = await response.json().catch(() => ({}));
            if (data.ok) {
              showToast(`Skor ${Math.floor(score)} masuk Pang-Jagona`, "ok");
              return;
            }
            if (data.reason === "guest") {
              showToast("Login dulu untuk masuk Pang-Jagona", "guest");
              return;
            }
            if (data.reason === "rate_limited") {
              showToast("Terlalu banyak percobaan. Tunggu sebentar.", "err");
              return;
            }
            if (attempt < 1 && response.status >= 500) {
              setTimeout(() => send(attempt + 1), 900);
              return;
            }
            showToast("Skor belum terkirim. Coba lagi.", "err");
          })
          .catch(() => {
            if (attempt < 1) {
              setTimeout(() => send(attempt + 1), 900);
              return;
            }
            showToast("Skor belum terkirim. Coba lagi.", "err");
          });
      };

      send(0);
    },
  };
})();
