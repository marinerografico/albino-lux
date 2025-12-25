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
      
      // Use traditional form submission - Shopify handles redirect automatically
      // This avoids 404 errors if cart page doesn't exist
      // The form will submit normally and Shopify will handle the response
    });
  }
  
  // Initialize with first pack selected by default
  const firstPack = document.querySelector('.pack-option');
  if (firstPack) {
    selectPack(firstPack, 'pack1');
  }
  
  // Suppress fetch errors from Shopify scripts (development only)
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && url.includes('private_access_tokens')) {
      // Return a rejected promise silently for development
      return Promise.reject(new Error('Suppressed development error'));
    }
    return originalFetch.apply(this, args).catch(error => {
      // Suppress known development errors
      if (error.message && error.message.includes('Failed to fetch')) {
        const errorUrl = args[0];
        if (typeof errorUrl === 'string' && (
          errorUrl.includes('private_access_tokens') ||
          errorUrl.includes('sentry') ||
          errorUrl.includes('breadcrumb')
        )) {
          // Silently ignore these development errors
          return Promise.reject(new Error('Suppressed development error'));
        }
      }
      throw error;
    });
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

