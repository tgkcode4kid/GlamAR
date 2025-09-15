function updateCartDisplay() {
  // Lấy giỏ hàng từ localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Tính tổng số lượng sản phẩm
  const totalQuantity = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  // Cập nhật hiển thị trên tất cả các phần tử cart-count
  document.querySelectorAll("#cart-count").forEach((el) => {
    el.textContent = totalQuantity;
  });
}

// Khởi tạo khi trang load
document.addEventListener("DOMContentLoaded", function () {
  updateCartDisplay();

  // Theo dõi thay đổi từ tab khác
  window.addEventListener("storage", function (e) {
    if (e.key === "cart") {
      updateCartDisplay();
    }
  });
});

// Add vào giỏ
$("#add-to-cart-direct").on("click", async function () {
  const quantity = parseInt($("#quantity").val()) || 1;
  const productImage = $(".main-image-container");
  const productThumbnail = $("#product-thumbnail");
  const cartIcon = $(".cart-icon-wrapper");
  const cartPos = cartIcon.offset();

  // Tạo hiệu ứng bay (giữ nguyên)
  const flyingItem = $('<div class="flying-item"></div>');
  const imgClone = productThumbnail.clone();

  flyingItem
    .css({
      top: productImage.offset().top,
      left: productImage.offset().left,
      width: "150px",
      height: "150px",
    })
    .append(imgClone);

  if (quantity > 1) {
    flyingItem.append('<div class="qty-overlay">x' + quantity + "</div>");
  }

  $("body").append(flyingItem);

  // Animation
  flyingItem.animate(
    {
      left: cartPos.left + 50,
      top: cartPos.top + 30,
      width: "50px",
      height: "50px",
    },
    600,
    "swing",
    function () {
      $(this).animate(
        {
          left: cartPos.left + 30,
          top: cartPos.top + 10,
          width: "30px",
          height: "30px",
        },
        400,
        "swing",
        async function () {
          $(this).remove();

          try {
            const token = localStorage.getItem("token");
            if (!token) {
              Swal.fire({
                title: "LOGIN REQUIRED",
                html: `<div style="font-size:16px;color:#555;margin:15px 0 25px;">
                          You need to login to add items to your cart
                        </div>`,
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "LOGIN NOW",
                cancelButtonText: "CONTINUE SHOPPING",
                customClass: {
                  confirmButton: "swal-confirm-btn",
                  cancelButton: "swal-cancel-btn",
                },
                buttonsStyling: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  localStorage.setItem("redirectUrl", window.location.href);
                  window.location.href = "/login.html";
                }
              });
              return;
            }

            // Lấy giỏ hàng hiện tại
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const productId = "Eyewear";

            // Kiểm tra sản phẩm đã có trong giỏ chưa
            const existingItem = cart.find((item) => item.id === productId);
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              cart.push({
                id: productId,
                name: $(".product-title").text(),
                price: parseFloat($(".product-price").text().replace("$", "")),
                quantity: quantity,
                image: $("#product-thumbnail").attr("src"),
              });
            }

            // Lưu giỏ hàng mới
            localStorage.setItem("cart", JSON.stringify(cart));

            const response = await fetch("/api/cart/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                productId: productId,
                name: $(".product-title").text(),
                price: parseFloat($(".product-price").text().replace("$", "")),
                quantity: quantity,
                image: productThumbnail.attr("src"),
              }),
            });

            const result = await response.json();
            if (!result.success) throw new Error(result.message);

            // Cập nhật hiển thị
            updateCartDisplay();

            // Thông báo cho các tab khác
            localStorage.setItem("cartUpdated", Date.now().toString());

            // Hiệu ứng scale
            cartIcon.css("transform", "scale(1.2)");
            setTimeout(() => {
              cartIcon.css("transform", "scale(1)");
              window.location.href = "../eyewear.html?t=" + Date.now();
            }, 500);
          } catch (error) {
            console.error("Error:", error);
            updateCartDisplay();
          }
        }
      );
    }
  );
});

// select màu, size
function selectColor(colorOption) {
  document
    .querySelectorAll(".color-btn")
    .forEach((c) => c.classList.remove("active"));
  colorOption.classList.add("active");
}

function selectSize(sizeOption) {
  document
    .querySelectorAll(".size-btn")
    .forEach((s) => s.classList.remove("active"));
  sizeOption.classList.add("active");
}

function changeQuantity(change) {
  const input = document.getElementById("quantity");
  let value = parseInt(input.value) + change;
  if (value < 1) value = 1;
  input.value = value;
}

function openARModal() {
  $("#ar-iframe").attr(
    "src",
    "https://sketchfab.com/models/97cbff16eec648fdb211ea58159bd9ba/embed?ar_mode=1"
  );
  $("#ar-modal").fadeIn();
}

function closeARModal() {
  $("#ar-iframe").attr("src", "");
  $("#ar-modal").fadeOut();
}

document.addEventListener("DOMContentLoaded", () => {
  // Hàm kiểm tra và xác thực người dùng
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  // Hàm hiển thị thông tin user
  const displayUserProfile = (user) => {
    const loginBtn = document.querySelector('a[href="../../login.html"]');
    if (!loginBtn) return;

    // Tạo container profile
    const profileContainer = document.createElement("div");
    profileContainer.className = "user-profile-container";
    profileContainer.style.display = "flex";
    profileContainer.style.alignItems = "center";
    profileContainer.style.gap = "10px";

    // Tạo link profile
    const profileLink = document.createElement("a");
    profileLink.href = `/profile.html?id=${user.id}`;
    profileLink.className = "user-profile-link";
    profileLink.style.display = "flex";
    profileLink.style.alignItems = "center";
    profileLink.style.gap = "8px";
    profileLink.style.transition = "all 0.3s ease";

    // Tạo avatar
    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.textContent = user.username.charAt(0).toUpperCase();
    avatar.style.width = "32px";
    avatar.style.height = "32px";
    avatar.style.borderRadius = "50%";
    avatar.style.backgroundColor = "#da0e64";
    avatar.style.color = "white";
    avatar.style.display = "flex";
    avatar.style.alignItems = "center";
    avatar.style.justifyContent = "center";
    avatar.style.fontWeight = "bold";

    // Tạo tên user
    const userName = document.createElement("span");
    userName.className = "user-name";
    userName.textContent = user.username;
    userName.style.fontWeight = "500";
    userName.style.whiteSpace = "nowrap";
    userName.style.overflow = "hidden";
    userName.style.textOverflow = "ellipsis";
    userName.style.maxWidth = "120px";

    // Tạo dropdown icon
    const dropdownIcon = document.createElement("span");
    dropdownIcon.className = "dropdown-icon";
    dropdownIcon.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Gắn các phần tử vào DOM
    profileLink.appendChild(avatar);
    profileLink.appendChild(userName);
    profileLink.appendChild(dropdownIcon);
    profileContainer.appendChild(profileLink);

    // Thay thế nút login
    loginBtn.replaceWith(profileContainer);

    // Tạo dropdown menu
    const dropdownMenu = document.createElement("div");
    dropdownMenu.className = "user-dropdown-menu";
    dropdownMenu.style.position = "absolute";
    dropdownMenu.style.top = "100%";
    dropdownMenu.style.right = "0";
    dropdownMenu.style.backgroundColor = "white";
    dropdownMenu.style.borderRadius = "8px";
    dropdownMenu.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
    dropdownMenu.style.padding = "8px 0";
    dropdownMenu.style.minWidth = "180px";
    dropdownMenu.style.zIndex = "100";
    dropdownMenu.style.display = "none";
    dropdownMenu.style.overflow = "hidden";

    // Tạo menu item
    const menuItems = [
      { text: "My Profile", icon: "👤", href: `/profile.html?id=${user.id}` },
      { text: "Settings", icon: "⚙️", href: `/profile.html?id=${user.id}` },
      { text: "Logout", icon: "🚪", action: "logout" },
    ];

    menuItems.forEach((item) => {
      const menuItem = document.createElement("a");
      menuItem.className = "user-menu-item";
      menuItem.href = item.href || "#";
      menuItem.style.display = "flex";
      menuItem.style.alignItems = "center";
      menuItem.style.padding = "8px 16px";
      menuItem.style.color = "#141b1d";
      menuItem.style.transition = "all 0.2s ease";

      if (item.action === "logout") {
        menuItem.addEventListener("click", (e) => {
          e.preventDefault();
          handleLogout();
        });
      }

      const iconSpan = document.createElement("span");
      iconSpan.style.marginRight = "8px";
      iconSpan.textContent = item.icon;

      const textSpan = document.createElement("span");
      textSpan.textContent = item.text;

      menuItem.appendChild(iconSpan);
      menuItem.appendChild(textSpan);
      dropdownMenu.appendChild(menuItem);

      menuItem.addEventListener("mouseenter", () => {
        menuItem.style.backgroundColor = "#f5f5f5";
      });

      menuItem.addEventListener("mouseleave", () => {
        menuItem.style.backgroundColor = "transparent";
      });
    });

    // Thêm dropdown vào DOM
    profileContainer.appendChild(dropdownMenu);

    // Xử lý click để mở/đóng dropdown
    profileLink.addEventListener("click", (e) => {
      e.preventDefault();
      const isVisible = dropdownMenu.style.display === "block";
      dropdownMenu.style.display = isVisible ? "none" : "block";
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener("click", (e) => {
      if (!profileContainer.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  };

  // Hàm xử lý logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Hiển thị thông báo logout thành công
    showNotification("You have been logged out successfully", "success");

    // Chuyển hướng sau 1.5 giây
    setTimeout(() => {
      location.reload(true);
    }, 1500);
  };

  // Hàm hiển thị thông báo
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.padding = "12px 20px";
    notification.style.backgroundColor =
      type === "success" ? "#da0e64" : "#f44336";
    notification.style.color = "white";
    notification.style.borderRadius = "4px";
    notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    notification.style.zIndex = "1000";
    notification.style.transform = "translateX(120%)";
    notification.style.transition = "transform 0.3s ease";

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 10);

    setTimeout(() => {
      notification.style.transform = "translateX(120%)";
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  };

  // Kiểm tra và hiển thị thông tin user
  const currentUser = checkAuth();
  if (currentUser) {
    displayUserProfile(currentUser);
  } else {
    // Xóa token không hợp lệ nếu có
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
});
