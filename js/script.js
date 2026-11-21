/* ==========================================
   ECO GREEN CONFIG
========================================== */

const STORE = {
    whatsappNumber: "917013746525",
    currency: "INR",
    minOrderPacks: 5
};

/* ==========================================
   PRODUCTS
========================================== */

const products = [
    {
        id: 1,
        name: "15-Inch Sitting Plate (Vistaraku)",
        pack: "19 Plates per Pack",
        price: 125,
        image: "images/vistaraku15.jpg"
    },
    {
        id: 2,
        name: "14-Inch Buffet Plate",
        pack: "19 Plates per Pack",
        price: 147,
        image: "images/buffet14.jpg"
    },
    {
        id: 3,
        name: "12-Inch Buffet Plate",
        pack: "19 Plates per Pack",
        price: 130,
        image: "images/buffet12.jpg"
    },
    {
        id: 4,
        name: "10-Inch Tiffin Square Plate",
        pack: "19 Plates per Pack",
        price: 110,
        image: "images/Tiffin10.png"
    }
];

/* ==========================================
   STATE
========================================== */

const quantities = {};

products.forEach(product => {
    quantities[product.id] = 0;
});

/* ==========================================
   DOM
========================================== */

const grid = document.getElementById("products-grid");
const orderBtn = document.getElementById("order-btn");
const status = document.getElementById("order-status");

const packCount = document.getElementById("pack-count");
const grandTotal = document.getElementById("grand-total");

const modal = document.getElementById("photo-modal");
const modalImage = document.getElementById("modal-image");
const modalCaption = document.getElementById("modal-caption");
const modalClose = document.getElementById("modal-close");

/* ==========================================
   HELPERS
========================================== */

const money = value =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: STORE.currency,
        maximumFractionDigits: 2
    }).format(value);

const getSelectedProducts = () =>
    products.filter(product => quantities[product.id] > 0);

const getTotalQuantity = () =>
    products.reduce(
        (sum, product) => sum + quantities[product.id],
        0
    );

const getTotalAmount = () =>
    products.reduce(
        (sum, product) => sum + (quantities[product.id] * product.price),
        0
    );

/* ==========================================
   RENDER PRODUCTS
========================================== */

function renderProducts() {

    grid.innerHTML = products.map(product => `
        <article class="product">

            <img
                class="product-photo"
                src="${product.image}"
                alt="${product.name}"
                data-photo="${product.id}"
            >

            <div class="product-content">

                <h3>${product.name}</h3>

                <span class="pack">
                    ${product.pack}
                </span>

                <div class="price">
                    ${money(product.price)}
                </div>

                <div class="quantity">

                    <button
                        type="button"
                        data-action="minus"
                        data-id="${product.id}"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>

                    <output id="qty-${product.id}">
                        0
                    </output>

                    <button
                        type="button"
                        data-action="plus"
                        data-id="${product.id}"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                    <span
                        class="line-total"
                        id="line-${product.id}"
                    >
                        ${money(0)}
                    </span>

                </div>

            </div>

        </article>
    `).join("");
}

/* ==========================================
   UPDATE TOTALS
========================================== */

function updateTotals() {

    const totalQty = getTotalQuantity();
    const totalPrice = getTotalAmount();

    products.forEach(product => {

        const qty = quantities[product.id];

        document.getElementById(
            `qty-${product.id}`
        ).textContent = qty;

        document.getElementById(
            `line-${product.id}`
        ).textContent = money(
            qty * product.price
        );
    });

    grandTotal.textContent = money(totalPrice);

    packCount.textContent =
        `${totalQty} item pack${totalQty === 1 ? "" : "s"} selected`;

    const meetsMinimum =
        totalQty >= STORE.minOrderPacks;

    orderBtn.disabled = !meetsMinimum;

    if (!meetsMinimum) {

        status.textContent =
            `Minimum order quantity is ${STORE.minOrderPacks} packs. Currently selected: ${totalQty}.`;

        orderBtn.classList.add("disabled-btn");
        orderBtn.classList.remove("enabled-btn");

    } else {

        status.textContent = "";

        orderBtn.classList.add("enabled-btn");
        orderBtn.classList.remove("disabled-btn");
    }
}

/* ==========================================
   PRODUCT CONTROLS
========================================== */

grid.addEventListener("click", event => {

    const button = event.target.closest("[data-action]");

    if (button) {

        const id = Number(button.dataset.id);

        if (button.dataset.action === "plus") {
            quantities[id]++;
        }

        if (
            button.dataset.action === "minus" &&
            quantities[id] > 0
        ) {
            quantities[id]--;
        }

        updateTotals();
        return;
    }

    const image = event.target.closest("[data-photo]");

    if (image) {

        modalImage.src = image.src;
        modalImage.alt = image.alt;

        modalCaption.textContent = image.alt;

        modal.showModal();
    }
});

/* ==========================================
   IMAGE MODAL
========================================== */

modalClose.addEventListener("click", () => {
    modal.close();
});

modal.addEventListener("click", event => {
    if (event.target === modal) {
        modal.close();
    }
});

/* ==========================================
   WHATSAPP ORDER
========================================== */

orderBtn.addEventListener("click", () => {

    const selectedProducts = getSelectedProducts();

    const totalQty = getTotalQuantity();

    if (totalQty < STORE.minOrderPacks) {

        status.textContent =
            `Please select at least ${STORE.minOrderPacks} packs.`;

        return;
    }

    if (!/^\d{10,15}$/.test(STORE.whatsappNumber)) {

        status.textContent =
            "Please configure a valid WhatsApp number.";

        return;
    }

    const totalAmount = getTotalAmount();

    const lines = selectedProducts.map(product => {

        const qty = quantities[product.id];
        const itemTotal = qty * product.price;

        return `• ${product.name}
${qty} × ${money(product.price)} = ${money(itemTotal)}`;

    });

    const message = `
Eco Green – Earth First

Order Enquiry

${lines.join("\n\n")}

Total Amount: ${money(totalAmount)}

Customer Name:
Phone Number:
Delivery Address:

Please confirm product availability and delivery charges.
`.trim();

    const whatsappURL =
        `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );

    status.textContent =
        "WhatsApp opened. Review and send your enquiry.";
});

/* ==========================================
   FOOTER YEAR
========================================== */

document.getElementById("year").textContent =
    new Date().getFullYear();

/* ==========================================
   INIT
========================================== */

renderProducts();
updateTotals();