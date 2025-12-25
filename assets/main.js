// Suppress known Shopify development errors (these are normal and don't affect functionality)
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    const errorMessage = args.join(' ');
    // Suppress known Shopify development errors
    if (
      errorMessage.includes('private_access_tokens') ||
      errorMessage.includes('BreadcrumbsPluginFetchError') ||
      errorMessage.includes('Failed to execute action') ||
      errorMessage.includes('Suppressed Error exporting logs')
    ) {
      // Silently ignore these development errors
      return;
    }
    originalError.apply(console, args);
  };
}

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// Intersection Observer for Scroll Reveals
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('hidden-state');
        entry.target.classList.add('visible-state');
      }
    });
  }, observerOptions);

  const elements = document.querySelectorAll('.reveal-text');
  elements.forEach(el => observer.observe(el));
});

// Pack Selection Logic
let selectedQuantity = 1;

function selectPack(element, packId) {
  // Reset all indicators and remove active state
  document.querySelectorAll('.pack-indicator').forEach(el => {
    el.classList.remove('w-full');
    el.classList.add('w-0');
  });
  
  document.querySelectorAll('.pack-option').forEach(el => {
    el.classList.remove('active');
  });

  // Activate selected indicator
  const indicator = document.getElementById(packId + '-indicator');
  if (indicator) {
    indicator.classList.remove('w-0');
    indicator.classList.add('w-full');
  }
  
  // Add active state to selected pack
  if (element) {
    element.classList.add('active');
    
    // Extract quantity from data attribute
    const quantityText = element.getAttribute('data-quantity') || '1 botella';
    const quantityMatch = quantityText.match(/\d+/);
    selectedQuantity = quantityMatch ? parseInt(quantityMatch[0]) : 1;
    
    // Update quantity input
    const quantityInput = document.getElementById('product-quantity');
    if (quantityInput) {
      quantityInput.value = selectedQuantity;
    }
  }
}

// Handle form submission for add to cart
document.addEventListener('DOMContentLoaded', () => {
  const buyForm = document.querySelector('form[action="/cart/add"]');
  if (buyForm) {
    buyForm.addEventListener('submit', function(e) {
      // Ensure quantity is set
      const quantityInput = document.getElementById('product-quantity');
      if (quantityInput && selectedQuantity) {
        quantityInput.value = selectedQuantity;
      }
      
      // Try AJAX first to catch quantity adjustments
      e.preventDefault();
      
      const formData = new FormData(buyForm);
      const variantId = formData.get('id');
      const quantity = formData.get('quantity');
      
      fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Check if we need to verify quantity (Shopify might adjust it)
        // First, get the current cart to check if quantity was adjusted
        return fetch('/cart.js')
          .then(cartResponse => cartResponse.json())
          .then(cart => {
            // Find the item we just added
            const addedItem = cart.items.find(item => item.variant_id == variantId);
            
            if (addedItem && addedItem.quantity < selectedQuantity) {
              // Quantity was adjusted - show modal
              const productName = buyForm.closest('section')?.querySelector('h2')?.textContent || 'valentón';
              const packOption = document.querySelector('.pack-option.active');
              const packName = packOption?.querySelector('.font-serif')?.textContent?.trim() || 'para amor propio';
              
              // Get product image
              const productImage = document.querySelector('.bottle-container')?.src || 
                                   document.querySelector('img[alt*="Botella"]')?.src || '';
              
              showCartUpdateModal({
                name: productName.trim(),
                image: productImage,
                pack: packName,
                oldQuantity: selectedQuantity + ' botella' + (selectedQuantity > 1 ? 's' : ''),
                newQuantity: addedItem.quantity + ' botella' + (addedItem.quantity > 1 ? 's' : '')
              });
            } else {
              // Success - update cart count and show cart modal
              if (typeof updateCartCount === 'function') {
                updateCartCount();
              }
              // Show cart modal instead of redirecting
              if (typeof toggleCart === 'function') {
                toggleCart();
              } else {
                window.location.href = '/cart';
              }
            }
          });
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        // Fallback to regular form submission
        buyForm.submit();
      });
    });
  }
  
  // Initialize with first pack selected by default
  const firstPack = document.querySelector('.pack-option');
  if (firstPack) {
    selectPack(firstPack, 'pack1');
  }
  
  // Suppress known Shopify development fetch errors (only for specific URLs)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    // Only suppress known development endpoints
    if (typeof url === 'string' && (
      url.includes('private_access_tokens') ||
      url.includes('/sf_private_access_tokens')
    )) {
      // Silently reject - these are development-only endpoints
      return Promise.reject(new Error('Suppressed: Development endpoint'));
    }
    // For all other requests, use original fetch
    return originalFetch.apply(this, args);
  };
});

// Age Gate Logic
function enterSite() {
  const gate = document.getElementById('age-gate');
  const body = document.getElementById('main-body');
  
  if (!gate || !body) return;
  
  // Add fade out class
  gate.classList.add('hidden-gate');
  
  // Remove overflow hidden from body to allow scrolling
  setTimeout(() => {
    body.classList.remove('overflow-hidden');
    body.classList.add('overflow-x-hidden');
  }, 500);
}

// Cart Update Modal Logic
function showCartUpdateModal(productData) {
  const modal = document.getElementById('cart-update-modal');
  if (!modal) return;
  
  // Set product data
  if (productData) {
    const imageEl = document.getElementById('cart-update-product-image');
    const nameEl = document.getElementById('cart-update-product-name');
    const packEl = document.getElementById('cart-update-pack-name');
    const oldQtyEl = document.getElementById('cart-update-old-quantity');
    const newQtyEl = document.getElementById('cart-update-new-quantity');
    
    if (imageEl && productData.image) {
      imageEl.src = productData.image;
      imageEl.alt = productData.name || '';
    }
    if (nameEl) nameEl.textContent = productData.name || '';
    if (packEl) packEl.textContent = productData.pack || '';
    if (oldQtyEl) oldQtyEl.textContent = productData.oldQuantity || '';
    if (newQtyEl) newQtyEl.textContent = productData.newQuantity || '';
  }
  
  // Show modal with animation
  modal.classList.remove('hidden');
  const content = modal.querySelector('.cart-update-content');
  if (content) {
    content.classList.remove('fade-out');
  }
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

function closeCartUpdateModal() {
  const modal = document.getElementById('cart-update-modal');
  if (!modal) return;
  
  const content = modal.querySelector('.cart-update-content');
  if (content) {
    content.classList.add('fade-out');
  }
  
  setTimeout(() => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 300);
}

function proceedWithRitual() {
  // Redirect to checkout
  window.location.href = '/checkout';
}

// Update cart count in navigation
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const cartCount = document.getElementById('cart-item-count');
      const cartCountSpan = document.querySelector('.cart-count');
      
      if (cartCount && cart.item_count > 0) {
        cartCount.textContent = cart.item_count;
        if (cartCountSpan) cartCountSpan.classList.remove('hidden');
      } else {
        if (cartCountSpan) cartCountSpan.classList.add('hidden');
      }
      
      // Update cart modal if open
      if (typeof loadCartModal === 'function') {
        loadCartModal(cart);
      }
    })
    .catch(error => {
      // Silently fail if cart is not available
    });
}

// Format money helper
function formatMoney(cents) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(cents / 100);
}

// Load cart items into modal
function loadCartModal(cart) {
  const container = document.getElementById('cart-items-container');
  const emptyMessage = document.getElementById('cart-empty-message');
  const summary = document.getElementById('cart-summary');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  
  if (!container) return;
  
  // Clear container
  container.innerHTML = '';
  
  if (cart.items && cart.items.length > 0) {
    // Hide empty message
    if (emptyMessage) emptyMessage.style.display = 'none';
    if (summary) summary.classList.remove('hidden');
    if (checkoutBtn) checkoutBtn.classList.remove('hidden');
    
    // Render items
    cart.items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'flex items-center gap-4 p-4 border border-neutral-100 rounded-2xl bg-neutral-50/50 hover:border-neutral-200 transition-colors';
      
      // Get image URL (handle different Shopify image formats)
      const imageUrl = item.image ? item.image : '';
      
      itemDiv.innerHTML = `
        <div class="h-16 w-16 shrink-0 bg-white rounded-xl overflow-hidden border border-neutral-100 flex items-center justify-center">
          <img src="${imageUrl}" alt="${item.product_title || item.title}" class="h-full w-auto object-cover mix-blend-multiply opacity-90" onerror="this.style.display='none'">
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-neutral-900 truncate lowercase">${(item.product_title || item.title).toLowerCase()}</h4>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<p class="text-xs text-neutral-500 truncate mt-0.5">${item.variant_title}</p>` : ''}
          <div class="flex items-center gap-3 mt-2">
            <button type="button" onclick="updateCartItemQuantity('${item.key}', ${item.quantity - 1})" class="text-neutral-400 hover:text-neutral-900 transition-colors text-xs w-6 h-6 flex items-center justify-center">−</button>
            <span class="text-xs text-neutral-600 font-medium min-w-[20px] text-center">${item.quantity}</span>
            <button type="button" onclick="updateCartItemQuantity('${item.key}', ${item.quantity + 1})" class="text-neutral-400 hover:text-neutral-900 transition-colors text-xs w-6 h-6 flex items-center justify-center">+</button>
          </div>
        </div>
        <div class="text-right">
          <span class="text-xs font-semibold text-neutral-900 block">${formatMoney(item.line_price)}</span>
          <span class="text-[10px] text-neutral-400 font-medium">${item.quantity} ${item.quantity === 1 ? 'ud.' : 'uds.'}</span>
          <button type="button" onclick="removeCartItem('${item.key}')" class="text-[10px] text-neutral-400 hover:text-neutral-900 transition-colors mt-1 block">eliminar</button>
        </div>
      `;
      container.appendChild(itemDiv);
    });
    
    // Update totals
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    if (totalEl) totalEl.textContent = formatMoney(cart.total_price);
  } else {
    // Show empty message
    if (emptyMessage) emptyMessage.style.display = 'block';
    if (summary) summary.classList.add('hidden');
    if (checkoutBtn) checkoutBtn.classList.add('hidden');
  }
}

// Cart Modal Toggle
function toggleCart() {
  const modal = document.getElementById('cart-modal');
  const backdrop = document.getElementById('cart-backdrop');
  const content = document.getElementById('cart-content');
  
  if (!modal) return;
  
  if (modal.classList.contains('hidden')) {
    // Open
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Load cart data
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        loadCartModal(cart);
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => {
          if (backdrop) backdrop.classList.remove('opacity-0');
          if (content) {
            content.classList.remove('opacity-0', 'scale-95');
            content.classList.add('opacity-100', 'scale-100');
          }
        }, 10);
      })
      .catch(error => {
        console.error('Error loading cart:', error);
      });
  } else {
    // Close
    if (backdrop) backdrop.classList.add('opacity-0');
    if (content) {
      content.classList.remove('opacity-100', 'scale-100');
      content.classList.add('opacity-0', 'scale-95');
    }
    
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
}

// Update cart item quantity
function updateCartItemQuantity(key, quantity) {
  if (quantity < 1) {
    removeCartItem(key);
    return;
  }
  
  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: key,
      quantity: parseInt(quantity)
    })
  })
  .then(response => response.json())
  .then(cart => {
    loadCartModal(cart);
    updateCartCount();
  })
  .catch(error => {
    console.error('Error updating cart:', error);
  });
}

// Remove cart item
function removeCartItem(key) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: key,
      quantity: 0
    })
  })
  .then(response => response.json())
  .then(cart => {
    loadCartModal(cart);
    updateCartCount();
  })
  .catch(error => {
    console.error('Error removing item:', error);
  });
}

// Listen for Shopify cart update events
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're coming from a cart update
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('cart_updated') === 'true') {
    // Get product data from URL params or localStorage
    const productData = {
      name: urlParams.get('product_name') || 'valentón',
      image: urlParams.get('product_image') || '',
      pack: urlParams.get('pack') || 'para amor propio',
      oldQuantity: urlParams.get('old_quantity') || '',
      newQuantity: urlParams.get('new_quantity') || '1 botella'
    };
    
    showCartUpdateModal(productData);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // Update cart count on page load
  updateCartCount();
  
  // Listen for Shopify cart API responses
  if (typeof Shopify !== 'undefined' && Shopify.cart) {
    const originalAddItem = Shopify.cart.addItem;
    if (originalAddItem) {
      Shopify.cart.addItem = function(...args) {
        return originalAddItem.apply(this, args).then(response => {
          // Check if quantity was adjusted
          if (response && response.status === 200) {
            const data = response.json ? response.json() : response;
            // Handle quantity adjustments if needed
          }
          // Update cart count after adding item
          updateCartCount();
          return response;
        });
      };
    }
  }
});

