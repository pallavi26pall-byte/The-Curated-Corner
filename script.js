// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// Back to top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const menuClose = document.getElementById('menuClose');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  menuClose?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) mobileMenu.classList.remove('open');
  });
}

// Fade-up animations on scroll
const fadeEls = document.querySelectorAll('.fade-up');
if (fadeEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
}

// Category pills filter
const catPills = document.querySelectorAll('.cat-pill');
catPills.forEach(pill => {
  pill.addEventListener('click', () => {
    catPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// Newsletter subscribe handler — writes straight to Supabase (insert-only RLS)
async function handleSubscribe(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.btn-subscribe');
  const name = form.querySelector('input[type="text"]')?.value || '';
  const email = form.querySelector('input[type="email"]').value;

  btn.textContent = 'Subscribing...';
  btn.disabled = true;

  try {
    if (!window.sb) throw new Error('offline');
    const { error } = await window.sb.from('subscribers').insert({ name: name || null, email });
    if (error && error.code !== '23505') throw error; // 23505 = already subscribed
    btn.textContent = error && error.code === '23505' ? "🎉 You're already subscribed!" : '🎉 Subscribed!';
    btn.style.background = 'var(--sage)';
    form.reset();
  } catch (err) {
    btn.textContent = 'Something went wrong — try again';
    btn.style.background = '#c0392b';
    btn.disabled = false;
  }
}

// Contact form handler — writes straight to Supabase (insert-only RLS)
async function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const note = form.querySelector('.form-note');
  const name = form.querySelector('input[name="name"]')?.value || '';
  const email = form.querySelector('input[name="email"]').value;
  const message = form.querySelector('textarea[name="message"]').value;

  const original = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;
  if (note) { note.textContent = ''; note.style.color = ''; }

  try {
    if (!window.sb) throw new Error('offline');
    const { error } = await window.sb.from('contact_messages').insert({ name: name || null, email, message });
    if (error) throw error;
    form.reset();
    btn.textContent = '✓ Sent!';
    btn.style.background = 'var(--sage)';
    if (note) { note.style.color = 'var(--sage)'; note.textContent = "Thank you! I'll get back to you soon. 🌸"; }
  } catch (err) {
    btn.textContent = original;
    btn.disabled = false;
    if (note) { note.style.color = '#c0392b'; note.textContent = 'Something went wrong — please try again.'; }
  }
}

// Pinterest save button hover effect
document.querySelectorAll('.post-card-save').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="#E60023" width="18" height="18"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>';
    btn.style.background = '#FFF0F0';
    btn.style.opacity = '1';
  });
});

// Smooth reading progress bar (for post pages)
const progressBar = document.getElementById('readingProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const article = document.querySelector('.post-content');
    if (!article) return;
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const scrolled = Math.max(0, -rect.top);
    const pct = Math.min(100, (scrolled / total) * 100);
    progressBar.style.width = pct + '%';
  });
}
