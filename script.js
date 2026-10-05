const projectData = {
  quote: {
    category: 'AI-POWERED BUSINESS AUTOMATION', title: 'AI Quote Request & Pricing Workflow',
    summary: 'An AI-powered customer quotation workflow: it reads Gmail requests, extracts products and quantities, checks Airtable pricing, calculates totals, and prepares a Gmail draft for staff review before sending.',
    problem: 'A supplier receiving quote requests by email would otherwise need to read the request, identify products and quantities, look up prices, calculate totals, record the request, and prepare a response by hand.',
    solution: 'The workflow extracts customer and product details, searches the Airtable price list, calculates pricing, records the request, and prepares a Gmail draft. A staff member reviews the draft and pricing before manually sending it.',
    workflow: ['Gmail', 'AI Agent', 'Data Processing', 'Airtable Price Lookup', 'Price Calculation', 'Quote Preparation', 'Airtable', 'Gmail Draft', 'Human Review'],
    tools: ['n8n', 'OpenAI', 'Gmail', 'Airtable', 'Webhooks / APIs'],
    value: ['Reduces repetitive quote preparation', 'Organizes pricing information', 'Handles calculations consistently', 'Gives staff a ready-to-review response'],
    image: 'assets/ai-quote-workflow.jpg'
  },
  gym: {
    category: 'MEMBERSHIP & OPERATIONS AUTOMATION', title: 'Gym Management Automation',
    summary: 'One connected project for registration, expiry monitoring, and member renewals.',
    tabs: {
      registration: { label: 'REGISTRATION', desc: 'Captures new membership information, calculates the expiry date, stores the member record, and sends a confirmation.', flow: ['Registration Form', 'Webhook', 'Calculate Expiry', 'Airtable Record', 'Gmail Confirmation'], image: 'assets/gym-workflow.jpg' },
      expiry: { label: 'EXPIRY', desc: 'Runs scheduled checks against membership records and alerts the gym owner about relevant expiry dates. Registration and expiry share the same workflow screenshot.', flow: ['Scheduled Trigger', 'Airtable Search', 'Expiry Verification', 'Gmail Owner Alert'], image: 'assets/gym-workflow.jpg' },
      renewal: { label: 'RENEWAL', desc: 'Finds the existing member, checks renewal conditions, calculates the new expiry date, updates the Airtable record, and sends a message.', flow: ['Webhook', 'Search Existing Customer', 'Condition', 'Calculate New Expiry', 'Update Airtable', 'Gmail Message'], image: 'assets/gym-renewal.jpg' }
    },
    tools: ['n8n', 'Airtable', 'Gmail', 'Webhooks'],
    value: ['Centralized membership records', 'Less repetitive administration', 'Organized renewal tracking', 'Automated owner reminders']
  },
  inquiry: {
    category: 'CUSTOMER COMMUNICATION AUTOMATION', title: 'Customer Inquiry Routing Workflow',
    summary: 'A form-to-email workflow that sorts sales, support, and general inquiries into predictable paths.',
    problem: 'Businesses receive sales questions, support requests, and general inquiries. Someone would normally need to read each message and decide where it should go.',
    solution: 'The workflow receives form submissions through a webhook, checks the category, routes the message, and sends a Gmail acknowledgement. Unmatched categories use a fallback path.',
    workflow: ['Form', 'Webhook', 'Conditions', 'Category Switch', 'Sales / Support / General', 'Gmail Acknowledgement', 'Fallback'],
    tools: ['n8n', 'Webhooks', 'Gmail', 'Fillout / Form'],
    value: ['Organizes incoming inquiries', 'Reduces manual classification', 'Provides consistent acknowledgements', 'Creates predictable routing rules'],
    image: 'assets/inquiry-routing.jpg'
  }
};

const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const caseModal = document.querySelector('#case-modal');
const caseContent = document.querySelector('#case-content');
const imageModal = document.querySelector('#image-modal');
const viewerImage = document.querySelector('#viewer-image');
const imageStage = document.querySelector('.image-stage');
let activeProject = null;
let zoom = 1;
let dragState = null;

function closeMobileMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  navLinks.classList.remove('open');
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  navLinks.classList.toggle('open', open);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 16), { passive: true });

// Reveal sections as they enter view; reduced-motion preference is honored in CSS.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));

function flowMarkup(flow) { return flow.map((item, index) => `${index ? '<span> → </span>' : ''}${item}`).join(''); }
function imageMarkup(path, label) {
  return `<button class="case-screenshot" data-view-image="${path}" aria-label="View ${label} workflow screenshot"><img src="${path}" alt="${label} n8n workflow screenshot" onerror="this.closest('.case-screenshot').classList.add('missing')"><div class="image-placeholder"><span class="placeholder-symbol">⌘</span><strong>Workflow screenshot</strong><small>Original project image unavailable</small></div></button>`;
}
function openCase(key, tab = 'registration') {
  activeProject = key;
  const project = projectData[key];
  if (!project) return;
  const isGym = key === 'gym';
  const selectedTab = isGym ? project.tabs[tab] : null;
  const description = isGym ? selectedTab.desc : project.solution;
  const flow = isGym ? selectedTab.flow : project.workflow;
  const image = isGym ? selectedTab.image : project.image;
  const problem = isGym ? 'Membership operations involve several connected tasks: registering members, monitoring expiry dates, and processing renewals. These belong to one coordinated gym management project.' : project.problem;
  const tools = [...project.tools];
  const value = project.value;
  caseContent.innerHTML = `<div class="case-heading"><div class="section-kicker">${project.category}</div><h2 id="case-title">${project.title}</h2><p>${project.summary}</p></div>
    ${isGym ? `<div class="case-tabs" role="tablist" aria-label="Gym automation workflows">${Object.entries(project.tabs).map(([id, item]) => `<button role="tab" aria-selected="${id === tab}" class="${id === tab ? 'active' : ''}" data-gym-tab="${id}">${item.label}</button>`).join('')}</div>` : ''}
    <div class="case-workflow">${flowMarkup(flow)}</div>
    <div class="case-columns"><section class="case-block"><h3>Problem</h3><p>${problem}</p></section><section class="case-block"><h3>${isGym ? selectedTab.label[0] + selectedTab.label.slice(1).toLowerCase() : 'Solution'}</h3><p>${description}</p></section><section class="case-block"><h3>Tools</h3><div class="tag-row">${tools.map(tool => `<span>${tool}</span>`).join('')}</div></section><section class="case-block"><h3>Business value</h3><ul>${value.map(item => `<li>${item}</li>`).join('')}</ul></section></div>
    ${imageMarkup(image, project.title)}`;
  caseModal.classList.add('open');
  caseModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  caseModal.querySelector('.modal-close').focus();
}

document.addEventListener('click', event => {
  const caseButton = event.target.closest('[data-case]');
  if (caseButton) openCase(caseButton.dataset.case, caseButton.dataset.caseTab || 'registration');
  const gymTab = event.target.closest('[data-gym-tab]');
  if (gymTab && activeProject === 'gym') openCase('gym', gymTab.dataset.gymTab);
  const imageButton = event.target.closest('[data-view-image]');
  if (imageButton) openImage(imageButton.dataset.viewImage, imageButton.querySelector('img')?.alt || 'Workflow screenshot');
  const close = event.target.closest('[data-close]');
  if (close) close.dataset.close === 'case' ? closeModal(caseModal) : closeModal(imageModal);
});

function closeModal(modal) {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (!caseModal.classList.contains('open') && !imageModal.classList.contains('open')) document.body.classList.remove('modal-open');
}
function openImage(src, alt) {
  viewerImage.src = src;
  viewerImage.alt = alt;
  viewerImage.classList.remove('viewer-missing');
  viewerImage.style.transform = 'scale(1)';
  zoom = 1;
  imageStage.scrollTop = 0;
  imageStage.scrollLeft = 0;
  imageModal.classList.add('open');
  imageModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  imageModal.querySelector('[data-zoom="in"]').focus();
}
viewerImage.addEventListener('error', () => viewerImage.classList.add('viewer-missing'));
function setZoom(next) {
  zoom = Math.max(1, Math.min(4, next));
  viewerImage.style.transform = `scale(${zoom})`;
  viewerImage.style.cursor = zoom > 1 ? 'grab' : 'default';
}
imageModal.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.zoom;
  setZoom(action === 'reset' ? 1 : zoom + (action === 'in' ? 0.25 : -0.25));
}));
imageStage.addEventListener('wheel', event => {
  if (!imageModal.classList.contains('open')) return;
  event.preventDefault();
  setZoom(zoom + (event.deltaY < 0 ? 0.15 : -0.15));
}, { passive: false });
viewerImage.addEventListener('pointerdown', event => {
  if (zoom <= 1) return;
  dragState = { x: event.clientX, y: event.clientY, left: imageStage.scrollLeft, top: imageStage.scrollTop };
  viewerImage.classList.add('dragging');
  viewerImage.setPointerCapture(event.pointerId);
});
viewerImage.addEventListener('pointermove', event => {
  if (!dragState) return;
  imageStage.scrollLeft = dragState.left - (event.clientX - dragState.x);
  imageStage.scrollTop = dragState.top - (event.clientY - dragState.y);
});
function stopDrag() { dragState = null; viewerImage.classList.remove('dragging'); }
viewerImage.addEventListener('pointerup', stopDrag);
viewerImage.addEventListener('pointercancel', stopDrag);

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (imageModal.classList.contains('open')) closeModal(imageModal);
    else if (caseModal.classList.contains('open')) closeModal(caseModal);
    else closeMobileMenu();
  }
  if (event.key === 'Tab' && (caseModal.classList.contains('open') || imageModal.classList.contains('open'))) {
    const modal = imageModal.classList.contains('open') ? imageModal : caseModal;
    const focusables = [...modal.querySelectorAll('button:not([disabled]),a[href]')];
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
