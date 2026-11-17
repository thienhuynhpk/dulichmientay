// ===========================
// CONFIG & DATA
// ===========================
const PRICES = {
    "Cần Thơ": 500000,
    "Hậu Giang": 450000,
    "Sóc Trăng": 400000
};

const $ = id => document.getElementById(id);

// Định dạng tiền tệ VNĐ
const formatMoney = value => value.toLocaleString("vi-VN") + " VNĐ";

// ===========================
// MAIN DOM LOADED EVENT
// ===========================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Khởi tạo năm tự động cho Footer
    const yearEl = $("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 2. Khởi tạo tính năng Back to Top
    initBackToTop();

    // 3. Khởi tạo tính năng Tour & Form đăng ký (Tích hợp chuyển sang Admin)
    //initTourForm();

    // 4. Khởi tạo hiệu ứng Counter thống kê
    initCounters();

    // 5. Khởi tạo hệ thống Quản lý bài viết & Đơn hàng cho Admin & Danh Lam
    initArticleManager();
    loadAdminBookings();
    loadAdminPosts();

    console.log("Website Du Lịch Miền Tây đã tải thành công!");
});

// ===========================
// BACK TO TOP
// ===========================
function initBackToTop() {
    const topBtn = $("topBtn");
    if (!topBtn) return;

    window.addEventListener("scroll", () => {
        topBtn.style.display = window.scrollY > 300 ? "block" : "none";
    });

    topBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ===========================
// TOUR FORM & PRICE CALCULATION
// ===========================
function initTourForm() {
    const locationSelect = $("location");
    const quantityInput = $("quantity");
    const priceDisplay = $("price");
    const totalPriceDisplay = $("totalPrice");
    const tourForm = $("tourForm");

    function updatePrice() {
        if (!locationSelect || !priceDisplay) return;

        const location = locationSelect.value;
        const price = PRICES[location] || 0;
        const quantity = parseInt(quantityInput?.value) || 1;
        const total = price * quantity;

        priceDisplay.textContent = formatMoney(price);
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = formatMoney(total);
        }
    }

    if (locationSelect && quantityInput) {
        locationSelect.addEventListener("change", updatePrice);
        quantityInput.addEventListener("input", updatePrice);
        updatePrice(); // Chạy ngay khi load trang
    }

    if (tourForm) {
        tourForm.addEventListener("submit", e => {
            e.preventDefault();

            const name = $("name")?.value.trim();
            const email = $("email")?.value.trim();
            const phone = $("phone")?.value.trim();
            const date = $("date")?.value;
            const location = locationSelect?.value;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^(03|05|07|08|09)\d{8}$/;

            if (!name) return alert("Vui lòng nhập họ tên!");
            if (!emailRegex.test(email)) return alert("Email không hợp lệ!");
            if (!phoneRegex.test(phone)) return alert("Số điện thoại không hợp lệ!");
            if (!date) return alert("Vui lòng chọn ngày khởi hành!");

            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                return alert("Ngày khởi hành phải từ hôm nay trở đi!");
            }

            const quantity = parseInt(quantityInput?.value) || 1;
            const total = (PRICES[location] || 0) * quantity;

            // 1. Tạo đối tượng đơn đặt tour mới để lưu trữ vào localStorage
            const newBooking = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                location: location,
                quantity: quantity,
                date: date,
                total: total,
                status: "Chờ xử lý"
            };

            // 2. Lưu vào localStorage để trang admin đọc được
            let bookings = JSON.parse(localStorage.getItem("tour_bookings")) || [];
            bookings.push(newBooking);
            localStorage.setItem("tour_bookings", JSON.stringify(bookings));

            alert(`ĐĂNG KÝ TOUR THÀNH CÔNG!\n\nHọ tên: ${name}\nĐịa điểm: ${location}\nSố khách: ${quantity}\nTổng tiền: ${formatMoney(total)}\n\nChuyển đến trang quản lý đơn hàng...`);

            tourForm.reset();
            updatePrice();

            // 3. Chuyển hướng sang trang quản trị admin
            window.location.href = "admin.html";
        });
    }
}

// ===========================
// COUNTER ANIMATION
// ===========================
function initCounters() {
    const counters = document.querySelectorAll(".counter");
    if (!counters.length) return;

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const counter = entry.target;
                const target = parseInt(counter.dataset.target) || 0;
                const suffix = counter.dataset.suffix || "";

                let current = 0;
                const step = target / 50;

                function animate() {
                    if (current < target) {
                        current += step;
                        counter.textContent = Math.ceil(current) + suffix;
                        requestAnimationFrame(animate);
                    } else {
                        counter.textContent = target + suffix;
                    }
                }

                animate();
                observer.unobserve(counter);
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
}

// ===========================
// ARTICLE & POST MANAGER (ADMIN -> DANHLAM)
// ===========================
function initArticleManager() {
    const addPostForm = $("addPostForm");
    const newPostsContainer = $("new-posts-container");

    // Xử lý đăng bài từ Admin
    if (addPostForm) {
        addPostForm.addEventListener("submit", e => {
            e.preventDefault();

            const newPost = {
                id: Date.now(),
                title: $("postTitle").value.trim(),
                province: $("postProvince").value,
                image: $("postImage").value.trim(),
                content1: $("postContent1").value.trim(),
                content2: $("postContent2").value.trim()
            };

            let posts = JSON.parse(localStorage.getItem("danhlam_posts")) || [];
            posts.push(newPost);
            localStorage.setItem("danhlam_posts", JSON.stringify(posts));

            alert("Đăng bài thành công! Bài viết đã xuất hiện ở trang Danh Lam.");
            addPostForm.reset();
            loadAdminPosts();
        });
    }

    // Hiển thị bài viết động ra trang Danh Lam
    if (newPostsContainer) {
        let posts = JSON.parse(localStorage.getItem("danhlam_posts")) || [];

        posts.forEach(post => {
            const section = document.createElement("section");
            const p2Html = post.content2 ? `<p>${post.content2}</p>` : "";

            section.innerHTML = `
                <div class="article">
                    <img src="${post.image}" alt="${post.title}">
                    <h2>${post.title} (${post.province})</h2>
                    <p>${post.content1}</p>
                    ${p2Html}
                    <a href="lienhe.html" class="btn">Đặt tour ngay</a>
                </div>
            `;

            newPostsContainer.appendChild(section);
        });
    }
}

// ===========================
// ADMIN DASHBOARD DATA LOADER
// ===========================

// 1. Hiển thị và quản lý danh sách đơn đặt tour ở trang Admin
function loadAdminBookings() {
    const bookingTableBody = $("bookingTableBody");
    if (!bookingTableBody) return;

    let bookings = JSON.parse(localStorage.getItem("tour_bookings")) || [];
    bookingTableBody.innerHTML = "";

    if (bookings.length === 0) {
        bookingTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#777;">Chưa có đơn đặt tour nào.</td></tr>`;
        return;
    }

    bookings.forEach((booking, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${booking.name}</strong><br><small>${booking.email || ""}</small></td>
            <td>${booking.phone}</td>
            <td>${booking.location}</td>
            <td>${booking.quantity}</td>
            <td style="color: red; font-weight: bold;">${formatMoney(booking.total)}</td>
            <td>${booking.date}</td>
            <td>
                <button class="btn-delete" onclick="deleteBooking(${booking.id})">Xóa</button>
            </td>
        `;
        bookingTableBody.appendChild(tr);
    });
}

// Xóa đơn đặt tour
window.deleteBooking = function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa đơn đặt tour này không?")) {
        let bookings = JSON.parse(localStorage.getItem("tour_bookings")) || [];
        bookings = bookings.filter(b => b.id !== id);
        localStorage.setItem("tour_bookings", JSON.stringify(bookings));
        loadAdminBookings();
    }
};

// 2. Hiển thị và quản lý danh sách bài viết danh lam ở trang Admin
function loadAdminPosts() {
    const postTableBody = $("postTableBody");
    if (!postTableBody) return;

    let posts = JSON.parse(localStorage.getItem("danhlam_posts")) || [];
    postTableBody.innerHTML = "";

    if (posts.length === 0) {
        postTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#777;">Chưa có bài viết nào được đăng.</td></tr>`;
        return;
    }

    posts.forEach((post, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${post.title}</strong></td>
            <td>${post.province}</td>
            <td>
                <button class="btn-delete" onclick="deletePost(${post.id})">Xóa</button>
            </td>
        `;
        postTableBody.appendChild(tr);
    });
}

// Xóa bài viết danh lam
window.deletePost = function(id) {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
        let posts = JSON.parse(
            localStorage.getItem("danhlam_posts")
        ) || [];

        posts = posts.filter(
            post => post.id !== id
        );

        localStorage.setItem(
            "danhlam_posts",
            JSON.stringify(posts)
        );

        // Đã sửa lại gọi đúng hàm loadAdminPosts thay vì loadPosts
        loadAdminPosts();
    }
};

// ===========================
// MOBILE MENU TOGGLE (Nút 3 gạch)
// ===========================
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navMenu = document.querySelector(".menu");

if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        
        // Đổi icon 3 gạch (fa-bars) thành dấu nhân (fa-xmark) cho sinh động khi mở/đóng
        const icon = mobileMenuBtn.querySelector("i");
        if (navMenu.classList.contains("active")) {
            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");
        } else {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    });
}
