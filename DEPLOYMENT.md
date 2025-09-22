# Hướng Dẫn Triển Khai GitHub Pages

## 🚀 Triển Khai Nhanh

### Bước 1: Fork Repository
1. Vào [repository này](https://github.com/your-username/nghetinhfootball)
2. Click nút "Fork" ở góc trên bên phải
3. Chọn tài khoản GitHub của bạn

### Bước 2: Cấu Hình GitHub Pages
1. Vào repository đã fork
2. Click tab "Settings"
3. Cuộn xuống phần "Pages" ở sidebar trái
4. Trong "Source", chọn "Deploy from a branch"
5. Chọn branch "main" và folder "/ (root)"
6. Click "Save"

### Bước 3: Cấu Hình API
1. Mở file `script.js`
2. Tìm dòng: `const API_BASE_URL = 'https://homatabe.onrender.com';`
3. Thay đổi thành URL API thực tế của bạn:
```javascript
const API_BASE_URL = 'https://your-api-domain.com';
```

### Bước 4: Cấu Hình CORS
Đảm bảo API backend của bạn cho phép requests từ GitHub Pages:

```python
# Ví dụ cho FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-username.github.io",
        "http://localhost:3000",  # For development
        "http://127.0.0.1:5500"   # For Live Server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Bước 5: Kiểm Tra Triển Khai
1. Đợi 5-10 phút để GitHub Pages build
2. Truy cập: `https://your-username.github.io/nghetinhfootball`
3. Kiểm tra các tính năng:
   - Xem danh sách cầu thủ
   - Xem bài viết
   - Đăng nhập admin
   - Quản lý cầu thủ và bài viết

## 🔧 Cấu Hình Nâng Cao

### Custom Domain
1. Trong Settings > Pages
2. Nhập domain tùy chỉnh của bạn
3. Cấu hình DNS records:
   - Type: CNAME
   - Name: www
   - Value: your-username.github.io

### Environment Variables
Nếu cần sử dụng environment variables:

1. Tạo file `.env` (không commit vào git):
```env
API_BASE_URL=https://your-api-domain.com
GOOGLE_ANALYTICS_ID=your-ga-id
```

2. Sử dụng trong JavaScript:
```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'https://homatabe.onrender.com';
```

### HTTPS và Security
- GitHub Pages tự động cung cấp HTTPS
- Đảm bảo API backend cũng sử dụng HTTPS
- Cấu hình CSP headers nếu cần

## 🐛 Troubleshooting

### Lỗi 404
**Vấn đề**: Trang hiển thị 404
**Giải pháp**: 
1. Kiểm tra tên repository có đúng không
2. Đảm bảo file `index.html` ở root directory
3. Kiểm tra GitHub Pages settings

### Lỗi CORS
**Vấn đề**: `Access to fetch at 'API_URL' from origin 'GITHUB_PAGES_URL' has been blocked by CORS policy`
**Giải pháp**:
1. Cấu hình CORS trên API server
2. Thêm domain GitHub Pages vào allowed origins
3. Kiểm tra preflight requests

### Lỗi API Connection
**Vấn đề**: `Failed to fetch`
**Giải pháp**:
1. Kiểm tra API server có đang chạy không
2. Kiểm tra URL API có đúng không
3. Kiểm tra network connectivity

### Lỗi Authentication
**Vấn đề**: Token không hợp lệ
**Giải pháp**:
1. Kiểm tra token format
2. Đảm bảo token chưa hết hạn
3. Kiểm tra API authentication endpoint

## 📱 Mobile Optimization

### Responsive Design
- Trang web đã được tối ưu cho mobile
- Sử dụng viewport meta tag
- CSS Grid và Flexbox responsive

### Performance
- Lazy loading cho images
- Minified CSS và JavaScript
- CDN cho external resources

### PWA Features (Optional)
Để thêm PWA features:

1. Tạo `manifest.json`:
```json
{
  "name": "FC Nghệ Tĩnh",
  "short_name": "Football Team",
  "description": "Quản lý FC Nghệ Tĩnh",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e3a8a",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

2. Thêm vào `index.html`:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#f59e0b">
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 📊 Analytics và Monitoring

### Google Analytics
1. Tạo Google Analytics account
2. Lấy tracking ID
3. Thêm vào `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Error Monitoring
Sử dụng Sentry hoặc LogRocket để monitor errors:

```javascript
// Sentry example
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

## 🔐 Security Best Practices

### Content Security Policy
Thêm CSP header:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://your-api-domain.com;">
```

### API Security
- Sử dụng HTTPS cho tất cả API calls
- Implement rate limiting
- Validate input data
- Use proper authentication

## 📈 Performance Optimization

### Image Optimization
- Sử dụng WebP format
- Implement lazy loading
- Provide multiple sizes
- Use CDN for images

### Code Splitting
- Load JavaScript on demand
- Minimize bundle size
- Use tree shaking

### Caching
- Set proper cache headers
- Use service workers
- Implement offline support

## 🆘 Support

Nếu gặp vấn đề:

1. **Check GitHub Pages Status**: https://www.githubstatus.com/
2. **Check Repository Settings**: Settings > Pages
3. **Check Browser Console**: F12 > Console tab
4. **Check Network Tab**: F12 > Network tab
5. **Create GitHub Issue**: Với thông tin chi tiết về lỗi

### Common Issues và Solutions

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| 404 Not Found | Repository name sai | Kiểm tra tên repository |
| CORS Error | API không cho phép origin | Cấu hình CORS trên server |
| API Timeout | Server không phản hồi | Kiểm tra server status |
| Authentication Failed | Token không hợp lệ | Đăng nhập lại |

---

**Lưu ý**: Đảm bảo API backend của bạn đang chạy và có thể truy cập từ internet trước khi triển khai frontend.
