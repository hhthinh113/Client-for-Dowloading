# Media Downloader - Ứng Dụng Tải Media Đa Nền Tảng

Một ứng dụng web hoàn chỉnh kết hợp **Laravel (Backend)** và **React.js (Frontend)** cho phép người dùng tìm kiếm, xem trước và tải xuống media từ các nền tảng như Pixabay, Safebooru, Danbooru và Unsplash.

## Tính Năng

### Tính Năng Cốt Lõi
- **Hỗ trợ đa nền tảng**: Pixabay, Safebooru, Danbooru, Unsplash
- **Tìm kiếm với bộ lọc**: Từ khóa, tags, category, orientation
- **Hiển thị lưới**: Giao diện grid responsive với thumbnail
- **Xem trước**: Xem trước ảnh và video trước khi tải
- **Tải hàng loạt**: Chọn nhiều file để tải cùng lúc
- **Tải đơn lẻ**: Tải từng file riêng biệt

### Tính Năng Nâng Cao
- **Tùy chỉnh tên file**: Sử dụng placeholders như `{author}_{id}_{index}`
- **Chọn thư mục đích**: Chọn nơi lưu file với nhiều tùy chọn
- **Theo dõi tiến độ**: Hiển thị tiến độ tải trong thời gian thực
- **Lịch sử tải**: Xem và quản lý các lần tải trước đó
- **Quản lý API**: Thêm, sửa, xóa và test các API sources

### Giao Diện Người Dùng
- **Chủ đề tối**: Background tối + text sáng (tương phản cao)
- **Thiết kế responsive**: Hoạt động tốt trên desktop
- **Thông báo rõ ràng**: Toast notifications cho tất cả hành động
- **Đơn giản, dễ dùng**: Giao diện trực quan

## Cấu Trúc Project

```
Client-for-Dowloading/
├── backend/                 # Laravel Backend
│   ├── app/                  # Controllers, Models, Jobs
│   ├── config/               # Cấu hình ứng dụng
│   ├── database/             # Migrations, Seeders, Factories
│   ├── routes/               # API routes
│   └── composer.json         # PHP dependencies
│
└── frontend/                # React.js Frontend
    ├── src/
    │   ├── components/       # MediaGrid, DownloadModal, PathSelector
    │   ├── pages/             # MediaSearch, ApiSources, History
    │   ├── hooks/             # useDownload
    │   ├── services/          # API services
    │   └── App.jsx            # Main application
    └── package.json           # JS dependencies
```

## Yêu Cầu Hệ Thống

### Backend (Laravel)
- **PHP**: 8.0 trở lên
- **Composer**: Để quản lý dependencies
- **Web Server**: Apache, Nginx, hoặc built-in PHP server

### Frontend (React.js)
- **Node.js**: 18 trở lên
- **npm** hoặc **yarn**: Để quản lý JavaScript dependencies

### Database (Tùy chọn)
- **Không cần database**: Có thể chạy với `DB_CONNECTION=file`
- **SQLite**: Đơn giản, không cần server
- **MySQL**: 5.7+ hoặc 8.0+
- **PostgreSQL**: 9.6+

## Cài Đặt

### Backend (Laravel)

1. **Di chuyển đến thư mục backend:**
   ```bash
   cd backend
   ```

2. **Cài đặt PHP dependencies:**
   ```bash
   composer install
   ```
   
   **Nếu gặp lỗi:**
   - Nếu thấy `No composer.lock file present`, chạy:
     ```bash
     composer update
     ```
   - Hoặc cài đặt trực tiếp:
     ```bash
     composer require laravel/framework:^9.0 laravel/sanctum:^2.14 guzzlehttp/guzzle:^7.2
     ```

3. **Sao chép file môi trường:**
   ```bash
   cp .env.example .env
   ```

4. **Tạo application key:**
   ```bash
   php artisan key:generate
   ```

5. **Cấu hình database (tùy chọn):**
   
   **Tùy chọn A: Không dùng database (được khuyến nghị cho việc sử dụng đơn giản)**
   ```ini
   DB_CONNECTION=file
   ```
   
   **Tùy chọn B: SQLite**
   ```ini
   DB_CONNECTION=sqlite
   DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
   ```
   Sau đó tạo database:
   ```bash
   touch database/database.sqlite
   ```
   
   **Tùy chọn C: MySQL**
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=media_downloader
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   
   **Tùy chọn D: PostgreSQL**
   ```ini
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=media_downloader
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   ```

6. **Chạy migrations (bỏ qua nếu dùng `file` driver):**
   ```bash
   php artisan migrate
   ```

7. **Cấu hình API keys:**
   Lấy API keys từ các nền tảng và thêm vào `.env`:
   ```ini
   PIXABAY_API_KEY=your_pixabay_api_key
   DANBOORU_USERNAME=your_danbooru_username
   DANBOORU_API_KEY=your_danbooru_api_key
   UNSPLASH_API_KEY=your_unsplash_api_key
   ```
   
   **Lưu ý:**
   - Safebooru không yêu cầu API key
   - Danbooru yêu cầu cả username và API key (lấy từ tài khoản Danbooru)
   - Pixabay và Unsplash yêu cầu API keys từ developer portals

8. **Khởi động server:**
   ```bash
   php artisan serve
   ```
   Backend sẽ chạy tại `http://localhost:8000`

### Frontend (React.js)

1. **Di chuyển đến thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt JavaScript dependencies:**
   ```bash
   npm install
   ```

3. **Khởi động Vite development server:**
   ```bash
   npm run dev
   ```
   Frontend sẽ chạy tại `http://localhost:3000`

## Sử Dụng Ứng Dụng

### Tìm Kiếm Media
1. Chọn nền tảng từ dropdown (Pixabay, Safebooru, Danbooru, Unsplash)
2. Nhập từ khóa tìm kiếm và/hoặc tags
3. Lọc theo category và orientation (nếu được hỗ trợ)
4. Nhấn "Search" hoặc Enter

### Xem Trước Media
- Click vào bất kỳ thumbnail nào để xem trước
- Có thể xem trước cả ảnh và video

### Chọn Files
- Check vào checkbox của từng media item để chọn
- Dùng "Select All" để chọn tất cả items trên trang

### Tải Về
1. Click "Download Selected" hoặc tải từng file đơn lẻ
2. Trong modal tải:
   - **Chọn thư mục đích**:
     - **Browse**: Duyệt thư mục trực quan
     - **Quick Select**: Chọn nhanh (Downloads, Documents, Pictures, Desktop)
     - **Recent Paths**: Chọn từ các đường dẫn đã dùng gần đây
     - **Manual Entry**: Nhập trực tiếp đường dẫn
     - **Default**: Sử dụng đường dẫn mặc định
   - **Cấu hình naming pattern**: Sử dụng placeholders
   - Click "Start Download"

### Xem Lịch Sử Tải
- Đi đến trang "History"
- Xem tất cả các jobs tải với trạng thái và tiến độ
- Hủy các downloads đang chạy
- Xóa các mục trong lịch sử

### Quản Lý API Sources
- Đi đến trang "API Sources"
- Thêm mới API sources cho các nền tảng tùy chỉnh
- Sửa hoặc xóa các sources hiện có
- Test connection trước khi lưu

## Placeholders cho Naming Pattern

Khi tải files, bạn có thể sử dụng các placeholders sau trong naming pattern:

- `{author}` - Tác giả của media
- `{id}` - ID duy nhất của media
- `{index}` - Số thứ tự trong batch download
- `{type}` - Loại media (image hoặc video)
- `{timestamp}` - Thời gian hiện tại (format: YYYYMMDD_HHMMSS)
- `{random}` - Chuỗi ngẫu nhiên 8 ký tự

**Ví dụ:**
- `{author}_{id}_{index}.jpg` → `john_doe_12345_0.jpg`
- `{type}/{author}/{timestamp}_{id}` → `image/john_doe/20240115_123045_12345.jpg`
- `{random}_{id}` → `abc12345_12345.jpg`

## Cấu Hình Môi Trường

### Backend (.env)
```ini
# Ứng dụng
APP_NAME=MediaDownloader
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (chọn một)
# Tùy chọn 1: Không dùng database (khuyến nghị)
DB_CONNECTION=file

# Tùy chọn 2: SQLite
# DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/backend/database/database.sqlite

# Tùy chọn 3: MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=media_downloader
# DB_USERNAME=root
# DB_PASSWORD=

# Tùy chọn 4: PostgreSQL
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=media_downloader
# DB_USERNAME=postgres
# DB_PASSWORD=postgres

# API Keys
PIXABAY_API_KEY=your_pixabay_api_key
DANBOORU_USERNAME=your_danbooru_username
DANBOORU_API_KEY=your_danbooru_api_key
UNSPLASH_API_KEY=your_unsplash_api_key

# CORS
SANCTUM_STATEFUL_DOMAINS=localhost
SESSION_DOMAIN=localhost
```

### Frontend
Frontend sử dụng proxy của Vite để kết nối với backend. Cấu hình trong `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

## Cấu Hình Download

### Chọn Thư Mục Đích
Ứng dụng cung cấp nhiều cách để chọn nơi lưu files:

1. **Chế độ Duyệt (Browse)**: Click "Browse" để điều hướng qua hệ thống files với trình duyệt thư mục trực quan
2. **Chọn Nhanh (Quick Select)**: Sử dụng các thư mục hệ thống được định sẵn (Downloads, Documents, Pictures, Desktop)
3. **Đường Dẫn Gần Đây (Recent Paths)**: Truy cập các vị trí tải xuống đã sử dụng gần đây
4. **Nhập Thủ Công (Manual Entry)**: Gõ trực tiếp đường dẫn đầy đủ
5. **Đường Dẫn Mặc Định (Default Path)**: Thiết lập một vị trí mặc định sẽ được tự động chọn

### Tạo Thư Mục Mới
- Trong chế độ Browse, click "Create New Directory" để tạo thư mục mới
- Nhập tên thư mục và click "Create"
- Thư mục mới sẽ xuất hiện trong thư mục hiện tại

### Thiết Lập Đường Dẫn Mặc Định
Để thiết lập đường dẫn mặc định:
1. Chọn đường dẫn mong muốn bằng bất kỳ phương pháp nào
2. Đường dẫn sẽ được lưu làm mặc định cho các lần tải sau
3. Click nút "Default" để nhanh chóng sử dụng đường dẫn mặc định

## API Endpoints

### Settings Endpoints
- `GET /api/settings/download` - Lấy cài đặt tải về (default path, recent paths)
- `POST /api/settings/download` - Lưu cài đặt
- `POST /api/settings/download/recent` - Lưu một recent path
- `POST /api/settings/directories` - Liệt kê thư mục trong một đường dẫn
- `POST /api/settings/directories/create` - Tạo thư mục mới
- `POST /api/settings/path/check` - Kiểm tra đường dẫn tồn tại

### Media Endpoints
- `GET /api/media/search` - Tìm kiếm media trên các nền tảng
- `GET /api/media/{platform}` - Lấy media từ nền tảng cụ thể
- `POST /api/media/preview` - Lấy preview URL

### API Sources Endpoints
- `GET /api/api-sources` - Liệt kê tất cả API sources
- `POST /api/api-sources` - Tạo API source mới
- `GET /api/api-sources/{id}` - Lấy API source cụ thể
- `PUT /api/api-sources/{id}` - Cập nhật API source
- `DELETE /api/api-sources/{id}` - Xóa API source
- `POST /api/api-sources/test` - Test kết nối API

### Download Endpoints
- `POST /api/download/single` - Bắt đầu tải đơn
- `POST /api/download/batch` - Bắt đầu tải hàng loạt
- `GET /api/download/status/{jobId}` - Lấy trạng thái job
- `GET /api/download/progress/{jobId}` - Lấy tiến độ tải
- `POST /api/download/cancel/{jobId}` - Hủy job tải

### Utility Endpoints
- `GET /api/config` - Lấy cấu hình ứng dụng

## Nền Tảng Được Hỗ Trợ

### Không Cần API Key
- **Safebooru**: Ảnh anime-style miễn phí, không cần xác thực

### Cần API Key
- **Pixabay**: Ảnh stock, illustrations, và videos chất lượng cao
- **Danbooru**: Ảnh anime-style với hệ thống tags phong phú
- **Unsplash**: Nhiếp ảnh chất lượng cao

### Custom APIs
Bạn cũng có thể thêm các API sources của riêng mình thông qua trang quản lý API Sources.

## Khắc Phục Sự Cố

### Lỗi Thường Gặp

1. **Không Kết Nối Database:**
   - Nếu bạn không cần lịch sử tải hoặc quản lý API sources, dùng `DB_CONNECTION=file`
   - Chế độ này không yêu cầu bất kỳ cấu hình database nào
   - Tải xuống vẫn sẽ hoạt động, nhưng lịch sử sẽ không được lưu

2. **Lỗi CORS:**
   - Đảm bảo CORS được cấu hình đúng trong `config/cors.php`
   - Kiểm tra `SANCTUM_STATEFUL_DOMAINS` trong `.env` có chứa domain của frontend
   - Đảm bảo URL frontend khớp với các domains đã cấu hình

3. **Lỗi Kết Nối API:**
   - Kiểm tra API keys của bạn có đúng
   - Kiểm tra endpoints có thể truy cập
   - Test kết nối bằng tính năng "Test Connection"
   - Đối với Danbooru: Đảm bảo cả username và API key đều được cấu hình

4. **Lỗi Database:**
   - Nếu dùng database, chạy `php artisan migrate:fresh` để reset
   - Kiểm tra cấu hình kết nối database trong `.env`
   - Nếu không cần database, chuyển sang `DB_CONNECTION=file`

5. **Lỗi Tải File:**
   - Đảm bảo thư mục đích tồn tại và có quyền ghi
   - Kiểm tra quyền files
   - Xác nhận URL có thể truy cập

### Chế Độ Debug

Bật chế độ debug trong `.env`:
```ini
APP_DEBUG=true
```

Điều này sẽ cung cấp thông báo lỗi chi tiết trong trình duyệt và logs.

## Đóng Góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng làm theo các bước sau:

1. Fork repository
2. Tạo branch tính năng (`git checkout -b feature/amazing-feature`)
3. Commit các thay đổi (`git commit -m 'Add amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## Giấy Phép

Project này là phần mềm mã nguồn mở được cấp phép theo [MIT license](LICENSE).

## Hỗ Trợ

Để được hỗ trợ, vui lòng mở issue trên repository GitHub.

---

**Built with ❤️ using Laravel and React.js**
