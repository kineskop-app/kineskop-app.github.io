// Sends the "notify me" form in the background (no third-party page), then shows a thank-you in place.
document.querySelectorAll("form.signup2").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return;
    btn.disabled = true; btn.classList.add("busy");
    try {
      const r = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: data.email, _subject: data._subject, _template: "box" }),
      });
      if (!r.ok) throw new Error(r.status);
      const done = form.parentElement.querySelector(".done");
      done.querySelector("b").textContent = form.dataset.ok;
      done.querySelector("span").textContent = form.dataset.oksub;
      form.hidden = true; done.hidden = false;
      form.closest(".notify2").classList.add("joined");
    } catch {
      btn.disabled = false; btn.classList.remove("busy");
      let err = form.querySelector(".err");
      if (!err) { err = document.createElement("small"); err.className = "err"; form.appendChild(err); }
      err.textContent = form.dataset.err;
    }
  });
});
