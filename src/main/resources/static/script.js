/* 
=========================================
   EcoVerse - Interactive JavaScript
   Functionality: Form Validation, Scroll Animations, Filters, Auth, Catalog
=========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  // Global Session Check
  let currentUser = null;
  let currentToken = null;
  
  try {
    const userStr = localStorage.getItem('user');
    currentToken = localStorage.getItem('token');
    if (userStr && currentToken) {
      currentUser = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Error reading auth state:', e);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // 1. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar-custom');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // 2. Active Navigation Link Handler
  const currentPath = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.navbar-custom .nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Reveal on Scroll (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 4. Toast Notification Utility
  function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.style.position = 'fixed';
      toastContainer.style.bottom = '24px';
      toastContainer.style.right = '24px';
      toastContainer.style.zIndex = '1100';
      toastContainer.style.display = 'flex';
      toastContainer.style.flexDirection = 'column';
      toastContainer.style.gap = '10px';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-card';
    toast.style.padding = '16px 24px';
    toast.style.borderRadius = 'var(--radius-md)';
    toast.style.background = type === 'success' ? 'rgba(46, 125, 50, 0.95)' : 'rgba(211, 47, 47, 0.95)';
    toast.style.color = '#ffffff';
    toast.style.border = '1px solid rgba(255, 255, 255, 0.2)';
    toast.style.boxShadow = 'var(--glass-shadow-large)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.webkitBackdropFilter = 'blur(10px)';
    toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}" style="font-size: 1.25rem;"></i>
        <span style="font-weight: 600;">${message}</span>
      </div>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 50);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 4000);
  }

  // 5. Inject Authentication Modal HTML
  function injectAuthModal() {
    if (document.getElementById('authModal')) return;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = `
      <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true" style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 450px;">
          <div class="modal-content glass-card" style="border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.95); border: 1px solid var(--glass-border); box-shadow: var(--glass-shadow-large); overflow: hidden;">
            <div class="modal-header border-0 pb-0 justify-content-end" style="padding: 15px 15px 0 0;">
              <button type="button" class="btn-close fs-6" data-bs-dismiss="modal" aria-label="Close" style="background-color: var(--primary-accent); border-radius: 50%; padding: 8px;"></button>
            </div>
            <div class="modal-body px-4 pb-4 pt-0">
              <ul class="nav nav-tabs border-0 mb-4 justify-content-center" id="authTab" role="tablist" style="gap: 15px;">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active border-0 font-headings fw-bold fs-5 px-3 py-2" id="login-tab" data-bs-toggle="tab" data-bs-target="#login-pane" type="button" role="tab" aria-controls="login-pane" aria-selected="true" style="background: transparent; color: var(--text-muted); border-radius: var(--radius-round);">Login</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link border-0 font-headings fw-bold fs-5 px-3 py-2" id="signup-tab" data-bs-toggle="tab" data-bs-target="#signup-pane" type="button" role="tab" aria-controls="signup-pane" aria-selected="false" style="background: transparent; color: var(--text-muted); border-radius: var(--radius-round);">Sign Up</button>
                </li>
              </ul>
              
              <div class="tab-content" id="authTabContent">
                <!-- Login Form -->
                <div class="tab-pane fade show active" id="login-pane" role="tabpanel" aria-labelledby="login-tab">
                  <form id="loginForm" novalidate>
                    <div class="form-group-custom">
                      <label for="loginEmail" class="form-label-custom">Email or Username</label>
                      <input type="text" id="loginEmail" class="form-control-custom" placeholder="e.g. eleanor@domain.com" required>
                      <div class="validation-message" id="loginEmailFeedback">Email or username is required.</div>
                    </div>
                    <div class="form-group-custom">
                      <label for="loginPassword" class="form-label-custom">Password</label>
                      <input type="password" id="loginPassword" class="form-control-custom" placeholder="••••••••" required>
                      <div class="validation-message" id="loginPasswordFeedback">Password is required.</div>
                    </div>
                    <div class="validation-message text-center mb-3 fs-6" id="loginGeneralFeedback" style="color:#d32f2f;"></div>
                    <button type="submit" class="btn-premium btn-premium-primary w-100 justify-content-center mt-2" id="loginSubmitBtn">
                      Login <i class="bi bi-box-arrow-in-right ms-2"></i>
                    </button>
                  </form>
                </div>
                
                <!-- Sign Up Form -->
                <div class="tab-pane fade" id="signup-pane" role="tabpanel" aria-labelledby="signup-tab">
                  <form id="signupForm" novalidate>
                    <div class="form-group-custom">
                      <label for="signupUsername" class="form-label-custom">Username</label>
                      <input type="text" id="signupUsername" class="form-control-custom" placeholder="e.g. eleanor" required>
                      <div class="validation-message" id="signupUsernameFeedback">Username is required.</div>
                    </div>
                    <div class="form-group-custom">
                      <label for="signupEmail" class="form-label-custom">Email Address</label>
                      <input type="email" id="signupEmail" class="form-control-custom" placeholder="e.g. eleanor@domain.com" required>
                      <div class="validation-message" id="signupEmailFeedback">Please enter a valid email address.</div>
                    </div>
                    <div class="form-group-custom">
                      <label for="signupPassword" class="form-label-custom">Password</label>
                      <input type="password" id="signupPassword" class="form-control-custom" placeholder="••••••••" required>
                      <div class="validation-message" id="signupPasswordFeedback">Password must contain at least 6 characters.</div>
                    </div>
                    <div class="validation-message text-center mb-3 fs-6" id="signupGeneralFeedback" style="color:#d32f2f;"></div>
                    <button type="submit" class="btn-premium btn-premium-primary w-100 justify-content-center mt-2" id="signupSubmitBtn">
                      Create Account <i class="bi bi-person-plus-fill ms-2"></i>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv.firstElementChild);

    // Attach event listeners for auth forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignUp);
  }

  // 6. Update Navbar dynamic UI
  function updateNavbar() {
    const navbarNav = document.querySelector('.navbar-custom .navbar-nav');
    if (!navbarNav) return;

    // Check if dropdown or login button already exists, remove it to prevent duplicates
    const existingAuthNode = document.getElementById('navbarAuthNode');
    if (existingAuthNode) {
      existingAuthNode.remove();
    }

    const authLi = document.createElement('li');
    authLi.id = 'navbarAuthNode';

    if (currentUser && currentToken) {
      // User is logged in
      authLi.className = 'nav-item dropdown ms-lg-3';
      authLi.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" id="navbarUserDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
          <i class="bi bi-person-circle me-1"></i> <span>Hi, ${currentUser.username}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="navbarUserDropdown" style="border-radius: var(--radius-md); border: 1px solid var(--glass-border); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);">
          <li><a class="dropdown-item py-2" href="admin.html"><i class="bi bi-gear me-2"></i>Manage Products</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item py-2 text-danger" href="#" id="navLogoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
        </ul>
      `;
      navbarNav.insertBefore(authLi, navbarNav.lastElementChild);

      // Attach logout event
      document.getElementById('navLogoutBtn').addEventListener('click', handleLogout);
    } else {
      // User is not logged in
      authLi.className = 'nav-item ms-lg-2';
      authLi.innerHTML = `
        <a class="nav-link" href="#" id="navLoginBtn" style="cursor: pointer;"><i class="bi bi-box-arrow-in-right me-1"></i>Login / Sign Up</a>
      `;
      navbarNav.insertBefore(authLi, navbarNav.lastElementChild);

      // Attach login event to open Modal
      document.getElementById('navLoginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        const authModal = new bootstrap.Modal(document.getElementById('authModal'));
        authModal.show();
      });
    }
  }

  // Authentication Handlers
  function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const generalFeedback = document.getElementById('loginGeneralFeedback');

    generalFeedback.style.display = 'none';
    const isEmailValid = validateField(emailInput, emailInput.value.trim().length > 0, 'Email or username is required.');
    const isPassValid = validateField(passwordInput, passwordInput.value.trim().length > 0, 'Password is required.');

    if (!isEmailValid || !isPassValid) return;

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrUsername: emailInput.value.trim(),
        password: passwordInput.value.trim()
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      return data;
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email
      }));
      currentUser = data;
      currentToken = data.token;
      
      showToast('Logged in successfully!');
      bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
      updateNavbar();
      
      // Clear forms
      loginForm.reset();
      [emailInput, passwordInput].forEach(inp => inp.classList.remove('is-valid'));

      // If on admin or other page, refresh
      if (window.location.pathname.endsWith('admin.html')) {
        window.location.reload();
      }
    })
    .catch(err => {
      generalFeedback.textContent = err.message;
      generalFeedback.style.display = 'block';
    });
  }

  function handleSignUp(e) {
    e.preventDefault();
    const userInput = document.getElementById('signupUsername');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const generalFeedback = document.getElementById('signupGeneralFeedback');

    generalFeedback.style.display = 'none';
    const isUserValid = validateField(userInput, userInput.value.trim().length > 0, 'Username is required.');
    const isEmailValid = validateField(emailInput, validateEmail(emailInput.value.trim()), 'Please enter a valid email address.');
    const isPassValid = validateField(passwordInput, passwordInput.value.trim().length >= 6, 'Password must contain at least 6 characters.');

    if (!isUserValid || !isEmailValid || !isPassValid) return;

    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim()
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      return data;
    })
    .then(data => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email
      }));
      currentUser = data;
      currentToken = data.token;

      showToast('Account created successfully!');
      bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
      updateNavbar();

      signupForm.reset();
      [userInput, emailInput, passwordInput].forEach(inp => inp.classList.remove('is-valid'));
    })
    .catch(err => {
      generalFeedback.textContent = err.message;
      generalFeedback.style.display = 'block';
    });
  }

  function handleLogout(e) {
    e.preventDefault();
    if (currentToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      .finally(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        currentToken = null;
        showToast('Logged out successfully!');
        updateNavbar();
        
        // If on admin page, redirect to home
        if (window.location.pathname.endsWith('admin.html')) {
          window.location.href = 'index.html';
        }
      });
    }
  }

  // 7. Dynamic Catalog Fetching on services.html
  const productsDisplayGrid = document.getElementById('productsDisplayGrid');
  if (productsDisplayGrid) {
    loadCatalogProducts();
  }

  function loadCatalogProducts() {
    productsDisplayGrid.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-success" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3 font-headings fs-5">Fetching sustainable treasures...</p>
      </div>
    `;

    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load products.');
        return res.json();
      })
      .then(products => {
        renderProducts(products);
      })
      .catch(err => {
        productsDisplayGrid.innerHTML = `
          <div class="col-12 text-center py-5">
            <div class="benefit-icon-box mx-auto" style="background: rgba(211,47,47,0.1); color: #d32f2f;">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h3 class="font-headings mt-3">Failed to Load Products</h3>
            <p class="text-muted">${err.message}</p>
            <button class="btn btn-premium btn-premium-primary mt-3" onclick="window.location.reload()"><i class="bi bi-arrow-clockwise me-1"></i>Retry</button>
          </div>
        `;
      });
  }

  function renderProducts(products) {
    if (products.length === 0) {
      productsDisplayGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-muted font-headings fs-5">No products found in our catalog yet.</p>
        </div>
      `;
      return;
    }

    productsDisplayGrid.innerHTML = '';
    products.forEach((product, idx) => {
      const col = document.createElement('div');
      col.className = 'col-lg-3 col-md-6 product-item';
      col.setAttribute('data-category', product.category);
      col.style.transitionDelay = `${idx * 0.05}s`;
      
      col.innerHTML = `
        <div class="glass-card hover-lift h-100 d-flex flex-column">
          <div class="glass-card-img-wrapper">
            <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80'}" alt="${product.name}" class="glass-card-img">
          </div>
          <div class="glass-card-body d-flex flex-column flex-grow-1">
            <span class="glass-card-tag">${product.category.toUpperCase()}</span>
            <h3 class="glass-card-title">${product.name}</h3>
            <p class="text-muted small mb-3 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.5;">${product.description || ''}</p>
            <div class="text-warning small mb-2">
              ${generateStarsHTML(product.rating || 5.0)} (${product.reviewCount || 0})
            </div>
            <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
              <span class="glass-card-price">$${product.price.toFixed(2)}</span>
              <button class="btn btn-premium btn-premium-primary py-2 px-3 fs-6 add-to-cart-btn" style="border-radius: 50%;" aria-label="Add to cart"><i class="bi bi-bag"></i></button>
            </div>
          </div>
        </div>
      `;
      productsDisplayGrid.appendChild(col);
    });

    // Re-initialize hover animations and click actions
    initializeFiltering();

    // Attach listeners to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        showToast('Item added to cart!');
      });
    });
  }

  function generateStarsHTML(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        html += '<i class="bi bi-star-fill"></i>';
      } else if (i === fullStars && halfStar) {
        html += '<i class="bi bi-star-half"></i>';
      } else {
        html += '<i class="bi bi-star"></i>';
      }
    }
    return html;
  }

  // 8. Re-initialize filtering with dynamic cards
  function initializeFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-item');

    if (filterButtons.length > 0 && productCards.length > 0) {
      filterButtons.forEach(btn => {
        // Remove existing listener to prevent stacking
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', (e) => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');

          const filterValue = e.currentTarget.getAttribute('data-filter');

          productCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
              if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                setTimeout(() => {
                  card.style.opacity = '1';
                  card.style.transform = 'scale(1)';
                }, 50);
              } else {
                card.style.display = 'none';
              }
            }, 300);
          });
        });
      });
    }
  }

  // 9. Contact Form Validation with Premium Alert
  const contactForm = document.getElementById('ecoContactForm');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    nameInput.addEventListener('input', () => validateField(nameInput, nameInput.value.trim().length >= 3, 'Name must be at least 3 characters.'));
    emailInput.addEventListener('input', () => validateField(emailInput, validateEmail(emailInput.value.trim()), 'Please enter a valid email address.'));
    subjectInput.addEventListener('input', () => validateField(subjectInput, subjectInput.value.trim().length >= 5, 'Subject must be at least 5 characters.'));
    messageInput.addEventListener('input', () => validateField(messageInput, messageInput.value.trim().length >= 15, 'Message must be at least 15 characters.'));

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 3, 'Name must be at least 3 characters.');
      const isEmailValid = validateField(emailInput, validateEmail(emailInput.value.trim()), 'Please enter a valid email address.');
      const isSubjectValid = validateField(subjectInput, subjectInput.value.trim().length >= 5, 'Subject must be at least 5 characters.');
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 15, 'Message must be at least 15 characters.');

      if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
        showSuccessModal(nameInput.value.trim());
        contactForm.reset();
        
        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
          input.classList.remove('is-valid');
        });
      }
    });
  }

  // Helper validation functions
  function validateField(inputElement, condition, errorMessage) {
    if (!inputElement) return false;
    const feedbackEl = inputElement.nextElementSibling;
    if (condition) {
      inputElement.classList.remove('is-invalid');
      inputElement.classList.add('is-valid');
      if (feedbackEl && feedbackEl.classList.contains('validation-message')) {
        feedbackEl.style.display = 'none';
      }
      return true;
    } else {
      inputElement.classList.remove('is-valid');
      inputElement.classList.add('is-invalid');
      if (feedbackEl && feedbackEl.classList.contains('validation-message')) {
        feedbackEl.textContent = errorMessage;
        feedbackEl.style.display = 'block';
      }
      return false;
    }
  }

  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }

  function showSuccessModal(userName) {
    let modal = document.getElementById('successModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'successModal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.backdropFilter = 'blur(8px)';
      modal.style.webkitBackdropFilter = 'blur(8px)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.4s ease';

      modal.innerHTML = `
        <div class="glass-card" style="max-width: 450px; width: 90%; padding: 40px; text-align: center; border-radius: 24px; background: rgba(255,255,255,0.95); box-shadow: 0 20px 50px rgba(0,0,0,0.15);">
          <div class="benefit-icon-box" style="margin: 0 auto 24px; background: var(--primary-accent); color: var(--primary); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
            <i class="bi bi-check-circle-fill"></i>
          </div>
          <h3 style="font-family: var(--font-headings); font-weight: 700; color: var(--dark); margin-bottom: 12px;">Thank you, <span id="modalUserName" style="color: var(--primary);"></span>!</h3>
          <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 30px;">Your sustainable message has been received! Our eco-experts will respond to you shortly within 24 hours.</p>
          <button id="closeModalBtn" class="btn-premium btn-premium-primary" style="padding: 12px 36px; margin: 0 auto; width: 100%; justify-content: center;">Go back</button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('closeModalBtn').addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
          modal.style.display = 'none';
        }, 400);
      });
    }

    document.getElementById('modalUserName').textContent = userName;
    modal.style.display = 'flex';
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 50);
  }

  // Run Auth Init
  injectAuthModal();
  updateNavbar();
});
