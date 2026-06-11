/* 
=========================================
   EcoVerse - Interactive JavaScript
   Functionality: Form Validation, Scroll Animations, Filters
=========================================
*/

document.addEventListener('DOMContentLoaded', () => {
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
          // Once revealed, no need to observe again
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 4. Product Filtering (Services / Products Page)
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-item');

  if (filterButtons.length > 0 && productCards.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Toggle Active Button Class
        filterButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const filterValue = e.currentTarget.getAttribute('data-filter');

        productCards.forEach(card => {
          // Fade-out animation start
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

  // 5. Contact Form Validation with Premium Alert
  const contactForm = document.getElementById('ecoContactForm');
  if (contactForm) {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    // Input event listeners for live feedback
    nameInput.addEventListener('input', () => validateField(nameInput, nameInput.value.trim().length >= 3, 'Name must be at least 3 characters.'));
    emailInput.addEventListener('input', () => validateField(emailInput, validateEmail(emailInput.value.trim()), 'Please enter a valid email address.'));
    subjectInput.addEventListener('input', () => validateField(subjectInput, subjectInput.value.trim().length >= 5, 'Subject must be at least 5 characters.'));
    messageInput.addEventListener('input', () => validateField(messageInput, messageInput.value.trim().length >= 15, 'Message must be at least 15 characters.'));

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Final checks
      const isNameValid = validateField(nameInput, nameInput.value.trim().length >= 3, 'Name must be at least 3 characters.');
      const isEmailValid = validateField(emailInput, validateEmail(emailInput.value.trim()), 'Please enter a valid email address.');
      const isSubjectValid = validateField(subjectInput, subjectInput.value.trim().length >= 5, 'Subject must be at least 5 characters.');
      const isMessageValid = validateField(messageInput, messageInput.value.trim().length >= 15, 'Message must be at least 15 characters.');

      if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
        showSuccessModal(nameInput.value.trim());
        contactForm.reset();
        
        // Clear validation classes
        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
          input.classList.remove('is-valid');
        });
      }
    });
  }
// 7. Shopping Cart Data Transfer & Checkout Logic
  
  // --- A. XỬ LÝ Ở TRANG PRODUCT DETAIL ---
  const buyNowBtn = document.getElementById('buyNowBtn');
  const detailQty = document.getElementById('detailQty');
  
  if (buyNowBtn && detailQty) {
    buyNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Lưu số lượng người dùng chọn vào trình duyệt
      localStorage.setItem('checkout_qty', detailQty.value);
      // Chuyển hướng sang trang checkout
      window.location.href = 'checkout.html';
    });
  }

  // --- B. XỬ LÝ Ở TRANG CHECKOUT ---
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    const checkoutName = document.getElementById('checkoutName');
    const checkoutPhone = document.getElementById('checkoutPhone');
    const checkoutEmail = document.getElementById('checkoutEmail');
    const checkoutAddress = document.getElementById('checkoutAddress');
    
    const checkoutQty = document.getElementById('checkoutQty');
    const itemPriceDisplay = document.getElementById('itemPriceDisplay');
    const subtotalDisplay = document.getElementById('subtotalDisplay');
    const totalDisplay = document.getElementById('totalDisplay');
    const unitPrice = 28.00;

    // Hàm tính toán và cập nhật giá tiền
    function updatePrices() {
      let qty = parseInt(checkoutQty.value);
      if (qty < 1 || isNaN(qty)) {
        qty = 1;
        checkoutQty.value = 1;
      }
      const total = (unitPrice * qty).toFixed(2);
      if(itemPriceDisplay) itemPriceDisplay.textContent = `$${total}`;
      if(subtotalDisplay) subtotalDisplay.textContent = `$${total}`;
      if(totalDisplay) totalDisplay.textContent = `$${total}`;
    }

    // Tự động tải số lượng từ trang Detail sang nếu có
    if (checkoutQty) {
      const savedQty = localStorage.getItem('checkout_qty');
      if (savedQty) {
        checkoutQty.value = savedQty; // Gán số lượng đã lưu
        localStorage.removeItem('checkout_qty'); // Xóa đi sau khi đã dùng để tránh lỗi cho lần mua sau
      }
      
      // Tính tiền ngay khi trang vừa load
      updatePrices();

      // Lắng nghe sự kiện thay đổi số lượng trực tiếp trên trang Checkout
      checkoutQty.addEventListener('change', updatePrices);
    }

    // Xử lý khi ấn Confirm & Place Order
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isNameValid = checkoutName.value.trim().length >= 2;
      const isPhoneValid = checkoutPhone.value.trim().length >= 8;
      const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(checkoutEmail.value.trim().toLowerCase());
      const isAddressValid = checkoutAddress.value.trim().length >= 5;

      toggleValidation(checkoutName, isNameValid);
      toggleValidation(checkoutPhone, isPhoneValid);
      toggleValidation(checkoutEmail, isEmailValid);
      toggleValidation(checkoutAddress, isAddressValid);

      if (isNameValid && isPhoneValid && isEmailValid && isAddressValid) {
        const finalQty = checkoutQty ? checkoutQty.value : 1;
        showOrderSuccess(checkoutName.value.trim(), finalQty);
      }
    });

    function toggleValidation(element, isValid) {
      const errorMsg = element.nextElementSibling;
      if (isValid) {
        element.classList.remove('is-invalid');
        element.classList.add('is-valid');
        if (errorMsg) errorMsg.style.display = 'none';
      } else {
        element.classList.remove('is-valid');
        element.classList.add('is-invalid');
        if (errorMsg) errorMsg.style.display = 'block';
      }
    }

    function showOrderSuccess(userName, qty) {
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
      modal.style.backdropFilter = 'blur(10px)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '9999';
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 0.4s ease';

      modal.innerHTML = `
        <div class="glass-card" style="max-width: 500px; width: 90%; padding: 40px; text-align: center; border-radius: 24px; background: rgba(255,255,255,0.98); box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
          <div style="margin: 0 auto 24px; background: #e8f5e9; color: #2e7d32; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
            <i class="bi bi-bag-check-fill"></i>
          </div>
          <h2 style="font-family: var(--font-headings); font-weight: 800; color: var(--dark); margin-bottom: 12px;">Order Confirmed!</h2>
          <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 30px;">
            Thank you, <strong style="color: var(--primary);">${userName}</strong>! <br>
            You have successfully ordered <strong style="color: var(--primary); font-size: 1.1rem;">${qty}x Insulated Eco-Flask</strong>. We've sent the receipt to your email.
          </p>
          <a href="index.html" class="btn-premium btn-premium-primary w-100 justify-content-center text-decoration-none">
            Return to Home
          </a>
        </div>
      `;
      document.body.appendChild(modal);

      setTimeout(() => { modal.style.opacity = '1'; }, 50);
    }
  }
  // Helper validation functions
  function validateField(inputElement, condition, errorMessage) {
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

  // Premium success modal display
  function showSuccessModal(userName) {
    // Check if modal container already exists
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
});
