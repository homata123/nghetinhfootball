# FC Nghệ Tĩnh - GitHub Pages

Trang web quản lý đội Nghệ Tĩnh với đầy đủ tính năng CRUD cho cầu thủ và bài viết, được thiết kế để chạy trên GitHub Pages.

## 🚀 Tính Năng

### Cho Người Dùng Thường
- **Trang Chủ**: Xem thống kê tổng quan, tin tức mới nhất và đội hình chính
- **Danh Sách Cầu Thủ**: Xem thông tin chi tiết các cầu thủ với tìm kiếm và lọc theo vị trí
- **Tin Tức**: Đọc các bài viết về đội bóng với tìm kiếm
- **Thư Viện Ảnh**: Xem kho ảnh của đội bóng

### Cho Admin (Cần Đăng Nhập)
- **Quản Lý Cầu Thủ**: Thêm, sửa, xóa thông tin cầu thủ
- **Quản Lý Bài Viết**: Tạo, chỉnh sửa, xuất bản bài viết
- **Upload Ảnh**: Tải lên và quản lý ảnh trong thư viện
- **Thống Kê**: Xem các số liệu tổng quan

## 🛠️ Cài Đặt và Triển Khai

### 1. Fork Repository
1. Fork repository này về tài khoản GitHub của bạn
2. Clone repository về máy local:
```bash
git clone https://github.com/username/nghetinhfootball.git
cd nghetinhfootball
```

### 2. Cấu Hình GitHub Pages
1. Vào Settings của repository
2. Cuộn xuống phần "Pages"
3. Chọn "Deploy from a branch"
4. Chọn branch "main" và folder "/ (root)"
5. Click "Save"

### 3. Cấu Hình API Backend
Trang web cần kết nối với API backend. Cập nhật URL API trong file `script.js`:

```javascript
// Thay đổi URL này thành URL API thực tế của bạn
const API_BASE_URL = 'https://your-api-domain.com';
```

### 4. Cấu Hình CORS
Đảm bảo API backend của bạn được cấu hình CORS để cho phép requests từ GitHub Pages:

```python
# Ví dụ cho FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-username.github.io", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📁 Cấu Trúc Dự Án

```
nghetinhfootball/
├── index.html          # Trang chính
├── styles.css          # CSS styling
├── script.js           # JavaScript logic
├── README.md           # Hướng dẫn này
└── .gitignore          # Git ignore file
```

## 🎨 Thiết Kế

### Theme Bóng Đá Chuyên Nghiệp
- **Màu sắc chính**: Xanh navy (#1e3a8a) và vàng (#f59e0b)
- **Typography**: Inter font family
- **Layout**: Responsive design cho mọi thiết bị
- **Icons**: Font Awesome 6.0

### Responsive Design
- **Desktop**: Layout đầy đủ với sidebar và grid
- **Tablet**: Layout tối ưu cho màn hình trung bình
- **Mobile**: Navigation hamburger, layout dọc

## 🔧 Cấu Hình Nâng Cao

### Thay Đổi Màu Sắc
Chỉnh sửa CSS variables trong file `styles.css`:

```css
:root {
    --primary-color: #1e3a8a;      /* Màu chính */
    --secondary-color: #f59e0b;    /* Màu phụ */
    --accent-color: #10b981;       /* Màu nhấn */
}
```

### Thêm Tính Năng Mới
1. Thêm HTML structure trong `index.html`
2. Thêm CSS styling trong `styles.css`
3. Thêm JavaScript logic trong `script.js`
4. Cập nhật API calls nếu cần

### Tùy Chỉnh API Endpoints
Cập nhật các endpoint trong file `script.js`:

```javascript
// Ví dụ thay đổi endpoint
const PLAYERS_ENDPOINT = '/api/v1/players';
const POSTS_ENDPOINT = '/api/v1/posts';
```

## 📱 Tính Năng Mobile

- **Navigation**: Hamburger menu cho mobile
- **Touch**: Hỗ trợ touch gestures
- **Responsive Images**: Tự động resize theo màn hình
- **Fast Loading**: Tối ưu hóa cho mobile

## 🔐 Bảo Mật

### Authentication
- Sử dụng Bearer Token authentication
- Token được lưu trong localStorage
- Tự động logout khi token hết hạn

### Data Validation
- Client-side validation cho forms
- Server-side validation (từ API)
- Error handling toàn diện

## 🚀 Performance

### Tối Ưu Hóa
- **Lazy Loading**: Ảnh được load khi cần
- **Debouncing**: Tìm kiếm được debounce
- **Caching**: Local storage cho user session
- **Minification**: CSS và JS được tối ưu

### Loading States
- Loading overlay cho các API calls
- Skeleton loading cho content
- Progress indicators

## 🐛 Troubleshooting

### Lỗi CORS
```
Error: CORS policy blocks the request
```
**Giải pháp**: Cấu hình CORS trên API server để cho phép domain GitHub Pages

### Lỗi 404 API
```
Error: Failed to fetch
```
**Giải pháp**: Kiểm tra URL API và đảm bảo server đang chạy

### Lỗi Authentication
```
Error: Invalid authentication credentials
```
**Giải pháp**: Kiểm tra token và đăng nhập lại

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra Console trong Developer Tools
2. Xem Network tab để kiểm tra API calls
3. Tạo issue trên GitHub repository

## 📄 License

Dự án này được phát hành dưới MIT License. Xem file `LICENSE` để biết thêm chi tiết.

## 🙏 Credits

- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)
- **Design**: Custom football theme
- **API**: RESTful API backend

---

**Lưu ý**: Đảm bảo API backend của bạn đang chạy và có thể truy cập từ internet để trang web hoạt động đầy đủ.