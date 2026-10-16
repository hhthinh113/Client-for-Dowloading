# Media Downloader - Desktop Web Application

A comprehensive media downloader application built with **Laravel (Backend)** and **React.js (Frontend)** that allows users to search, preview, and download media from various platforms like Pixabay, Safebooru, and Unsplash.

## Features

### Core Functionality
- **Multi-platform support**: Pixabay, Safebooru, Unsplash
- **Search with filters**: Query, tags, category, orientation
- **Grid view display**: Responsive media grid with thumbnails
- **Preview functionality**: Preview images and videos before downloading
- **Batch downloading**: Select multiple files to download at once
- **Single file download**: Download individual files

### Advanced Features
- **Custom naming patterns**: Use placeholders like `{author}_{id}_{index}` to customize downloaded file names
- **Destination folder selection**: Specify where files should be saved
- **Download progress tracking**: Real-time progress updates
- **Download history**: View and manage all previous downloads
- **API source management**: Add, edit, delete, and test custom API sources

### User Interface
- **Dark theme with high contrast**: Background and text colors are properly contrasted
- **Responsive design**: Works on desktop and mobile devices
- **Clear notifications**: Toast notifications for all actions
- **Simple and intuitive**: Easy-to-use interface

## Project Structure

```
Client-for-Dowloading/
├── backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── MediaController.php
│   │   │   │   ├── ApiSourceController.php
│   │   │   │   └── DownloadController.php
│   │   │   └── Jobs/
│   │   │       └── DownloadMediaJob.php
│   │   ├── Models/
│   │   │   ├── ApiSource.php
│   │   │   ├── DownloadJob.php
│   │   │   └── User.php
│   │   └── Providers/
│   ├── config/
│   │   ├── app.php
│   │   ├── cors.php
│   │   ├── database.php
│   │   ├── sanctum.php
│   │   └── services.php
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── .env.example
│   └── composer.json
│
└── frontend/                # React.js Frontend
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── MediaGrid.jsx
    │   │   └── DownloadModal.jsx
    │   ├── pages/
    │   │   ├── MediaSearchPage.jsx
    │   │   ├── ApiSourcesPage.jsx
    │   │   └── DownloadHistoryPage.jsx
    │   ├── hooks/
    │   │   └── useDownload.js
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

## Installation

### Prerequisites

- **PHP 8.0 or higher**
- **Composer** (for PHP dependencies)
- **Node.js 18 or higher** (for JavaScript dependencies)
- **npm or yarn** (for JavaScript package management)
- **Database (optional)**: MySQL, PostgreSQL, or SQLite - **Note: The application can run without a database using the `file` driver**

### Backend Setup (Laravel)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```
   
   **Troubleshooting:**
   - If you get `No composer.lock file present` error, run:
     ```bash
     composer update
     ```
   - If you get package not found errors, install dependencies directly:
     ```bash
     composer require laravel/framework:^9.0 fruitcake/laravel-cors:^2.0 laravel/sanctum:^2.14 guzzlehttp/guzzle:^7.2
     ```
   - Then regenerate the lock file:
     ```bash
     composer update --lock
     ```

3. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

5. **Configure database (optional):**
   
   **Option A: No Database (Recommended for simple usage)**
   Use the file driver which doesn't require a database:
   ```ini
   DB_CONNECTION=file
   ```
   
   **Option B: SQLite (Simple setup)**
   ```ini
   DB_CONNECTION=sqlite
   DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
   ```
   Then create the SQLite database:
   ```bash
   touch database/database.sqlite
   ```
   
   **Option C: MySQL**
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=media_downloader
   DB_USERNAME=root
   DB_PASSWORD=
   ```
   
   **Option D: PostgreSQL**
   ```ini
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=media_downloader
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   ```

6. **Run database migrations (skip if using `file` driver):**
   ```bash
   php artisan migrate
   ```
   
   **Note:** If you're using `DB_CONNECTION=file`, you can skip this step as no database is required.

7. **Configure API keys:**
   Get API keys from the respective platforms and add them to `.env`:
   ```ini
   PIXABAY_API_KEY=your_pixabay_api_key
   DANBOORU_USERNAME=your_danbooru_username
   DANBOORU_API_KEY=your_danbooru_api_key
   UNSPLASH_API_KEY=your_unsplash_api_key
   ```
   
   **Note:**
   - Safebooru doesn't require an API key
   - Danbooru requires both username and API key (get from your Danbooru account settings)
   - Pixabay and Unsplash require API keys from their respective developer portals

8. **Start the Laravel development server:**
   ```bash
   php artisan serve
   ```
   
   The backend will be available at `http://localhost:8000`

### Frontend Setup (React.js)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:3000`

### Docker Setup (Optional)

Alternatively, you can use Docker to run the entire application:

1. **Build and start containers:**
   ```bash
   docker-compose up -d
   ```

2. **Run migrations:**
   ```bash
   docker-compose exec backend php artisan migrate
   ```

3. **Access the application:**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

## Configuration

### Environment Variables

#### Backend (.env)
```ini
# Application
APP_NAME=MediaDownloader
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (choose one)
# Option 1: No database (recommended for simple usage)
DB_CONNECTION=file

# Option 2: SQLite
# DB_CONNECTION=sqlite
# DB_DATABASE=/path/to/backend/database/database.sqlite

# Option 3: MySQL
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=media_downloader
# DB_USERNAME=root
# DB_PASSWORD=

# Option 4: PostgreSQL
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

#### Frontend (.env)
The frontend uses Vite's proxy to communicate with the backend. The proxy is configured in `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  },
}
```

## Usage

### Using the Application

1. **Search Media:**
   - Select a platform from the dropdown (Pixabay, Safebooru, Danbooru, Unsplash)
   - Enter your search query and/or tags
   - Optionally filter by category and orientation (where supported)
   - Click "Search" or press Enter

2. **Preview Media:**
   - Click on any media thumbnail to preview
   - Images and videos can be previewed before downloading

3. **Select Files:**
   - Check the checkbox on each media item to select it
   - Use "Select All" to select all items on the current page

4. **Download:**
   - Click "Download Selected" or download individual files
   - In the download modal:
     - Set the destination folder path
     - Configure the naming pattern using placeholders
     - Click "Start Download"

5. **View Download History:**
   - Navigate to the "History" page
   - View all download jobs with their status and progress
   - Cancel ongoing downloads
   - Delete history entries

6. **Manage API Sources:**
   - Navigate to the "API Sources" page
   - Add new API sources for custom platforms
   - Edit or delete existing sources
   - Test connections before saving

### Download Settings

#### Destination Folder Selection
The application provides multiple ways to select where files should be saved:

1. **Browse Mode**: Click "Browse" to navigate through your file system with a visual directory browser
2. **Quick Select**: Use predefined system paths (Downloads, Documents, Pictures, Desktop)
3. **Recent Paths**: Access your recently used download locations
4. **Manual Entry**: Type the full path directly
5. **Default Path**: Set a default download location that's automatically selected

#### Creating New Directories
- In Browse mode, click "Create New Directory" to make a new folder
- Enter the directory name and click "Create"
- The new directory will appear in the current folder

#### Setting Default Download Path
To set a default download path:
1. Select your desired path using any of the methods above
2. The path will be saved as your default for future downloads
3. Click "Default" button to quickly use your saved default path

### Naming Pattern Placeholders

When downloading files, you can use the following placeholders in the naming pattern:

- `{author}` - The author/creator of the media
- `{id}` - The unique ID of the media
- `{index}` - The index number in the batch download
- `{type}` - The media type (image or video)
- `{timestamp}` - Current timestamp (format: YYYYMMDD_HHMMSS)
- `{random}` - A random 8-character string

**Examples:**
- `{author}_{id}_{index}.jpg` → `john_doe_12345_0.jpg`
- `{type}/{author}/{timestamp}_{id}` → `image/john_doe/20240115_123045_12345.jpg`
- `{random}_{id}` → `abc12345_12345.jpg`

## API Endpoints

### Settings Endpoints
- `GET /api/settings/download` - Get download settings (default path, recent paths)
- `POST /api/settings/download` - Save download settings
- `POST /api/settings/download/recent` - Save a recent path
- `POST /api/settings/directories` - List directories in a path
- `POST /api/settings/directories/create` - Create a new directory
- `POST /api/settings/path/check` - Check if a path exists and is writable

### Media Endpoints
- `GET /api/media/search` - Search media across platforms
- `GET /api/media/{platform}` - Get media from specific platform
- `POST /api/media/preview` - Get preview URL for media

### API Sources Endpoints
- `GET /api/api-sources` - List all API sources
- `POST /api/api-sources` - Create new API source
- `GET /api/api-sources/{id}` - Get specific API source
- `PUT /api/api-sources/{id}` - Update API source
- `DELETE /api/api-sources/{id}` - Delete API source
- `POST /api/api-sources/test` - Test API connection

### Download Endpoints
- `POST /api/download/single` - Start single file download
- `POST /api/download/batch` - Start batch download
- `GET /api/download/status/{jobId}` - Get download job status
- `GET /api/download/progress/{jobId}` - Get download progress
- `POST /api/download/cancel/{jobId}` - Cancel download job

### Utility Endpoints
- `GET /api/config` - Get application configuration

## Technology Stack

### Backend
- **Framework**: Laravel 9.x
- **PHP**: 8.0+
- **Database**: MySQL/PostgreSQL/SQLite/File (no database required)
- **Authentication**: Laravel Sanctum
- **CORS**: Laravel CORS package
- **HTTP Client**: Guzzle HTTP
- **Queue**: Laravel Queue (for async downloads)

### Supported Media Platforms
- **Pixabay**: Stock photos, illustrations, videos
- **Safebooru**: Safe anime-style images
- **Danbooru**: Anime-style images with extensive tagging
- **Unsplash**: High-quality photography

### Frontend
- **Framework**: React.js 18.x
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Heroicons
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## Running Tests

### Backend Tests
```bash
cd backend
php artisan test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Troubleshooting

### Common Issues

1. **No Database Connection:**
   - If you don't need download history or API source management, use `DB_CONNECTION=file`
   - This mode doesn't require any database setup
   - Downloads will still work, but history won't be saved

2. **CORS Errors:**
   - Ensure CORS is properly configured in `config/cors.php`
   - Verify `SANCTUM_STATEFUL_DOMAINS` in `.env` includes your frontend domain
   - Check that your frontend URL matches the configured domains

3. **API Connection Failures:**
   - Verify your API keys are correct
   - Check that the API endpoints are accessible
   - Test connections using the "Test Connection" feature
   - For Danbooru: Ensure both username and API key are configured

4. **Database Issues:**
   - If using a database, run `php artisan migrate:fresh` to reset
   - Check your database connection settings in `.env`
   - If you don't need database features, switch to `DB_CONNECTION=file`

4. **File Download Failures:**
   - Ensure the destination folder exists and is writable
   - Check file permissions
   - Verify the URL is accessible

### Debug Mode

Enable debug mode in `.env`:
```ini
APP_DEBUG=true
```

This will provide detailed error messages in the browser and logs.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## Support

For support, please open an issue on the GitHub repository.

---

**Built with ❤️ using Laravel and React.js**
