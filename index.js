// ISA'SPORT - Client-side Business Logic & Interactive Features

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCart();
  
  // Initialize page-specific features based on current page
  if (document.querySelector('.products-grid')) {
    initCatalog();
  }
  
  if (document.querySelector('.quiz-container')) {
    initQuiz();
  }
  
  if (document.querySelector('.faq-accordion')) {
    initFAQs();
  }
  
  if (document.getElementById('contactForm')) {
    initContactForm();
  }
});

// 1. NAVIGATION & NAVBAR SYSTEM
function initNavbar() {
  const header = document.querySelector('header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  // Sticky Navbar on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpened = navMenu.classList.contains('open');
      mobileToggle.innerHTML = isOpened ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
  }
}

// 2. SHOPPING CART SYSTEM & WHATSAPP CHECKOUT
let cart = JSON.parse(localStorage.getItem('isasport_cart')) || [];

function initCart() {
  const cartToggleBtn = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCloseBtn = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  // Cart Drawer open/close
  if (cartToggleBtn && cartDrawer && cartOverlay && cartCloseBtn) {
    const toggleCart = (open) => {
      cartDrawer.classList.toggle('open', open);
      cartOverlay.classList.toggle('open', open);
    };
    
    cartToggleBtn.addEventListener('click', () => toggleCart(true));
    cartCloseBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));
  }
  
  // Checkout via WhatsApp
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      
      let message = `¡Hola ISA'SPORT! Me gustaría realizar el siguiente pedido desde la página web:\n\n`;
      let total = 0;
      
      cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        message += `*${index + 1}. ${item.title}*\n`;
        message += `   Cantidad: ${item.quantity}\n`;
        message += `   Precio: L ${item.price.toFixed(2)} c/u (Subtotal: L ${itemTotal.toFixed(2)})\n\n`;
        total += itemTotal;
      });
      
      message += `*Total estimado del pedido: L ${total.toFixed(2)}*\n\n`;
      message += `Por favor, confírmenme la disponibilidad y los detalles de entrega. ¡Muchas gracias!`;
      
      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/50433246387?text=${encodedMsg}`; // WhatsApp contact number from context/form
      window.open(whatsappUrl, '_blank');
    });
  }
  
  updateCartUI();
}

function addToCart(id, title, price, image) {
  const existingItemIndex = cart.findIndex(item => item.id === id);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({ id, title, price, image, quantity: 1 });
  }
  
  localStorage.setItem('isasport_cart', JSON.stringify(cart));
  updateCartUI();
  
  // Open the cart drawer automatically to show items
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
  }
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCountEl = document.querySelector('.cart-count');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  
  if (!cartItemsContainer) return;
  
  cartItemsContainer.innerHTML = '';
  
  let totalCount = 0;
  let totalPrice = 0;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-msg">
        <i class="fas fa-shopping-bag"></i>
        <p>Tu carrito está vacío</p>
        <a href="catalogo.html" class="btn btn-primary" style="margin-top: 1rem; padding: 0.75rem 1.5rem; font-size: 0.9rem;">Explorar Catálogo</a>
      </div>
    `;
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    cart.forEach(item => {
      totalCount += item.quantity;
      totalPrice += item.price * item.quantity;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
          <span class="cart-item-title">${item.title}</span>
          <span class="cart-item-price">L ${item.price.toFixed(2)}</span>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)"><i class="fas fa-minus"></i></button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem('${item.id}')"><i class="fas fa-trash-alt"></i></button>
      `;
      cartItemsContainer.appendChild(itemEl);
    });
  }
  
  if (cartCountEl) cartCountEl.textContent = totalCount;
  if (cartTotalEl) cartTotalEl.textContent = `L ${totalPrice.toFixed(2)}`;
}

window.updateItemQty = function(id, change) {
  const index = cart.findIndex(item => item.id === id);
  if (index > -1) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    localStorage.setItem('isasport_cart', JSON.stringify(cart));
    updateCartUI();
  }
};

window.removeCartItem = function(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('isasport_cart', JSON.stringify(cart));
  updateCartUI();
};


// 3. CATALOG FILTERING
const products = [
  {
    id: 'conjunto-deportivo',
    title: 'Conjunto Seamless Active',
    category: 'sets',
    price: 650.00,
    image: 'assets/conjunto_premium.png',
    desc: 'Conjunto premium ultra-elástico de top y leggings de tiro alto. Tejido transpirable y sin costuras que esculpe y apoya cada movimiento.',
    badge: 'Más Vendido'
  },
  {
    id: 'leggings-premium',
    title: 'Leggings Esculpidoras Pro',
    category: 'leggings',
    price: 420.00,
    image: 'assets/leggings_premium.png',
    desc: 'Leggings de compresión firme y secado rápido. Su diseño de cintura alta ofrece soporte abdominal superior y efecto moldeador estilizado.',
    badge: 'Premium'
  },
  {
    id: 'chaqueta-deportiva',
    title: 'Chaqueta Cortavientos Elite',
    category: 'jackets',
    price: 580.00,
    image: 'assets/chaqueta_deportiva.png',
    desc: 'Chaqueta ligera con cierre completo y bolsillos seguros. Protege contra el viento y lluvia ligera, ideal para entrenar al aire libre.',
    badge: 'Nuevo'
  },
  {
    id: 'top-deportivo',
    title: 'Top Support Ergonómico',
    category: 'tops',
    price: 320.00,
    image: 'assets/top_deportivo.png',
    desc: 'Top deportivo de alta sujeción con copas removibles y tirantes cruzados. Diseñado para entrenamientos de mediano y alto impacto.',
    badge: 'Popular'
  },
  {
    id: 'shorts-running',
    title: 'Short Fitness Transpirable',
    category: 'shorts',
    price: 290.00,
    image: 'assets/top_deportivo.png', // Fallback to sports image if needed
    desc: 'Short deportivo cómodo de doble capa con forro interno. Evita la fricción y absorbe el sudor para máxima comodidad durante tu carrera.',
    badge: 'Básico'
  }
];

function initCatalog() {
  const productsGrid = document.querySelector('.products-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  if (!productsGrid) return;
  
  const displayProducts = (category = 'all') => {
    productsGrid.innerHTML = '';
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    
    if (filtered.length === 0) {
      productsGrid.innerHTML = `<div class="no-products"><p>No se encontraron productos en esta categoría.</p></div>`;
      return;
    }
    
    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
        <div class="product-image-container">
          <img src="${p.image}" alt="${p.title}">
        </div>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <h3 class="product-title">${p.title}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-price-row">
            <span class="product-price">L ${p.price.toFixed(2)}</span>
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}', '${p.title}', ${p.price}, '${p.image}')" title="Añadir al Pedido">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      `;
      productsGrid.appendChild(card);
    });
  };
  
  // Set up event listeners for filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // Handle either direct click or parent click on button
      const clickedBtn = e.target.closest('.filter-btn');
      clickedBtn.classList.add('active');
      
      const category = clickedBtn.getAttribute('data-filter');
      displayProducts(category);
    });
  });
  
  // Initial display
  displayProducts('all');
}


// 4. INTERACTIVE STYLE ADVISOR QUIZ
function initQuiz() {
  const steps = document.querySelectorAll('.quiz-step');
  const progressBar = document.getElementById('quizProgress');
  const nextBtns = document.querySelectorAll('.next-step-btn');
  const prevBtns = document.querySelectorAll('.prev-step-btn');
  const cards = document.querySelectorAll('.quiz-card');
  const resultScreen = document.getElementById('quizResult');
  const resultBadge = document.getElementById('recBadge');
  const resultRecsGrid = document.getElementById('recProductsGrid');
  const startOverBtn = document.getElementById('quizRestart');
  
  let currentStep = 0;
  let quizData = {
    cuerpo: '',
    objetivo: '',
    estilo: ''
  };
  
  // Progress Bar update
  const updateProgress = () => {
    if (!progressBar) return;
    const progress = ((currentStep) / (steps.length - 1)) * 100;
    progressBar.style.width = `${progress}%`;
  };
  
  // Step navigation
  const showStep = (stepIdx) => {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === stepIdx);
    });
    currentStep = stepIdx;
    updateProgress();
  };
  
  // Card selection
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const stepGroup = card.closest('.quiz-step');
      const stepCards = stepGroup.querySelectorAll('.quiz-card');
      
      stepCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      // Store selection data
      const category = stepGroup.getAttribute('data-quiz-category');
      const val = card.getAttribute('data-value');
      quizData[category] = val;
      
      // Auto enable/click Next button or just auto-advance after small delay
      const nextBtn = stepGroup.querySelector('.next-step-btn');
      if (nextBtn) {
        nextBtn.removeAttribute('disabled');
      }
    });
  });
  
  // Button Event Listeners
  nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        showStep(currentStep + 1);
      } else {
        // We reached the end, compute recommendation
        showResults();
      }
    });
  });
  
  prevBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep > 0) {
        showStep(currentStep - 1);
      }
    });
  });
  
  if (startOverBtn) {
    startOverBtn.addEventListener('click', () => {
      // Clear data
      quizData = { cuerpo: '', objetivo: '', estilo: '' };
      cards.forEach(c => c.classList.remove('selected'));
      nextBtns.forEach(btn => {
        if (!btn.classList.contains('finish-quiz')) {
          btn.setAttribute('disabled', 'true');
        }
      });
      resultScreen.classList.remove('active');
      showStep(0);
    });
  }
  
  // Display final recommendations
  const showResults = () => {
    steps.forEach(step => step.classList.remove('active'));
    resultScreen.classList.add('active');
    
    // Custom algorithm based on inputs
    let recs = [];
    let badgeText = '';
    
    if (quizData.objetivo === 'gym' || quizData.objetivo === 'intensity') {
      recs = [products[0], products[1]]; // Seamless Set + Sculpting Leggings
      badgeText = 'Colección Alto Rendimiento & Estilo';
    } else if (quizData.objetivo === 'running') {
      recs = [products[1], products[2]]; // Leggings + Jacket
      badgeText = 'Colección Cardio & Resistencia';
    } else { // casual / yoga
      recs = [products[0], products[3]]; // Set + Sports Top
      badgeText = 'Colección Confort y Bienestar';
    }
    
    if (resultBadge) resultBadge.textContent = badgeText;
    
    if (resultRecsGrid) {
      resultRecsGrid.innerHTML = '';
      recs.forEach(p => {
        const itemEl = document.createElement('div');
        itemEl.className = 'rec-card';
        itemEl.innerHTML = `
          <div class="rec-card-img">
            <img src="${p.image}" alt="${p.title}">
          </div>
          <div class="rec-card-info">
            <span class="rec-card-title">${p.title}</span>
            <span class="rec-card-price">L ${p.price.toFixed(2)}</span>
            <button class="btn btn-primary rec-card-btn" onclick="addToCart('${p.id}', '${p.title}', ${p.price}, '${p.image}')">
              Añadir al Pedido
            </button>
          </div>
        `;
        resultRecsGrid.appendChild(itemEl);
      });
    }
    
    // Set up direct WhatsApp recommendation order button
    const orderQuizBtn = document.getElementById('orderQuizBtn');
    if (orderQuizBtn) {
      orderQuizBtn.onclick = () => {
        let msg = `¡Hola ISA'SPORT! Realicé el test de Asesoría de Estilo en tu sitio web y me recomendó la *${badgeText}*.\n\n`;
        msg += `Mis respuestas:\n`;
        msg += `- Tipo de cuerpo: *${quizData.cuerpo}*\n`;
        msg += `- Actividad / Meta: *${quizData.objetivo}*\n`;
        msg += `- Enfoque estético: *${quizData.estilo}*\n\n`;
        msg += `Me gustaría consultar disponibilidad de las prendas recomendadas:\n`;
        recs.forEach(p => {
          msg += `- ${p.title} (L ${p.price.toFixed(2)})\n`;
        });
        msg += `\n¿Me pueden asesorar con las tallas? ¡Muchas gracias!`;
        
        window.open(`https://wa.me/50433246387?text=${encodeURIComponent(msg)}`, '_blank');
      };
    }
  };
}


// 5. FAQ ACCORDION
function initFAQs() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      // Close other active items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      item.classList.toggle('active');
    });
  });
}


// 6. CONTACT FORM HANDLING
function initContactForm() {
  const form = document.getElementById('contactForm');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('formName').value;
      const email = document.getElementById('formEmail').value;
      const subject = document.getElementById('formSubject').value;
      const message = document.getElementById('formMessage').value;
      
      let msg = `¡Hola ISA'SPORT! Mi nombre es *${name}* (${email}).\n`;
      msg += `Te escribo por el siguiente motivo: *${subject}*\n\n`;
      msg += `Mensaje:\n"${message}"`;
      
      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/50433246387?text=${encodedMsg}`, '_blank');
      
      // Clear form
      form.reset();
      alert('¡Gracias por tu mensaje! Serás redirigido a WhatsApp para enviar tu consulta.');
    });
  }
}
