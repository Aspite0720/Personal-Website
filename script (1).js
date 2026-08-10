// Footer year
document.querySelectorAll('#year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// Bootstrap-style client-side validation for the contact form
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    form.classList.add('was-validated');
    const status = document.getElementById('form-status');
    if (status) {
      status.innerHTML = '<span class="status-stamp complete">RECEIVED</span> Message logged — I\'ll get back to you soon.';
    }
    form.reset();
    form.classList.remove('was-validated');
  });
}
