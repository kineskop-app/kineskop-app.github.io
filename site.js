// Small enhancements; the page works without them.
(() => {
  // header gets a hairline once you scroll
  const bar = document.querySelector(".sticky");
  if (bar) {
    const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }

  // sections fade in as they come into view
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  document.querySelectorAll(".reveal").forEach((el) => io ? io.observe(el) : el.classList.add("in"));

  // "notify me": send in the background, then thank in place (both forms on the page switch together)
  document.querySelectorAll("form.signup").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return;
      const btn = form.querySelector("button");
      const note = form.querySelector(".note");
      btn.classList.add("busy");
      try {
        const r = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          // every visible field (email, and e.g. the platform on Last Run) plus the subject
          body: JSON.stringify({ ...Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith("_"))), _subject: data._subject, _template: "box" }),
        });
        // FormSubmit answers 200 even when it did not deliver (e.g. the form still needs activation), so check the body too
        const res = await r.json().catch(() => ({}));
        if (!r.ok || String(res.success) !== "true") throw new Error(res.message || String(r.status));
        document.querySelectorAll(".signup-wrap").forEach((w) => w.classList.add("joined"));
        try { localStorage.setItem(form.dataset.key || "sc-joined", "1"); } catch {}
      } catch {
        btn.classList.remove("busy");
        note.textContent = form.dataset.err; note.classList.add("err");
      }
    });
  });
  // TikTok/Instagram/Facebook in-app browsers swallow App Store links: try the itms-apps scheme instead and offer Safari
  // (x-safari-https, iOS 17+) plus the "••• → Open in browser" hint
  if (/BytedanceWebview|musical_ly|TikTok|Instagram|FBAN|FBAV/i.test(navigator.userAgent)) {
    document.querySelectorAll("a.get").forEach((a) => { a.href = a.href.replace(/^https:/, "itms-apps:"); });
    document.querySelectorAll(".inapp").forEach((box) => {
      const s = box.querySelector("a.safari");
      if (s) s.href = s.getAttribute("href") + location.search;
      box.hidden = false;
    });
  }

  // each landing remembers its own list ("sc-joined" for Sweater Cat, data-key on the form for others)
  const key = document.querySelector("form.signup")?.dataset.key || "sc-joined";
  try { if (localStorage.getItem(key)) document.querySelectorAll(".signup-wrap").forEach((w) => w.classList.add("joined")); } catch {}
})();
