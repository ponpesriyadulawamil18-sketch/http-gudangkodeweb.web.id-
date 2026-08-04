/**
 * GlowTravel Premium Ticketing JS Script
 * Master Frontend Logic for Filtering, Modal Booking, and Custom Order Button Animations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // CONSTANTS & SELECTIONS
    // ----------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    const modalOverlay = document.getElementById('booking-modal');
    const modalCloseBtn = document.getElementById('close-modal');
    const bookingForm = document.getElementById('booking-form');
    const orderBtn = document.getElementById('order-btn');
    const bookingButtons = document.querySelectorAll('.card__btn');

    // Form inputs
    const formProduct = document.getElementById('form-product');
    const formPrice = document.getElementById('form-price');
    const formQty = document.getElementById('form-qty');
    const formName = document.getElementById('form-name');
    const formDate = document.getElementById('form-date');
    const formContact = document.getElementById('form-contact');
    
    // Labels inside Modal
    const labelQty = document.getElementById('label-qty');
    const labelDate = document.getElementById('label-date');

    // SVG elements inside Animated Order Button
    const animCargo = document.getElementById('anim-cargo');
    const animVehicle = document.getElementById('anim-vehicle');

    // Telegram Configurations
    const TELEGRAM_ADMIN_USERNAME = 'GlowTravelAdmin'; // Change to your Telegram Admin Username

    // Track active item information
    let activeBookingType = ''; // 'flight', 'hotel', or 'train'

    // ----------------------------------------------------
    // CATEGORY FILTER LOGIC
    // ----------------------------------------------------
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Toggle active state on buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');

            // Hide/Show cards based on category
            cards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    // Trigger a smooth entry animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ----------------------------------------------------
    // TRAVEL SVG SETTINGS FOR ANIMATED BUTTON
    // ----------------------------------------------------
    const travelButtonAssets = {
        flight: {
            cargo: `
                <rect x="3" y="5" width="18" height="14" rx="2" fill="var(--box)" />
                <path d="M 8 5 V 2 H 16 V 5" stroke="%23110920" stroke-width="1.5" fill="none" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="%23110920" stroke-width="1.5" opacity="0.3" />
            `,
            vehicle: `
                <!-- Jet Airplane -->
                <path d="M 5 21 L 22 18 L 48 4 L 54 4 L 43 18 L 56 16 L 61 21 L 44 22 L 32 23 L 12 25 Z" fill="var(--truck)" filter="drop-shadow(0 0 5px rgba(192,132,252,0.6))" />
                <path d="M 32 18 L 36 7 L 40 7 L 34 18 Z" fill="%239333ea" />
                <path d="M 31 23 L 26 29 L 23 29 L 29 23 Z" fill="%23e879f9" />
            `
        },
        train: {
            cargo: `
                <!-- Glowing Train Ticket -->
                <rect x="2" y="6" width="20" height="12" rx="1.5" fill="var(--box)" />
                <path d="M 6 10 H 18 M 6 14 H 18" stroke="%23110920" stroke-width="1.2" opacity="0.4" />
                <circle cx="16" cy="10" r="1.5" fill="%239333ea" />
            `,
            vehicle: `
                <!-- High-Speed Train Nose -->
                <path d="M 2 22 L 40 18 C 48 18, 56 15, 62 9 L 62 25 L 2 25 Z" fill="var(--truck)" filter="drop-shadow(0 0 5px rgba(192,132,252,0.6))" />
                <rect x="6" y="14" width="8" height="5" rx="0.5" fill="%23ffffff" opacity="0.8" />
                <rect x="18" y="14" width="8" height="5" rx="0.5" fill="%23ffffff" opacity="0.8" />
                <rect x="30" y="14" width="8" height="5" rx="0.5" fill="%23ffffff" opacity="0.8" />
                <circle cx="15" cy="22" r="3" fill="#0f0814" />
                <circle cx="30" cy="22" r="3" fill="#0f0814" />
                <circle cx="45" cy="22" r="3" fill="#0f0814" />
            `
        },
        hotel: {
            cargo: `
                <!-- Luxury Hotel Room Key -->
                <circle cx="12" cy="8" r="4.5" fill="none" stroke="var(--box)" stroke-width="2.2" />
                <rect x="10" y="12.5" width="4" height="9" fill="var(--box)" />
                <path d="M 14 15 h 3 M 14 18 h 3" stroke="var(--box)" stroke-width="1.8" stroke-linecap="round" />
            `,
            vehicle: `
                <!-- Limousine/Luxury Cab -->
                <path d="M 5 22 C 5 18, 8 17, 12 17 H 20 L 26 12 H 44 L 50 17 H 58 C 61 17, 63 19, 63 22 Z" fill="var(--truck)" filter="drop-shadow(0 0 5px rgba(192,132,252,0.5))" />
                <rect x="28" y="13" width="7" height="4" fill="%23ffffff" rx="0.5" />
                <rect x="37" y="13" width="7" height="4" fill="%23ffffff" rx="0.5" />
                <circle cx="16" cy="22" r="4.5" fill="#0f0814" />
                <circle cx="52" cy="22" r="4.5" fill="#0f0814" />
            `
        }
    };

    // ----------------------------------------------------
    // BOOKING MODAL ACTIONS
    // ----------------------------------------------------
    bookingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-product');
            const price = button.getAttribute('data-price');
            const type = button.getAttribute('data-type'); // 'flight', 'hotel', 'train'

            activeBookingType = type;

            // Fill inputs with selected details
            formProduct.value = productName;
            formPrice.value = price;

            // Customize inputs label according to travel type
            if (type === 'hotel') {
                labelQty.innerText = 'Jumlah Kamar';
                labelDate.innerText = 'Tanggal Check-in';
                formQty.innerHTML = `
                    <option value="1 Kamar">1 Kamar</option>
                    <option value="2 Kamar">2 Kamar</option>
                    <option value="3 Kamar">3 Kamar</option>
                    <option value="4 Kamar">4 Kamar</option>
                    <option value="5 Kamar">5 Kamar</option>
                `;
            } else {
                labelQty.innerText = 'Jumlah Tiket';
                labelDate.innerText = 'Tanggal Keberangkatan';
                formQty.innerHTML = `
                    <option value="1 Tiket (1 Dewasa)">1 Tiket (1 Dewasa)</option>
                    <option value="2 Tiket (2 Dewasa)">2 Tiket (2 Dewasa)</option>
                    <option value="3 Tiket (3 Dewasa)">3 Tiket (3 Dewasa)</option>
                    <option value="4 Tiket (4 Dewasa)">4 Tiket (4 Dewasa)</option>
                    <option value="5 Tiket (5 Dewasa)">5 Tiket (5 Dewasa)</option>
                `;
            }

            // Set current date limit
            const today = new Date().toISOString().split('T')[0];
            formDate.min = today;
            formDate.value = today;

            // Load travel animated button assets
            const assets = travelButtonAssets[type] || travelButtonAssets.flight;
            animCargo.innerHTML = assets.cargo;
            animVehicle.innerHTML = assets.vehicle;

            // Reset order button animation states
            orderBtn.classList.remove('animating', 'done');

            // Open Modal Smoothly
            modalOverlay.classList.add('open');
            modalOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Lock background scrolling
        });
    });

    // Close Modal Logic
    const closeModal = () => {
        modalOverlay.classList.remove('open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Unlock background scrolling
        bookingForm.reset();
    };

    modalCloseBtn.addEventListener('click', closeModal);

    // Close on overlay clicking
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // ----------------------------------------------------
    // SUBMIT BOOKING & TELEGRAM INTEGRATION
    // ----------------------------------------------------
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Lock form inputs during animation
        if (orderBtn.classList.contains('animating') || orderBtn.classList.contains('done')) return;

        // Collect Form Data
        const name = formName.value.trim();
        const date = formDate.value;
        const qty = formQty.value;
        const contact = formContact.value.trim();
        const product = formProduct.value;
        const price = formPrice.value;

        // Trigger Master CSS/JS Animated Order Button
        orderBtn.classList.add('animating');

        // Formats Dates to Indonesian View
        const formatDateIndo = (dateString) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('id-ID', options);
        };

        // Construct Custom Pre-filled Telegram Message
        const messageTitle = activeBookingType === 'hotel' ? '🏨 PEMESANAN HOTEL LUXURY' : 
                             activeBookingType === 'train' ? '🚄 PEMESANAN TIKET KERETA SLEEPER' : 
                                                             '✈️ PEMESANAN TIKET PESAWAT';

        const telegramText = `Halo Admin GlowTravel, saya ingin memesan tiket:\n\n` +
            `*${messageTitle}*\n` +
            `• Layanan: _${product}_\n` +
            `• Harga: _${price}_\n\n` +
            `*✦ DETAIL PEMESAN*\n` +
            `• Nama Lengkap: *${name}*\n` +
            `• Tanggal: *${formatDateIndo(date)}*\n` +
            `• Jumlah: *${qty}*\n` +
            `• Kontak HP: *${contact}*\n\n` +
            `Mohon konfirmasi ketersediaan tiket & detail metode pembayaran. Terima kasih!`;

        // 3.5s Delay representing Cargo Loading Animation
        setTimeout(() => {
            orderBtn.classList.remove('animating');
            orderBtn.classList.add('done');

            // Send to Telegram after animation completes
            setTimeout(() => {
                const encodedMessage = encodeURIComponent(telegramText);
                const telegramUrl = `https://t.me/${TELEGRAM_ADMIN_USERNAME}?text=${encodedMessage}`;
                
                // Open Telegram in a new window/tab
                window.open(telegramUrl, '_blank');
                
                // Close modal and reset form
                closeModal();
            }, 1000);

        }, 3500); // 3.5 seconds match CSS animation duration
    });
});
