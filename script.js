// Minimal, functional JS only — no frameworks, no build step.

document.addEventListener("DOMContentLoaded", function () {
  // 1. Auto-stamp the current year in the footer.
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Contact form: client-side validation + confirmation message.
  //    (Static hosting has no backend, so this simulates submission
  //     and gives the user a real "record filed" response.)
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      var status = document.getElementById("form-status");
      var name = document.getElementById("name").value.trim();

      status.textContent =
        "Record filed. Thanks, " + name + " — this demo form doesn't send email yet, " +
        "but you can reach me directly at the address above.";
      status.className = "text-success mt-3";
      form.reset();
      form.classList.remove("was-validated");
    });
  }
});
