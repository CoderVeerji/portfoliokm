(() => {
  'use strict';

  const config = window.PORTFOLIO;
  const main = document.getElementById('main');
  const footer = document.querySelector('.site-footer');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const projectUrl = project => `#/project/${encodeURIComponent(project.slug)}`;
  let motionCleanup = () => {};
  let portfolioScroll = 0;

  document.querySelectorAll('[data-brand]').forEach(element => element.textContent = config.name);
  document.querySelectorAll('[data-name]').forEach(element => element.textContent = config.name.toUpperCase());
  document.querySelectorAll('[data-instagram]').forEach(element => element.href = config.instagram);
  document.querySelector('[data-phone]').textContent = config.phone;
  document.querySelector('[data-phone]').href = `tel:${config.phone.replace(/[^+\d]/g, '')}`;
  document.querySelector('[data-website]').textContent = config.websiteLabel;
  document.querySelector('[data-website]').href = config.website;
  document.querySelector('[data-instagram-handle]').textContent = config.instagramHandle;
  document.querySelector('[data-instagram-handle]').href = config.instagram;

  function heroFace(accent) {
    return `<div class="hero-face ${accent ? 'hero-face-accent' : 'hero-face-base'}"${accent ? ' aria-hidden="true"' : ''}>` +
      `${accent ? `<div class="hero-name">${escapeHtml(config.name.toUpperCase())}</div>` : `<h1 class="hero-name">${escapeHtml(config.name.toUpperCase())}</h1>`}` +
      `<div class="hero-roles">${config.roles.map(role => `<span>${escapeHtml(role)}</span>`).join('')}</div>` +
      `<p class="hero-intro">${escapeHtml(config.intro)}</p></div>`;
  }

  function projectRow(project, index) {
    const url = projectUrl(project);
    const title = escapeHtml(project.title);
    return `<article class="project-row" data-reveal>` +
      `<div class="project-title"><div class="project-title-inner">` +
      `<span>Project ${String(index + 1).padStart(2, '0')}</span>` +
      `<h2><a href="${url}">${title}${project.subtitle ? `<small>${escapeHtml(project.subtitle)}</small>` : ''}</a></h2>` +
      `<a class="arrow" href="${url}" aria-label="Open ${title} PDF"><span aria-hidden="true">↗</span></a>` +
      `</div></div>` +
      `<a class="project-image" href="${url}" aria-label="Open ${title} PDF"><img src="${escapeHtml(project.image)}" alt="${title}" loading="lazy"></a>` +
      `<div class="project-data"><div class="project-data-inner"><div><p>[ Type ]</p><p>${escapeHtml(project.type)}</p></div><div><p>[ Year ]</p><p>${escapeHtml(project.year)}</p></div></div></div>` +
      `</article>`;
  }

  function portfolio() {
    return `<div class="home"><section class="hero-scroll" id="about" aria-label="Introduction">` +
      `<i class="hero-main-curve" aria-hidden="true"></i><div class="hero-stage"><svg class="hero-mask-defs" aria-hidden="true"><defs><clipPath id="hero-main-mask" clipPathUnits="userSpaceOnUse"><circle data-hero-main-mask-circle></circle></clipPath><clipPath id="hero-main-intro-mask" clipPathUnits="userSpaceOnUse"><circle data-hero-main-intro-mask-circle></circle></clipPath><clipPath id="hero-circle-mask" clipPathUnits="userSpaceOnUse">` +
      `<circle data-hero-mask-circle></circle><circle data-hero-mask-circle></circle><circle data-hero-mask-circle></circle><circle data-hero-mask-circle></circle>` +
      `</clipPath></defs></svg><div class="orbit-layer" aria-hidden="true"><i class="orbit orbit-left"></i><i class="orbit orbit-right"></i><i class="orbit orbit-low"></i><i class="orbit orbit-center"></i></div>` +
      `<div class="hero-face-stack">${heroFace(false)}${heroFace(true)}</div><div class="hero-rules" aria-hidden="true"></div></div></section>` +
      `<section class="projects" id="work" aria-label="Selected works">${config.projects.map(projectRow).join('')}</section></div>`;
  }

  function pdfViewer(slug) {
    const project = config.projects.find(item => item.slug === slug);
    if (!project) return `<section class="pdf-viewer"><a class="back-button" href="#/work">← Back to portfolio</a><p>Project not found.</p></section>`;
    const pdf = typeof project.pdf === 'string' ? project.pdf.trim() : '';
    const pdfUrl = pdf && !/^(?:javascript|data):/i.test(pdf) ? escapeHtml(pdf) : '';
    return `<section class="pdf-viewer" aria-label="${escapeHtml(project.title)} PDF">` +
      `<div class="pdf-toolbar"><a class="back-button" href="#/work" aria-label="Back to portfolio">← <span>Back to portfolio</span></a>` +
      `<h1>${escapeHtml(project.title)}</h1>${pdfUrl ? `<a class="pdf-external" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">Open PDF ↗</a>` : ''}</div>` +
      `${pdfUrl ? `<iframe class="pdf-frame" src="${pdfUrl}" title="${escapeHtml(project.title)} PDF"></iframe>` : `<div class="pdf-empty"><span>[ ${escapeHtml(project.title)} ]</span><p>Project PDF will appear here once it is added.</p></div>`}` +
      `</section>`;
  }

  function render() {
    const route = decodeURIComponent(location.hash.slice(1) || '/');
    const isPdf = route.startsWith('/project/');
    const wasPdf = document.body.classList.contains('is-pdf');
    motionCleanup();
    main.innerHTML = isPdf ? pdfViewer(route.slice('/project/'.length)) : portfolio();
    document.body.classList.toggle('is-pdf', isPdf);
    document.body.classList.toggle('is-home', !isPdf);
    footer.hidden = isPdf;
    document.title = isPdf ? `${config.projects.find(item => item.slug === route.slice('/project/'.length))?.title || 'Project'} | ${config.name}` : `${config.name} | Portfolio`;
    document.querySelectorAll('.header nav a').forEach(link => {
      link.removeAttribute('aria-current');
      if (!isPdf && link.getAttribute('href') === `#${route}`) link.setAttribute('aria-current', 'page');
    });
    motionCleanup = window.PortfolioMotion.mount(document);
    requestAnimationFrame(() => {
      if (isPdf) {
        window.scrollTo(0, 0);
      } else if (wasPdf && route === '/work' && portfolioScroll > 0) {
        window.scrollTo(0, portfolioScroll);
      } else if (route === '/work') {
        document.getElementById('work').scrollIntoView({ behavior: 'instant' });
      } else if (route === '/contact') {
        footer.scrollIntoView({ behavior: 'instant' });
      } else {
        window.scrollTo(0, 0);
      }
    });
  }

  main.addEventListener('click', event => {
    if (event.target.closest('a[href^="#/project/"]')) portfolioScroll = window.scrollY;
  });
  document.querySelector('.header').addEventListener('click', event => {
    const link = event.target.closest('a[href^="#/"]');
    if (!link || link.getAttribute('href') !== location.hash || document.body.classList.contains('is-pdf')) return;
    event.preventDefault();
    const route = link.getAttribute('href');
    if (route === '#/work') document.getElementById('work')?.scrollIntoView();
    else if (route === '#/contact') footer.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('hashchange', render);
  render();
})();
