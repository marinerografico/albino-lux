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
      .then(response => response.json())
      .then(data => {
        // Check if quantity was adjusted (Shopify returns this in the response)
        if (data && data.message && data.message.includes('quantity')) {
          // Quantity was adjusted - show modal
          const productName = buyForm.closest('section')?.querySelector('h2')?.textContent || 'valentón';
          const packName = document.querySelector('.pack-option.active')?.querySelector('span')?.textContent || 'para amor propio';
          
          // Get product image
          const productImage = document.querySelector('.bottle-container')?.src || '';
          
          showCartUpdateModal({
            name: productName.trim(),
            image: productImage,
            pack: packName.trim(),
            oldQuantity: selectedQuantity + ' botella' + (selectedQuantity > 1 ? 's' : ''),
            newQuantity: (data.quantity || 1) + ' botella' + ((data.quantity || 1) > 1 ? 's' : '')
          });
        } else {
          // Success - redirect to checkout
          window.location.href = '/checkout';
        }
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
          return response;
        });
      };
    }
  }
});

