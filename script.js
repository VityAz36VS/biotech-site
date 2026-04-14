const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('main section[id]');
const form = document.getElementById('contact-form');
const statusElement = document.getElementById('form-status');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    const clickInsideMenu = nav.contains(event.target);
    const clickOnToggle = menuToggle.contains(event.target);

    if (!clickInsideMenu && !clickOnToggle) {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 140;
  let currentSectionId = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${currentSectionId}`;
    link.classList.toggle('active', isActive);
  });
}

window.addEventListener('scroll', updateActiveNavLink);
window.addEventListener('load', updateActiveNavLink);
window.addEventListener('resize', updateActiveNavLink);

function setStatus(message, type) {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.className = `form-status ${type}`;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

function markFieldState(field, isValid) {
  if (!field) return;

  if (field.type === 'checkbox') {
    const wrapper = field.closest('.consent-checkbox');
    if (wrapper) {
      wrapper.classList.toggle('error', !isValid);
    }
    return;
  }

  field.classList.toggle('error', !isValid);
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const fields = {
      name: form.querySelector('[name="name"]'),
      email: form.querySelector('[name="email"]'),
      phone: form.querySelector('[name="phone"]'),
      service: form.querySelector('[name="service"]'),
      message: form.querySelector('[name="message"]'),
      consent: form.querySelector('[name="consent"]'),
    };

    const values = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      service: String(formData.get('service') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      consent: fields.consent ? fields.consent.checked : false,
    };  

    const validations = {
      name: values.name.length >= 2,
      email: validateEmail(values.email),
      phone: validatePhone(values.phone),
      service: values.service.length > 0,
      message: values.message.length >= 10,
      consent: values.consent,
    };

    Object.entries(fields).forEach(([key, field]) => {
      markFieldState(field, validations[key]);
    });

    const hasError = Object.values(validations).some((value) => !value);

    if (hasError) {
      setStatus('Проверьте поля формы: укажите корректные контактные данные, описание задачи и подтвердите согласие на обработку персональных данных.', 'error');
      return;
    }

    setStatus('Форма заполнена корректно. Модуль отправки заявок будет подключён на этапе внедрения.', 'success');

    console.log('Форма готова к отправке:', values);
    form.reset();

    Object.values(fields).forEach((field) => field.classList.remove('error'));
  });
}
