// Toggle code blocks
document.addEventListener('DOMContentLoaded', () => {
  // Code block toggles
  document.querySelectorAll('.code-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.code-block').classList.toggle('collapsed');
    });
  });

  // Accordion functionality
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const wasOpen = item.classList.contains('open');
      
      // Close all in same accordion
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('open');
      });
      
      // Toggle current
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Active nav on scroll
  const sections = document.querySelectorAll('.section[id]');
  const navLinks = document.querySelectorAll('.nav-list a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', 
            link.getAttribute('href') === `#${entry.target.id}`
          );
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));

  // Copy code button
  document.querySelectorAll('.code-block').forEach(block => {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '📋 Copy';
    copyBtn.onclick = (e) => {
      e.stopPropagation();
      const code = block.querySelector('pre').textContent;
      navigator.clipboard.writeText(code);
      copyBtn.innerHTML = '✓ Copied!';
      setTimeout(() => copyBtn.innerHTML = '📋 Copy', 2000);
    };
    block.querySelector('.code-header')?.appendChild(copyBtn);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Animate sections on scroll
  const animateObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .diagram').forEach(el => {
    el.classList.add('animate');
    animateObserver.observe(el);
  });
});
