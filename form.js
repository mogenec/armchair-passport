// Paste the Inbound Webhook URL from your GoHighLevel workflow trigger here.
// Looks like: https://services.leadconnectorhq.com/hooks/XXXX/webhook-trigger/YYYY
const GHL_WEBHOOK_URL = "";

document.querySelectorAll("form.signup").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const error = form.querySelector(".form-error");
    const button = form.querySelector("button");
    error.classList.remove("show");

    const data = new FormData(form);
    if (data.get("company")) return; // honeypot: bots fill hidden fields

    const firstName = (data.get("first_name") || "").trim();
    const email = (data.get("email") || "").trim();
    if (!firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error.textContent = "Please add your first name and a valid email address.";
      error.classList.add("show");
      return;
    }

    button.disabled = true;
    button.textContent = "Stamping your passport…";

    const params = new URLSearchParams(window.location.search);
    const payload = new URLSearchParams({
      first_name: firstName,
      email: email,
      source: "Armchair Passport landing page",
      tags: "armchair-passport",
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
    });

    try {
      if (GHL_WEBHOOK_URL) {
        // no-cors + form encoding: the webhook doesn't send CORS headers, so the
        // response is opaque. A network failure still throws and is caught below.
        await fetch(GHL_WEBHOOK_URL, { method: "POST", mode: "no-cors", body: payload });
      } else {
        console.warn("GHL_WEBHOOK_URL is not set; signup was not sent.");
      }
      try { sessionStorage.setItem("ap_first_name", firstName); } catch (_) {}
      window.location.href = "thank-you.html";
    } catch (err) {
      button.disabled = false;
      button.textContent = "Send me Day 1";
      error.textContent = "Something went wrong sending that. Please check your connection and try again.";
      error.classList.add("show");
    }
  });
});
