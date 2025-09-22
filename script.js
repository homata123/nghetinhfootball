// API Configuration
const API_BASE_URL = 'https://homatabe.onrender.com';
const LOGIN_ENDPOINT = '/auth/login';

// Global State
let currentUser = null;
let currentSection = 'home';
let selectedImages = [];
let editingPlayerId = null;
let editingPostId = null;
let editingMatchId = null;
let currentMatchPage = 1;
let currentMatchFilter = '';
let currentMatchSearch = '';

// DOM Elements
const elements = {
    // Navigation
    navMenu: document.getElementById('nav-menu'),
    navToggle: document.getElementById('nav-toggle'),
    navLinks: document.querySelectorAll('.nav-link'),
    loginBtn: document.getElementById('login-btn'),
    userMenu: document.getElementById('user-menu'),
    userName: document.getElementById('user-name'),
    logoutBtn: document.getElementById('logout-btn'),

    // Sections
    sections: document.querySelectorAll('.section'),

    // Home section
    totalPlayers: document.getElementById('total-players'),
    totalGoals: document.getElementById('total-goals'),
    totalPosts: document.getElementById('total-posts'),
    recentPosts: document.getElementById('recent-posts'),
    playersPreview: document.getElementById('players-preview'),

    // Players section
    playersGrid: document.getElementById('players-grid'),
    playerSearch: document.getElementById('player-search'),
    positionFilter: document.getElementById('position-filter'),
    addPlayerBtn: document.getElementById('add-player-btn'),

    // Posts section
    postsGrid: document.getElementById('posts-grid'),
    postSearch: document.getElementById('post-search'),
    addPostBtn: document.getElementById('add-post-btn'),
    addPostBtn2: document.getElementById('add-post-btn-2'),

    // Gallery section
    galleryGrid: document.getElementById('gallery-grid'),
    uploadImageBtn: document.getElementById('upload-image-btn'),

    // Team stats section
    teamStatsGrid: document.getElementById('team-stats-grid'),
    refreshTeamStatsBtn: document.getElementById('refresh-team-stats-btn'),
    updateTeamStatsBtn: document.getElementById('update-team-stats-btn'),

    // Match history section
    matchTableBody: document.getElementById('match-table-body'),
    matchPagination: document.getElementById('match-pagination'),
    matchSearch: document.getElementById('match-search'),
    matchFilter: document.getElementById('match-filter'),
    refreshMatchesBtn: document.getElementById('refresh-matches-btn'),
    addMatchBtn: document.getElementById('add-match-btn'),

    // Modals
    loginModal: document.getElementById('login-modal'),
    playerModal: document.getElementById('player-modal'),
    postModal: document.getElementById('post-modal'),
    imageSelectorModal: document.getElementById('image-selector-modal'),
    playerDetailModal: document.getElementById('player-detail-modal'),
    teamStatsModal: document.getElementById('team-stats-modal'),
    matchModal: document.getElementById('match-modal'),

    // Forms
    loginForm: document.getElementById('login-form'),
    playerForm: document.getElementById('player-form'),
    postForm: document.getElementById('post-form'),
    teamStatsForm: document.getElementById('team-stats-form'),
    matchForm: document.getElementById('match-form'),

    // Loading
    loadingOverlay: document.getElementById('loading-overlay'),
    toastContainer: document.getElementById('toast-container')
};

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Check for existing user session
    checkUserSession();

    // Setup event listeners
    setupEventListeners();

    // Load initial data
    loadInitialData();

    // Setup navigation
    setupNavigation();

    // Load team stats and matches
    loadTeamStats();
    loadMatches();
}

function setupEventListeners() {
    // Navigation toggle for mobile
    elements.navToggle.addEventListener('click', toggleMobileMenu);

    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Login/Logout
    elements.loginBtn.addEventListener('click', showLoginModal);
    elements.logoutBtn.addEventListener('click', logout);
    elements.loginForm.addEventListener('submit', handleLogin);

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', closeAllModals);
    });

    // Click outside modal to close - DISABLED to prevent accidental closing
    // window.addEventListener('click', (e) => {
    //     if (e.target.classList.contains('modal')) {
    //         // Don't close if we're in the middle of an operation
    //         if (!elements.loadingOverlay.classList.contains('active')) {
    //             closeAllModals();
    //         }
    //     }
    // });

    // Player management
    elements.addPlayerBtn.addEventListener('click', () => showPlayerModal());
    elements.playerForm.addEventListener('submit', handlePlayerSubmit);
    document.getElementById('cancel-player').addEventListener('click', closeAllModals);

    // Image button functions will be handled by onclick attributes
    elements.playerSearch.addEventListener('input', debounce(filterPlayers, 300));
    elements.positionFilter.addEventListener('change', filterPlayers);

    // Refresh buttons
    const refreshPlayersBtn = document.getElementById('refresh-players-btn');
    const refreshPostsBtn = document.getElementById('refresh-posts-btn');
    const refreshGalleryBtn = document.getElementById('refresh-gallery-btn');

    if (refreshPlayersBtn) {
        refreshPlayersBtn.addEventListener('click', () => {
            loadPlayers();
            showToast('Đã làm mới danh sách cầu thủ', 'success');
        });
    }

    if (refreshPostsBtn) {
        refreshPostsBtn.addEventListener('click', () => {
            loadPosts();
            showToast('Đã làm mới danh sách bài viết', 'success');
        });
    }

    if (refreshGalleryBtn) {
        refreshGalleryBtn.addEventListener('click', () => {
            loadGallery(1, 20);
            showToast('Đã làm mới thư viện ảnh', 'success');
        });
    }

    // Post management
    elements.addPostBtn.addEventListener('click', () => showPostModal());
    elements.addPostBtn2.addEventListener('click', () => showPostModal());
    elements.postForm.addEventListener('submit', handlePostSubmit);
    document.getElementById('cancel-post').addEventListener('click', closeAllModals);
    elements.postSearch.addEventListener('input', debounce(filterPosts, 300));

    // Image management
    elements.uploadImageBtn.addEventListener('click', showImageSelectorModal);

    // Gallery controls (only for main gallery section, not modal)
    const gallerySearch = document.getElementById('gallery-search');
    const sortBy = document.getElementById('sort-by');
    if (gallerySearch) {
        gallerySearch.addEventListener('input', debounce((e) => {
            // Only filter if we're in gallery section, not modal
            if (!elements.imageSelectorModal.classList.contains('active')) {
                filterGallery(e.target.value);
            }
        }, 300));
    }
    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            // Only sort if we're in gallery section, not modal
            if (!elements.imageSelectorModal.classList.contains('active')) {
                sortGallery(e.target.value);
            }
        });
    }

    // Post form image buttons will be handled by onclick attributes
    document.getElementById('image-upload').addEventListener('change', handleImageUpload);

    // Drag and drop for image upload (modal)
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', () => document.getElementById('image-upload').click());
    }

    // Drag and drop for gallery upload
    const galleryUploadArea = document.getElementById('gallery-upload-area');
    if (galleryUploadArea) {
        galleryUploadArea.addEventListener('dragover', handleDragOver);
        galleryUploadArea.addEventListener('drop', handleDrop);
        galleryUploadArea.addEventListener('click', () => document.getElementById('gallery-image-upload').click());
    }

    // Gallery image upload handler
    const galleryImageUpload = document.getElementById('gallery-image-upload');
    if (galleryImageUpload) {
        galleryImageUpload.addEventListener('change', handleGalleryImageUpload);
    }

    // Image selection modal buttons
    document.getElementById('cancel-image-selection').addEventListener('click', closeAllModals);
    document.getElementById('done-image-selection').addEventListener('click', () => {
        // Close image selector modal and return to form
        elements.imageSelectorModal.classList.remove('active');
        elements.imageSelectorModal.style.display = 'none';
    });

    // Player detail modal close button
    document.getElementById('close-player-detail').addEventListener('click', closeAllModals);

    // Match detail modal close button
    document.getElementById('close-match-detail').addEventListener('click', closeAllModals);

    // Post detail modal close button
    document.getElementById('close-post-detail').addEventListener('click', closeAllModals);

    // Team stats management
    elements.refreshTeamStatsBtn.addEventListener('click', () => {
        loadTeamStats();
        showToast('Đã làm mới thống kê đội bóng', 'success');
    });
    elements.updateTeamStatsBtn.addEventListener('click', showTeamStatsModal);
    elements.teamStatsForm.addEventListener('submit', handleTeamStatsSubmit);
    document.getElementById('cancel-team-stats').addEventListener('click', closeAllModals);

    // Match management
    elements.refreshMatchesBtn.addEventListener('click', () => {
        loadMatches();
        showToast('Đã làm mới danh sách trận đấu', 'success');
    });
    elements.addMatchBtn.addEventListener('click', () => showMatchModal());
    elements.matchForm.addEventListener('submit', handleMatchSubmit);
    document.getElementById('cancel-match').addEventListener('click', closeAllModals);
    elements.matchSearch.addEventListener('input', debounce(filterMatches, 300));
    elements.matchFilter.addEventListener('change', filterMatches);
}

function setupNavigation() {
    // Set active navigation based on current section
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === currentSection) {
            link.classList.add('active');
        }
    });
}

function showSection(sectionName) {
    // Hide all sections
    elements.sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        setupNavigation();

        // Load section-specific data
        switch (sectionName) {
            case 'home':
                loadHomeData();
                break;
            case 'players':
                loadPlayers();
                break;
            case 'posts':
                loadPosts();
                break;
            case 'gallery':
                loadGallery();
                break;
        }
    }

    // Close mobile menu
    elements.navMenu.classList.remove('active');
    elements.navToggle.classList.remove('active');
}

function toggleMobileMenu() {
    elements.navMenu.classList.toggle('active');
    elements.navToggle.classList.toggle('active');
}

// Authentication Functions
function checkUserSession() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            updateAuthUI();
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('userData');
        }
    }
}

function updateAuthUI() {
    if (currentUser) {
        elements.loginBtn.style.display = 'none';
        elements.userMenu.style.display = 'flex';
        elements.userName.textContent = currentUser.full_name;

        // Show admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'inline-flex';
        });
    } else {
        elements.loginBtn.style.display = 'block';
        elements.userMenu.style.display = 'none';

        // Hide admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

function showLoginModal() {
    elements.loginModal.classList.add('active');
    elements.loginModal.style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });

    // Show upload area again
    const uploadSection = document.querySelector('.image-upload-section');
    if (uploadSection) {
        uploadSection.classList.remove('hidden');
    }

    // Hide pagination controls
    const paginationContainer = document.getElementById('gallery-pagination');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }

    // Reset selected images
    selectedImages = [];
    currentImageContainer = null;
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    showLoading(true);

    try {
        const result = await login(email, password);
        if (result.success) {
            currentUser = result.user;
            saveUserSession(result.user);
            updateAuthUI();
            closeAllModals();
            showToast('Đăng nhập thành công!', 'success');
            loadInitialData();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Có lỗi xảy ra khi đăng nhập', 'error');
        console.error('Login error:', error);
    } finally {
        showLoading(false);
    }
}

async function login(email, password) {
    try {
        console.log('Attempting login with:', { email, password: '***' });
        console.log('API URL:', `${API_BASE_URL}${LOGIN_ENDPOINT}`);

        const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 400) {
                throw new Error('Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại email và password.');
            } else if (response.status === 401) {
                throw new Error('Email hoặc mật khẩu không đúng.');
            } else if (response.status === 403) {
                throw new Error('Tài khoản của bạn đã bị khóa hoặc không có quyền truy cập.');
            } else if (response.status === 404) {
                throw new Error('Không tìm thấy dịch vụ đăng nhập. Vui lòng thử lại sau.');
            } else if (response.status === 405) {
                throw new Error('Lỗi CORS: Server không hỗ trợ OPTIONS request. Vui lòng kiểm tra cấu hình CORS trên server.');
            } else if (response.status >= 500) {
                throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
            }

            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.access_token) {
            throw new Error('Invalid response from server');
        }

        return {
            success: true,
            user: data,
            message: 'Đăng nhập thành công!'
        };

    } catch (error) {
        console.error('Login error:', error);

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return {
                success: false,
                message: 'Lỗi kết nối: Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server có đang chạy không?\n2. Cấu hình CORS trên server\n3. URL API có đúng không?'
            };
        }

        if (error.message.includes('CORS')) {
            return {
                success: false,
                message: 'Lỗi CORS: Server cần cấu hình để cho phép requests từ browser. Vui lòng kiểm tra cấu hình CORS trên server.'
            };
        }

        return {
            success: false,
            message: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
        };
    }
}

function saveUserSession(userData) {
    try {
        localStorage.setItem('userData', JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error saving user session:', error);
        return false;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('userData');
    updateAuthUI();
    showToast('Đã đăng xuất thành công', 'info');
    loadInitialData();
}

// API Helper Functions
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };

    // Add authorization header if user is logged in
    if (currentUser && currentUser.access_token) {
        defaultOptions.headers['Authorization'] = `Bearer ${currentUser.access_token}`;
    }

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, finalOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Data Loading Functions
async function loadInitialData() {
    try {
        await Promise.all([
            loadHomeData(),
            loadPlayers(),
            loadPosts(),
            loadTeamStats(),
            loadMatches()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Có lỗi xảy ra khi tải dữ liệu', 'error');
    }
}

async function loadHomeData() {
    try {
        const [players, posts] = await Promise.all([
            apiCall('/football/footballers'),
            apiCall('/team/posts?published_only=true')
        ]);

        // Update stats
        elements.totalPlayers.textContent = players.length;
        elements.totalGoals.textContent = players.reduce((sum, player) => sum + (player.scored_goals || 0), 0);
        elements.totalPosts.textContent = posts.length;

        // Load recent posts
        displayRecentPosts(posts.slice(0, 6));

        // Load players preview
        displayPlayersPreview(players.slice(0, 8));
    } catch (error) {
        console.error('Error loading home data:', error);
    }
}

async function loadPlayers() {
    try {
        showLoading(true);
        const players = await apiCall('/football/footballers');
        displayPlayers(players);
    } catch (error) {
        console.error('Error loading players:', error);
        showToast('Có lỗi xảy ra khi tải danh sách cầu thủ', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadPosts() {
    try {
        showLoading(true);
        const posts = await apiCall('/team/posts?published_only=true');
        displayPosts(posts);
    } catch (error) {
        console.error('Error loading posts:', error);
        showToast('Có lỗi xảy ra khi tải danh sách bài viết', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadGallery(page = 1, pageSize = 20) {
    try {
        console.log('loadGallery called with page:', page, 'pageSize:', pageSize);
        showLoading(true);

        const response = await apiCall(`/football/admin/images?page=${page}&page_size=${pageSize}`);
        console.log('Gallery API response:', response);

        if (response && response.images && Array.isArray(response.images)) {
            console.log('Images loaded:', response.images.length);
            console.log('Pagination info:', response.pagination);

            displayGallery(response.images);
            updatePaginationControls(response.pagination);
        } else {
            console.error('Invalid response structure:', response);
            showToast('Dữ liệu ảnh không hợp lệ', 'error');
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        showToast('Có lỗi xảy ra khi tải thư viện ảnh', 'error');
    } finally {
        showLoading(false);
    }
}

function updatePaginationControls(pagination) {
    // Check if we're in modal context
    const isModalOpen = elements.imageSelectorModal.classList.contains('active');
    const paginationContainer = isModalOpen
        ? document.getElementById('modal-gallery-pagination')
        : document.getElementById('gallery-pagination');

    if (!paginationContainer) return;

    const { page, total_pages, has_next, has_prev } = pagination;

    paginationContainer.innerHTML = `
        <div class="pagination-info">
            Trang ${page} / ${total_pages}
        </div>
        <div class="pagination-controls">
            <button class="btn btn-outline" ${!has_prev ? 'disabled' : ''} 
                    onclick="loadGallery(${page - 1})">
                <i class="fas fa-chevron-left"></i> Trước
            </button>
            <button class="btn btn-outline" ${!has_next ? 'disabled' : ''} 
                    onclick="loadGallery(${page + 1})">
                Sau <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

// Display Functions
function displayRecentPosts(posts) {
    elements.recentPosts.innerHTML = '';

    posts.forEach(post => {
        const postCard = createPostCard(post);
        elements.recentPosts.appendChild(postCard);
    });
}

function displayPlayersPreview(players) {
    elements.playersPreview.innerHTML = '';

    players.forEach(player => {
        const playerCard = createPlayerPreviewCard(player);
        elements.playersPreview.appendChild(playerCard);
    });
}

function displayPlayers(players) {
    elements.playersGrid.innerHTML = '';

    players.forEach(player => {
        const playerCard = createPlayerCard(player);
        elements.playersGrid.appendChild(playerCard);
    });
}

function displayPosts(posts) {
    elements.postsGrid.innerHTML = '';

    posts.forEach(post => {
        const postCard = createPostCard(post);
        elements.postsGrid.appendChild(postCard);
    });
}

function displayGallery(images) {
    console.log('=== displayGallery called ===');
    console.log('Images parameter:', images);
    console.log('Images type:', typeof images);
    console.log('Is array:', Array.isArray(images));
    console.log('Images length:', images ? images.length : 'undefined');

    // Check if we're in modal context
    const isModalOpen = elements.imageSelectorModal.classList.contains('active');
    const galleryContainer = isModalOpen
        ? document.getElementById('modal-image-gallery')
        : document.getElementById('image-gallery');

    console.log('Gallery container element:', galleryContainer);
    console.log('Gallery container exists:', !!galleryContainer);
    console.log('Is modal context:', isModalOpen);

    if (galleryContainer) {
        console.log('Gallery container found, clearing content...');
        galleryContainer.innerHTML = '';
        console.log('Gallery container cleared');

        if (images && images.length > 0) {
            images.forEach((image, index) => {
                console.log(`=== Processing image ${index + 1}/${images.length} ===`);
                console.log('Image object:', image);
                console.log('Image keys:', Object.keys(image));

                const galleryItem = createGalleryItem(image);
                console.log('Gallery item created:', galleryItem);
                console.log('Gallery item HTML:', galleryItem.outerHTML);

                galleryContainer.appendChild(galleryItem);
                console.log(`Image ${index + 1} appended to gallery`);
                console.log('Gallery container children count after append:', galleryContainer.children.length);
            });
        } else {
            console.log('No images to display');
            galleryContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Không có ảnh nào trong thư viện</p>';
        }

        console.log('=== Gallery display completed ===');
        console.log('Final gallery container children count:', galleryContainer.children.length);
        console.log('Gallery container innerHTML length:', galleryContainer.innerHTML.length);
    } else {
        console.error('Gallery container not found! Check if element with id="image-gallery" exists in HTML');
    }
}

// Card Creation Functions
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';

    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
    const playerImage = player.images && player.images[0] ? player.images[0] : defaultImage;

    card.innerHTML = `
        <div class="player-number">${player.number}</div>
        <img src="${playerImage}" alt="${player.fullname}" class="player-image" onerror="this.src='${defaultImage}'" />
        <div class="player-info">
            <h3 class="player-name">${player.fullname}</h3>
            <p class="player-position">${player.position}</p>
            <div class="player-stats">
                <div class="stat">
                    <i class="fas fa-futbol"></i>
                    <span>${player.scored_goals || 0} bàn</span>
                </div>
                <div class="stat">
                    <i class="fas fa-assist"></i>
                    <span>${player.assists || 0} KT</span>
                </div>
            </div>
            <div class="player-actions">
                <button class="btn btn-primary btn-sm" onclick="loadPlayerDetail('${player.id}')">
                    <i class="fas fa-eye"></i> Xem Chi Tiết
                </button>
                ${currentUser ? `
                    <button class="btn btn-outline btn-sm" onclick="editPlayer('${player.id}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePlayer('${player.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    return card;
}

function createPlayerPreviewCard(player) {
    const card = document.createElement('div');
    card.className = 'player-card';

    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
    const playerImage = player.images && player.images[0] ? player.images[0] : defaultImage;

    card.innerHTML = `
        <div class="player-number">${player.number}</div>
        <img src="${playerImage}" alt="${player.fullname}" class="player-image" onerror="this.src='${defaultImage}'" />
        <div class="player-info">
            <h3 class="player-name">${player.fullname}</h3>
            <p class="player-position">${player.position}</p>
            <div class="player-actions">
                <button class="btn btn-primary btn-sm" onclick="loadPlayerDetail('${player.id}')">
                    <i class="fas fa-eye"></i> Xem Chi Tiết
                </button>
            </div>
        </div>
    `;
    return card;
}

function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (!e.target.closest('.post-actions')) {
            viewPostDetail(post.id);
        }
    });

    const hasImage = post.images && post.images[0];
    const imageHtml = hasImage ?
        `<img src="${post.images[0]}" alt="${post.title}" class="post-image" onerror="this.style.display='none'">` :
        '<div class="post-image" style="background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;"><i class="fas fa-newspaper"></i></div>';

    card.innerHTML = `
        ${imageHtml}
        <div class="post-content">
            <h3 class="post-title">${post.title}</h3>
            <p class="post-excerpt">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <div class="post-meta">
                <span class="post-author">${post.author}</span>
                <span class="post-date">${formatDate(post.published_at || post.created_at)}</span>
            </div>
            ${currentUser ? `
                <div class="post-actions">
                    <button class="btn btn-outline btn-sm" onclick="editPost('${post.id}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePost('${post.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    return card;
}

function createGalleryItem(image) {
    console.log('=== createGalleryItem called ===');
    console.log('Image parameter:', image);
    console.log('Image type:', typeof image);
    console.log('Image keys:', image ? Object.keys(image) : 'image is null/undefined');

    if (!image) {
        console.error('Image is null or undefined');
        return null;
    }

    console.log('Image properties:', {
        id: image.id,
        path: image.path,
        thumbnail: image.thumbnail,
        original_name: image.original_name,
        file_size: image.file_size
    });

    const item = document.createElement('div');
    item.className = 'gallery-item';

    // Add data attributes for sorting and filtering
    item.dataset.uploadedAt = image.uploaded_at || new Date().toISOString();
    item.dataset.name = image.original_name || '';
    item.dataset.size = image.file_size || 0;

    console.log('Created div element with class gallery-item');

    const imageSrc = image.thumbnail || image.path;
    const imageAlt = image.original_name || 'Gallery image';
    const fileSize = image.file_size ? formatFileSize(image.file_size) : 'Unknown size';

    console.log('Image data for HTML:', {
        imageSrc,
        imageAlt,
        fileSize,
        imageId: image.id,
        imagePath: image.path
    });

    // Create image element directly instead of innerHTML
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = imageAlt;
    img.style.cursor = 'pointer';
    img.style.width = '100%';
    img.style.height = '150px';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    img.style.borderRadius = 'var(--radius-lg)';

    // Add error handling for image loading
    img.onerror = function () {
        console.error('Failed to load image:', imageSrc);
        this.style.display = 'none';
        // Show placeholder
        const placeholder = document.createElement('div');
        placeholder.style.width = '100%';
        placeholder.style.height = '150px';
        placeholder.style.backgroundColor = '#f3f4f6';
        placeholder.style.display = 'flex';
        placeholder.style.alignItems = 'center';
        placeholder.style.justifyContent = 'center';
        placeholder.style.borderRadius = 'var(--radius-lg)';
        placeholder.innerHTML = '<i class="fas fa-image" style="font-size: 2rem; color: #9ca3af;"></i>';
        this.parentNode.replaceChild(placeholder, this);
    };

    img.onload = function () {
        console.log('Image loaded successfully:', imageSrc);
    };

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const info = document.createElement('div');
    info.className = 'info';

    const nameP = document.createElement('p');
    nameP.textContent = imageAlt;

    const sizeP = document.createElement('p');
    sizeP.textContent = fileSize;

    info.appendChild(nameP);
    info.appendChild(sizeP);
    overlay.appendChild(info);

    // Append elements to item
    item.appendChild(img);
    item.appendChild(overlay);

    console.log('Elements appended to item');

    // Add click event listener to the entire item
    item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Gallery item clicked:', image);
        selectImage(image.id, image.path);
    });

    console.log('Gallery item created successfully');
    console.log('Final item HTML:', item.outerHTML);
    console.log('Item children count:', item.children.length);
    return item;
}

// Player Management
function showPlayerModal(player = null) {
    editingPlayerId = player ? player.id : null;

    const modal = elements.playerModal;
    const title = document.getElementById('player-modal-title');
    const form = elements.playerForm;

    if (player) {
        title.textContent = 'Sửa Cầu Thủ';

        // Use getElementById instead of form properties
        const nameField = document.getElementById('player-name');
        const numberField = document.getElementById('player-number');
        const positionField = document.getElementById('player-position');
        const yearField = document.getElementById('player-year');
        const hometownField = document.getElementById('player-hometown');
        const goalsField = document.getElementById('player-goals');
        const assistsField = document.getElementById('player-assists');
        const joinedField = document.getElementById('player-joined');

        if (nameField) nameField.value = player.fullname || '';
        if (numberField) numberField.value = player.number || '';
        if (positionField) positionField.value = player.position || '';
        if (yearField) yearField.value = player.born_year || '';
        if (hometownField) hometownField.value = player.hometown_address || '';
        if (goalsField) goalsField.value = player.scored_goals || 0;
        if (assistsField) assistsField.value = player.assists || 0;
        if (joinedField) joinedField.value = player.joined_date ? player.joined_date.split('T')[0] : '';

        // Set description field
        const descriptionField = document.getElementById('player-description');
        if (descriptionField) descriptionField.value = player.description || '';

        // Load existing images
        selectedImages = player.images || [];
        updateSelectedImages('selected-images');
    } else {
        title.textContent = 'Thêm Cầu Thủ';
        form.reset();
        selectedImages = [];
        updateSelectedImages('selected-images');
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

async function handlePlayerSubmit(e) {
    e.preventDefault();
    console.log('Player form submitted');
    console.log('Form submit event target:', e.target);
    console.log('Form submit event current target:', e.currentTarget);

    const formData = {
        fullname: document.getElementById('player-name').value,
        born_year: parseInt(document.getElementById('player-year').value),
        number: parseInt(document.getElementById('player-number').value),
        position: document.getElementById('player-position').value,
        hometown_address: document.getElementById('player-hometown').value,
        scored_goals: parseInt(document.getElementById('player-goals').value) || 0,
        assists: parseInt(document.getElementById('player-assists').value) || 0,
        active_status: true,
        joined_date: document.getElementById('player-joined').value + 'T00:00:00+07:00',
        description: document.getElementById('player-description').value || '',
        images: selectedImages
    };

    try {
        showLoading(true);

        if (editingPlayerId) {
            await apiCall(`/football/admin/footballers/${editingPlayerId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showToast('Cập nhật cầu thủ thành công!', 'success');
        } else {
            await apiCall('/football/admin/footballers', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Thêm cầu thủ thành công!', 'success');
        }

        closeAllModals();
        loadPlayers();
        loadHomeData();
    } catch (error) {
        console.error('Error saving player:', error);
        showToast('Có lỗi xảy ra khi lưu cầu thủ', 'error');
        // Don't close modal on error
    } finally {
        showLoading(false);
    }
}

async function editPlayer(playerId) {
    try {
        const player = await apiCall(`/football/footballers/${playerId}`);
        showPlayerModal(player);
    } catch (error) {
        console.error('Error loading player:', error);
        showToast('Có lỗi xảy ra khi tải thông tin cầu thủ', 'error');
    }
}

async function deletePlayer(playerId) {
    if (!confirm('Bạn có chắc chắn muốn xóa cầu thủ này?')) return;

    try {
        showLoading(true);
        await apiCall(`/football/admin/footballers/${playerId}`, {
            method: 'DELETE'
        });
        showToast('Xóa cầu thủ thành công!', 'success');
        loadPlayers();
        loadHomeData();
    } catch (error) {
        console.error('Error deleting player:', error);
        showToast('Có lỗi xảy ra khi xóa cầu thủ', 'error');
    } finally {
        showLoading(false);
    }
}

// Post Management
function showPostModal(post = null) {
    editingPostId = post ? post.id : null;

    const modal = elements.postModal;
    const title = document.getElementById('post-modal-title');
    const form = elements.postForm;

    if (post) {
        title.textContent = 'Sửa Bài Viết';
        form.title.value = post.title;
        form.content.value = post.content;
        form.author.value = post.author;
        form.published.checked = post.published;

        // Load existing images
        selectedImages = post.images || [];
        updateSelectedImages('selected-post-images');
    } else {
        title.textContent = 'Thêm Bài Viết';
        form.reset();
        if (currentUser) {
            document.getElementById('post-author').value = currentUser.full_name;
        }
        selectedImages = [];
        updateSelectedImages('selected-post-images');
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

async function handlePostSubmit(e) {
    e.preventDefault();
    console.log('Post form submitted');

    const formData = {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value,
        author: document.getElementById('post-author').value,
        images: selectedImages,
        published: document.getElementById('post-published').checked,
        published_at: document.getElementById('post-published').checked ?
            new Date().toISOString() : null
    };

    try {
        showLoading(true);

        if (editingPostId) {
            await apiCall(`/team/admin/posts/${editingPostId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showToast('Cập nhật bài viết thành công!', 'success');
        } else {
            await apiCall('/team/admin/posts', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Thêm bài viết thành công!', 'success');
        }

        closeAllModals();
        loadPosts();
        loadHomeData();
    } catch (error) {
        console.error('Error saving post:', error);
        showToast('Có lỗi xảy ra khi lưu bài viết', 'error');
        // Don't close modal on error
    } finally {
        showLoading(false);
    }
}

async function editPost(postId) {
    try {
        const post = await apiCall(`/team/posts/${postId}`);
        showPostModal(post);
    } catch (error) {
        console.error('Error loading post:', error);
        showToast('Có lỗi xảy ra khi tải thông tin bài viết', 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;

    try {
        showLoading(true);
        await apiCall(`/team/admin/posts/${postId}`, {
            method: 'DELETE'
        });
        showToast('Xóa bài viết thành công!', 'success');
        loadPosts();
        loadHomeData();
    } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Có lỗi xảy ra khi xóa bài viết', 'error');
    } finally {
        showLoading(false);
    }
}

// Image Management
let currentImageContainer = 'selected-images'; // Track which container we're updating

function showImageSelectorModal() {
    console.log('showImageSelectorModal called');
    console.log('Image selector modal element:', elements.imageSelectorModal);
    elements.imageSelectorModal.classList.add('active');
    elements.imageSelectorModal.style.display = 'flex';

    // Hide upload area when selecting from library
    const uploadSection = document.querySelector('.image-upload-section');
    if (uploadSection) {
        uploadSection.classList.add('hidden');
    }

    // Show gallery container
    const galleryContainer = document.getElementById('image-gallery');
    if (galleryContainer) {
        galleryContainer.style.display = 'grid';
        galleryContainer.style.visibility = 'visible';
        galleryContainer.style.opacity = '1';
    }

    // Show pagination controls
    const paginationContainer = document.getElementById('gallery-pagination');
    if (paginationContainer) {
        paginationContainer.style.display = 'block';
    }

    // Show current selected images preview
    updateImagePreview();

    console.log('About to load gallery');
    loadGallery(1, 20); // Load first page with 20 items
}

function selectImage(imageId, imagePath) {
    console.log('=== selectImage called ===');
    console.log('imageId:', imageId);
    console.log('imagePath:', imagePath);
    console.log('currentImageContainer:', currentImageContainer);
    console.log('selectedImages before:', selectedImages);

    if (!selectedImages.includes(imagePath)) {
        selectedImages.push(imagePath);
        console.log('selectedImages after:', selectedImages);
        updateSelectedImages(currentImageContainer);
        showToast(`Đã chọn ảnh: ${imagePath.split('/').pop()}`, 'success');
        console.log('Image added to selection:', imagePath);
    } else {
        showToast('Ảnh đã được chọn trước đó', 'warning');
        console.log('Image already selected:', imagePath);
    }

    console.log('=== selectImage completed ===');
}

function updateSelectedImages(containerId = 'selected-images') {
    console.log('=== updateSelectedImages called ===');
    console.log('containerId:', containerId);
    console.log('selectedImages:', selectedImages);

    const container = document.getElementById(containerId);
    console.log('container element:', container);

    if (container) {
        container.innerHTML = '';
        console.log('Container cleared');

        selectedImages.forEach((imagePath, index) => {
            console.log('Creating image div for:', imagePath, 'index:', index);
            const imageDiv = document.createElement('div');
            imageDiv.className = 'selected-image';
            imageDiv.innerHTML = `
                <img src="${imagePath}" alt="Selected image">
                <button type="button" class="remove" onclick="removeSelectedImage(${index}, '${containerId}')">&times;</button>
            `;
            container.appendChild(imageDiv);
            console.log('Image div appended to container');
        });
        console.log('All images added to container');
    } else {
        console.error('Container not found:', containerId);
    }

    // Also update preview in image selector modal
    updateImagePreview();
    console.log('=== updateSelectedImages completed ===');
}

function updateImagePreview() {
    console.log('=== updateImagePreview called ===');
    console.log('selectedImages:', selectedImages);

    const previewContainer = document.getElementById('preview-container');
    const previewSection = document.getElementById('selected-images-preview');

    console.log('previewContainer:', previewContainer);
    console.log('previewSection:', previewSection);

    if (previewContainer && previewSection) {
        previewContainer.innerHTML = '';
        console.log('Preview container cleared');

        if (selectedImages.length > 0) {
            previewSection.style.display = 'block';
            console.log('Preview section shown');
            selectedImages.forEach((imagePath, index) => {
                console.log('Creating preview image div for:', imagePath, 'index:', index);
                const imageDiv = document.createElement('div');
                imageDiv.className = 'selected-image';
                imageDiv.innerHTML = `
                    <img src="${imagePath}" alt="Selected image">
                    <button type="button" class="remove" onclick="removeSelectedImage(${index}, 'preview-container')">&times;</button>
                `;
                previewContainer.appendChild(imageDiv);
                console.log('Preview image div appended');
            });
        } else {
            previewSection.style.display = 'none';
            console.log('Preview section hidden');
        }
    } else {
        console.error('Preview elements not found');
    }
    console.log('=== updateImagePreview completed ===');
}

function removeSelectedImage(index, containerId) {
    selectedImages.splice(index, 1);
    updateSelectedImages(containerId);
    showToast('Đã xóa ảnh khỏi danh sách', 'info');
}

async function handleImageUpload(e) {
    const files = Array.from(e.target.files);

    for (const file of files) {
        try {
            showLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/football/admin/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                selectedImages.push(result.path);
                showToast('Upload ảnh thành công!', 'success');
                updateSelectedImages(currentImageContainer);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Có lỗi xảy ra khi upload ảnh', 'error');
        } finally {
            showLoading(false);
        }
    }

    // Reload gallery to show new images
    loadGallery();
}

// Gallery image upload handler (for gallery section)
async function handleGalleryImageUpload(e) {
    const files = Array.from(e.target.files);

    for (const file of files) {
        try {
            showLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/football/admin/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.access_token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                showToast('Upload ảnh thành công!', 'success');
                // Reload gallery to show new images
                loadGallery(1, 20);
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast('Có lỗi xảy ra khi upload ảnh', 'error');
        } finally {
            showLoading(false);
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#1e3a8a';
    e.currentTarget.style.backgroundColor = 'rgba(30, 58, 138, 0.05)';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#d1d5db';
    e.currentTarget.style.backgroundColor = 'transparent';

    const files = Array.from(e.dataTransfer.files);

    // Check if we're in gallery upload area or modal upload area
    if (e.currentTarget.id === 'gallery-upload-area') {
        const fileInput = document.getElementById('gallery-image-upload');
        fileInput.files = e.dataTransfer.files;
        handleGalleryImageUpload({ target: { files: files } });
    } else {
        const fileInput = document.getElementById('image-upload');
        fileInput.files = e.dataTransfer.files;
        handleImageUpload({ target: { files: files } });
    }
}

// Filter Functions
function filterPlayers() {
    const searchTerm = elements.playerSearch.value.toLowerCase();
    const positionFilter = elements.positionFilter.value;

    const playerCards = elements.playersGrid.querySelectorAll('.player-card');

    playerCards.forEach(card => {
        const name = card.querySelector('.player-name').textContent.toLowerCase();
        const position = card.querySelector('.player-position').textContent;

        const matchesSearch = name.includes(searchTerm);
        const matchesPosition = !positionFilter || position === positionFilter;

        card.style.display = (matchesSearch && matchesPosition) ? 'block' : 'none';
    });
}

function filterPosts() {
    const searchTerm = elements.postSearch.value.toLowerCase();

    const postCards = elements.postsGrid.querySelectorAll('.post-card');

    postCards.forEach(card => {
        const title = card.querySelector('.post-title').textContent.toLowerCase();
        const content = card.querySelector('.post-excerpt').textContent.toLowerCase();

        const matches = title.includes(searchTerm) || content.includes(searchTerm);
        card.style.display = matches ? 'block' : 'none';
    });
}

// Utility Functions
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check-circle' :
        type === 'error' ? 'exclamation-circle' :
            type === 'warning' ? 'exclamation-triangle' : 'info-circle';

    toast.innerHTML = `
        <i class="fas fa-${icon} icon"></i>
        <span class="message">${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Image selection functions
function selectFromLibrary(containerId) {
    console.log('=== selectFromLibrary called ===');
    console.log('containerId:', containerId);
    currentImageContainer = containerId;
    selectedImages = []; // Reset selected images
    console.log('currentImageContainer set to:', currentImageContainer);
    showImageSelectorModal();
    loadGallery(1, 20); // Load first page with 20 items
}

function uploadNewImage(containerId) {
    console.log('uploadNewImage called with container:', containerId);
    currentImageContainer = containerId;

    // Show upload area and hide gallery when uploading new images
    const uploadSection = document.querySelector('.image-upload-section');
    if (uploadSection) {
        uploadSection.classList.remove('hidden');
    }

    // Hide gallery when uploading
    const galleryContainer = document.getElementById('image-gallery');
    if (galleryContainer) {
        galleryContainer.style.display = 'none';
    }

    // Hide pagination when uploading
    const paginationContainer = document.getElementById('gallery-pagination');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }

    // Open file picker
    document.getElementById('image-upload').click();
}

// Test function to debug image selection
function testImageSelection() {
    console.log('=== Testing Image Selection ===');
    console.log('currentImageContainer:', currentImageContainer);
    console.log('selectedImages:', selectedImages);

    // Test adding an image
    const testImagePath = 'https://example.com/test-image.jpg';
    selectedImages.push(testImagePath);
    console.log('Added test image, selectedImages:', selectedImages);

    updateSelectedImages(currentImageContainer);
    console.log('Updated selected images');
}

// Make functions globally available
window.editPlayer = editPlayer;
window.deletePlayer = deletePlayer;
window.editPost = editPost;
window.deletePost = deletePost;
window.selectImage = selectImage;
window.removeSelectedImage = removeSelectedImage;
window.selectFromLibrary = selectFromLibrary;
window.uploadNewImage = uploadNewImage;
window.testImageSelection = testImageSelection;

// Test function for debugging gallery
window.testGallery = function () {
    console.log('=== Testing Gallery ===');

    // Test 1: Check if gallery container exists
    const galleryContainer = document.getElementById('image-gallery');
    console.log('Gallery container exists:', !!galleryContainer);
    console.log('Gallery container element:', galleryContainer);

    if (galleryContainer) {
        console.log('Gallery container current innerHTML:', galleryContainer.innerHTML);
        console.log('Gallery container children count:', galleryContainer.children.length);
        console.log('Gallery container computed styles:', {
            display: getComputedStyle(galleryContainer).display,
            visibility: getComputedStyle(galleryContainer).visibility,
            opacity: getComputedStyle(galleryContainer).opacity,
            height: getComputedStyle(galleryContainer).height,
            width: getComputedStyle(galleryContainer).width
        });
    }

    // Test 2: Create a test image item
    const testImage = {
        id: 'test-123',
        path: 'https://via.placeholder.com/200x150/0066cc/ffffff?text=Test+Image',
        thumbnail: 'https://via.placeholder.com/200x150/0066cc/ffffff?text=Test+Thumb',
        original_name: 'test-image.jpg',
        file_size: 12345
    };

    console.log('Creating test gallery item...');
    const testItem = createGalleryItem(testImage);
    console.log('Test item created:', testItem);

    if (testItem && galleryContainer) {
        galleryContainer.innerHTML = '';
        galleryContainer.appendChild(testItem);
        console.log('Test item appended to gallery');
        console.log('Gallery container children count after test:', galleryContainer.children.length);

        // Check test item styles
        const testImg = testItem.querySelector('img');
        if (testImg) {
            console.log('Test image computed styles:', {
                display: getComputedStyle(testImg).display,
                visibility: getComputedStyle(testImg).visibility,
                opacity: getComputedStyle(testImg).opacity,
                width: getComputedStyle(testImg).width,
                height: getComputedStyle(testImg).height
            });
        }
    }

    // Test 3: Load real gallery
    console.log('Loading real gallery...');
    loadGallery(1, 20);
};

// Test function to force show gallery
window.forceShowGallery = function () {
    console.log('=== Force Show Gallery ===');
    const galleryContainer = document.getElementById('image-gallery');
    if (galleryContainer) {
        galleryContainer.style.display = 'grid';
        galleryContainer.style.visibility = 'visible';
        galleryContainer.style.opacity = '1';
        galleryContainer.style.minHeight = '200px';
        console.log('Gallery forced to show');
    }
};

// Gallery filter function
function filterGallery(query) {
    // Check if we're in modal context
    const isModalOpen = elements.imageSelectorModal.classList.contains('active');
    const containerId = isModalOpen ? 'modal-image-gallery' : 'image-gallery';
    const galleryItems = document.querySelectorAll(`#${containerId} .gallery-item`);

    galleryItems.forEach(item => {
        const imageName = item.querySelector('.info p')?.textContent.toLowerCase() || '';
        if (imageName.includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Gallery sort function
function sortGallery(sortBy) {
    // Check if we're in modal context
    const isModalOpen = elements.imageSelectorModal.classList.contains('active');
    const galleryContainer = isModalOpen
        ? document.getElementById('modal-image-gallery')
        : document.getElementById('image-gallery');

    if (!galleryContainer) return;

    const items = Array.from(galleryContainer.children);

    items.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.dataset.uploadedAt) - new Date(a.dataset.uploadedAt);
            case 'oldest':
                return new Date(a.dataset.uploadedAt) - new Date(b.dataset.uploadedAt);
            case 'name':
                return a.dataset.name.localeCompare(b.dataset.name);
            case 'size':
                return parseInt(b.dataset.size) - parseInt(a.dataset.size);
            default:
                return 0;
        }
    });

    items.forEach(item => galleryContainer.appendChild(item));
}

// Player Detail Functions
async function loadPlayerDetail(playerId) {
    try {
        showLoading(true);
        const player = await apiCall(`/football/footballers/${playerId}`);
        showPlayerDetailModal(player);
    } catch (error) {
        console.error('Error loading player detail:', error);
        showToast('Có lỗi xảy ra khi tải thông tin cầu thủ', 'error');
    } finally {
        showLoading(false);
    }
}

function showPlayerDetailModal(player) {
    // Update modal content with player data
    document.getElementById('player-detail-name').textContent = player.fullname;
    document.getElementById('player-detail-number').textContent = `#${player.number}`;
    document.getElementById('player-detail-position').textContent = player.position;
    document.getElementById('player-detail-born-year').textContent = player.born_year;
    document.getElementById('player-detail-hometown').textContent = player.hometown_address;
    document.getElementById('player-detail-goals').textContent = player.scored_goals;
    document.getElementById('player-detail-assists').textContent = player.assists;

    // Format joined date
    const joinedDate = new Date(player.joined_date);
    document.getElementById('player-detail-joined-date').textContent = joinedDate.toLocaleDateString('vi-VN');

    // Update status
    const statusElement = document.getElementById('player-detail-status');
    if (player.active_status) {
        statusElement.textContent = 'Hoạt động';
        statusElement.className = 'status-badge active';
    } else {
        statusElement.textContent = 'Không hoạt động';
        statusElement.className = 'status-badge inactive';
    }

    // Update description
    const descriptionElement = document.getElementById('player-detail-description');
    if (descriptionElement) {
        if (player.description && player.description.trim()) {
            descriptionElement.textContent = player.description;
        } else {
            descriptionElement.textContent = 'Chưa có mô tả';
            descriptionElement.style.fontStyle = 'italic';
            descriptionElement.style.color = 'var(--gray-500)';
        }
    }

    // Update player photo
    const photoElement = document.getElementById('player-detail-photo');
    if (player.images && player.images.length > 0) {
        photoElement.src = player.images[0];
        photoElement.alt = player.fullname;
    } else {
        // Default placeholder image
        photoElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjM1MCIgdmlld0JveD0iMCAwIDI4MCAzNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMzUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjE0MCIgcj0iNDAiIGZpbGw9IiM5Q0E0QUYiLz4KPHN2ZyB4PSIxMTAiIHk9IjExMCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMTJDMTQuMjA5MSAxMiAxNiAxMC4yMDkxIDE2IDhDMTYgNS43OTA5IDE0LjIwOTEgNCAxMiA0QzkuNzkwODYgNCA4IDUuNzkwOSA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTRDOS43OTA4NiAxNCA4IDE1Ljc5MDkgOCAxOEgyMEMyMCAxNS43OTA5IDE4LjIwOTEgMTQgMTYgMTRIMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+';
        photoElement.alt = 'Không có ảnh';
    }

    // Show modal
    elements.playerDetailModal.classList.add('active');
    elements.playerDetailModal.style.display = 'flex';
}

// Make functions global for onclick attributes
window.loadPlayerDetail = loadPlayerDetail;

// Team Stats Functions
async function loadTeamStats() {
    try {
        const teamStats = await apiCall('/team/stats');
        displayTeamStats(teamStats);
    } catch (error) {
        console.error('Error loading team stats:', error);
        showToast('Có lỗi xảy ra khi tải thống kê đội bóng', 'error');
    }
}

function displayTeamStats(stats) {
    if (!stats) {
        elements.teamStatsGrid.innerHTML = '<div class="match-empty-state"><i class="fas fa-chart-line"></i><h3>Chưa có thống kê</h3><p>Thống kê đội bóng sẽ được hiển thị ở đây</p></div>';
        return;
    }

    const foundedDate = new Date(stats.date_founded).toLocaleDateString('vi-VN');
    const latestMatch = stats.latest_match_time ?
        new Date(stats.latest_match_time).toLocaleDateString('vi-VN') : 'Chưa có';

    elements.teamStatsGrid.innerHTML = `
        <div class="team-stat-card">
            <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="stat-number">${foundedDate}</div>
            <div class="stat-label">Ngày Thành Lập</div>
        </div>
        <div class="team-stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-number">${stats.number_of_players || 0}</div>
            <div class="stat-label">Số Cầu Thủ</div>
        </div>
        <div class="team-stat-card">
            <div class="stat-icon"><i class="fas fa-futbol"></i></div>
            <div class="stat-number">${stats.total_goals || 0}</div>
            <div class="stat-label">Tổng Bàn Thắng</div>
        </div>
        <div class="team-stat-card">
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-number">${stats.total_matches || 0}</div>
            <div class="stat-label">Tổng Trận Đấu</div>
        </div>
        <div class="team-stat-card">
            <div class="stat-icon"><i class="fas fa-clock"></i></div>
            <div class="stat-number">${latestMatch}</div>
            <div class="stat-label">Trận Gần Nhất</div>
        </div>
    `;
}

function showTeamStatsModal() {
    elements.teamStatsModal.classList.add('active');
    elements.teamStatsModal.style.display = 'flex';

    // Load current stats into form
    loadTeamStats().then(() => {
        // This will be populated when we get the current stats
    });
}

async function handleTeamStatsSubmit(e) {
    e.preventDefault();

    const formData = {
        date_founded: document.getElementById('team-date-founded').value + 'T00:00:00Z',
        number_of_players: parseInt(document.getElementById('team-players-count').value),
        total_goals: parseInt(document.getElementById('team-total-goals').value),
        total_matches: parseInt(document.getElementById('team-total-matches').value),
        latest_match_time: document.getElementById('team-latest-match').value ?
            new Date(document.getElementById('team-latest-match').value).toISOString() : null
    };

    try {
        showLoading(true);

        // Try to update existing stats first
        try {
            await apiCall('/team/admin/stats', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showToast('Cập nhật thống kê đội bóng thành công!', 'success');
        } catch (error) {
            // If update fails, try to create new stats
            if (error.message.includes('404')) {
                await apiCall('/team/admin/stats', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
                showToast('Tạo thống kê đội bóng thành công!', 'success');
            } else {
                throw error;
            }
        }

        closeAllModals();
        loadTeamStats();
    } catch (error) {
        console.error('Error saving team stats:', error);
        showToast('Có lỗi xảy ra khi lưu thống kê đội bóng', 'error');
    } finally {
        showLoading(false);
    }
}

// Match History Functions
async function loadMatches(page = 1, limit = 10) {
    try {
        showLoading(true);
        currentMatchPage = page;

        let url = `/team/matches?page=${page}&limit=${limit}&sort_by=match_datetime&sort_order=desc`;

        if (currentMatchFilter) {
            const isWin = currentMatchFilter === 'win';
            url += `&is_win=${isWin}`;
        }

        const response = await apiCall(url);
        displayMatches(response.matches || []);
        updateMatchPagination(response.pagination);
    } catch (error) {
        console.error('Error loading matches:', error);
        showToast('Có lỗi xảy ra khi tải danh sách trận đấu', 'error');
        displayMatches([]);
    } finally {
        showLoading(false);
    }
}

function displayMatches(matches) {
    if (!matches || matches.length === 0) {
        elements.matchTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="match-empty-state">
                    <i class="fas fa-futbol"></i>
                    <h3>Chưa có trận đấu nào</h3>
                    <p>Lịch sử trận đấu sẽ được hiển thị ở đây</p>
                </td>
            </tr>
        `;
        return;
    }

    elements.matchTableBody.innerHTML = matches.map(match => {
        const matchDate = new Date(match.match_datetime).toLocaleDateString('vi-VN');
        const matchTime = new Date(match.match_datetime).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let resultClass = '';
        let resultText = '';
        if (match.our_score > match.opponent_score) {
            resultClass = 'win';
            resultText = 'Thắng';
        } else if (match.our_score < match.opponent_score) {
            resultClass = 'loss';
            resultText = 'Thua';
        } else {
            resultClass = 'draw';
            resultText = 'Hòa';
        }

        return `
            <tr>
                <td class="match-date">
                    <div>${matchDate}</div>
                    <div style="font-size: 0.8em; color: #666;">${matchTime}</div>
                </td>
                <td class="match-opponent">${match.opponent_name}</td>
                <td class="match-score">${match.our_score} - ${match.opponent_score}</td>
                <td class="match-result ${resultClass}">${resultText}</td>
                <td class="match-description" title="${match.description || ''}">${match.description || '-'}</td>
                ${currentUser ? `
                    <td class="match-actions">
                        <button class="btn btn-primary btn-sm" onclick="viewMatchDetail('${match.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="editMatch('${match.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteMatch('${match.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                ` : `
                    <td class="match-actions">
                        <button class="btn btn-primary btn-sm" onclick="viewMatchDetail('${match.id}')">
                            <i class="fas fa-eye"></i> Xem Chi Tiết
                        </button>
                    </td>
                `}
            </tr>
        `;
    }).join('');
}

function updateMatchPagination(pagination) {
    if (!pagination) return;

    const { page, total_pages, has_next, has_prev } = pagination;

    elements.matchPagination.innerHTML = `
        <div class="pagination-info">
            Trang ${page} / ${total_pages}
        </div>
        <div class="pagination-controls">
            <button class="btn btn-outline" ${!has_prev ? 'disabled' : ''} 
                    onclick="loadMatches(${page - 1})">
                <i class="fas fa-chevron-left"></i> Trước
            </button>
            <button class="btn btn-outline" ${!has_next ? 'disabled' : ''} 
                    onclick="loadMatches(${page + 1})">
                Sau <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}

function showMatchModal(match = null) {
    editingMatchId = match ? match.id : null;

    const modal = elements.matchModal;
    const title = document.getElementById('match-modal-title');
    const form = elements.matchForm;

    if (match) {
        title.textContent = 'Sửa Trận Đấu';

        document.getElementById('match-opponent').value = match.opponent_name || '';
        document.getElementById('match-datetime').value = match.match_datetime ?
            new Date(match.match_datetime).toISOString().slice(0, 16) : '';
        document.getElementById('match-our-score').value = match.our_score || 0;
        document.getElementById('match-opponent-score').value = match.opponent_score || 0;
        document.getElementById('match-description').value = match.description || '';
    } else {
        title.textContent = 'Thêm Trận Đấu';
        form.reset();
    }

    modal.classList.add('active');
    modal.style.display = 'flex';
}

async function handleMatchSubmit(e) {
    e.preventDefault();

    const formData = {
        opponent_name: document.getElementById('match-opponent').value,
        match_datetime: new Date(document.getElementById('match-datetime').value).toISOString(),
        our_score: parseInt(document.getElementById('match-our-score').value),
        opponent_score: parseInt(document.getElementById('match-opponent-score').value),
        description: document.getElementById('match-description').value,
        is_win: parseInt(document.getElementById('match-our-score').value) > parseInt(document.getElementById('match-opponent-score').value)
    };

    try {
        showLoading(true);

        if (editingMatchId) {
            await apiCall(`/team/admin/matches/${editingMatchId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showToast('Cập nhật trận đấu thành công!', 'success');
        } else {
            await apiCall('/team/admin/matches', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Thêm trận đấu thành công!', 'success');
        }

        closeAllModals();
        loadMatches(currentMatchPage);
        loadTeamStats(); // Refresh team stats as they auto-update
    } catch (error) {
        console.error('Error saving match:', error);
        showToast('Có lỗi xảy ra khi lưu trận đấu', 'error');
    } finally {
        showLoading(false);
    }
}

async function editMatch(matchId) {
    try {
        const match = await apiCall(`/team/matches/${matchId}`);
        showMatchModal(match);
    } catch (error) {
        console.error('Error loading match:', error);
        showToast('Có lỗi xảy ra khi tải thông tin trận đấu', 'error');
    }
}

async function deleteMatch(matchId) {
    if (!confirm('Bạn có chắc chắn muốn xóa trận đấu này?')) return;

    try {
        showLoading(true);
        await apiCall(`/team/admin/matches/${matchId}`, {
            method: 'DELETE'
        });
        showToast('Xóa trận đấu thành công!', 'success');
        loadMatches(currentMatchPage);
        loadTeamStats(); // Refresh team stats as they auto-update
    } catch (error) {
        console.error('Error deleting match:', error);
        showToast('Có lỗi xảy ra khi xóa trận đấu', 'error');
    } finally {
        showLoading(false);
    }
}

function filterMatches() {
    const searchTerm = elements.matchSearch.value.toLowerCase();
    const filterValue = elements.matchFilter.value;

    currentMatchSearch = searchTerm;
    currentMatchFilter = filterValue;

    // Reload matches with new filter
    loadMatches(1);
}

// Match Detail Functions
async function viewMatchDetail(matchId) {
    try {
        showLoading(true);
        const match = await apiCall(`/team/matches/${matchId}`);
        showMatchDetailModal(match);
    } catch (error) {
        console.error('Error loading match detail:', error);
        showToast('Có lỗi xảy ra khi tải thông tin trận đấu', 'error');
    } finally {
        showLoading(false);
    }
}

function showMatchDetailModal(match) {
    // Update modal content with match data
    document.getElementById('match-detail-our-score').textContent = match.our_score;
    document.getElementById('match-detail-opponent').textContent = match.opponent_name;
    document.getElementById('match-detail-opponent-score').textContent = match.opponent_score;

    // Format match date and time
    const matchDate = new Date(match.match_datetime);
    document.getElementById('match-detail-date').textContent = matchDate.toLocaleDateString('vi-VN');
    document.getElementById('match-detail-time').textContent = matchDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Determine result
    let resultClass = '';
    let resultText = '';
    if (match.our_score > match.opponent_score) {
        resultClass = 'win';
        resultText = 'Thắng';
    } else if (match.our_score < match.opponent_score) {
        resultClass = 'loss';
        resultText = 'Thua';
    } else {
        resultClass = 'draw';
        resultText = 'Hòa';
    }

    // Update result elements
    const resultElement = document.getElementById('match-detail-result-text');
    resultElement.textContent = resultText;
    resultElement.className = `match-result-badge ${resultClass}`;

    document.getElementById('match-detail-result-detail').textContent = `${match.our_score} - ${match.opponent_score}`;

    // Update status (assuming all matches are active)
    const statusElement = document.getElementById('match-detail-status');
    statusElement.textContent = 'Hoàn thành';
    statusElement.className = 'status-badge active';

    // Update description
    const descriptionElement = document.getElementById('match-detail-description');
    if (match.description && match.description.trim()) {
        descriptionElement.textContent = match.description;
    } else {
        descriptionElement.textContent = 'Không có mô tả chi tiết về trận đấu này.';
        descriptionElement.style.fontStyle = 'italic';
        descriptionElement.style.color = 'var(--gray-500)';
    }

    // Show modal
    document.getElementById('match-detail-modal').classList.add('active');
    document.getElementById('match-detail-modal').style.display = 'flex';
}

// Post Detail Functions
async function viewPostDetail(postId) {
    try {
        showLoading(true);
        const post = await apiCall(`/team/posts/${postId}`);
        showPostDetailModal(post);
    } catch (error) {
        console.error('Error loading post detail:', error);
        showToast('Có lỗi xảy ra khi tải bài viết', 'error');
    } finally {
        showLoading(false);
    }
}

function showPostDetailModal(post) {
    // Update modal content with post data
    document.getElementById('post-detail-title').textContent = post.title;
    document.getElementById('post-detail-author').textContent = post.author;

    // Format post date
    const postDate = new Date(post.published_at || post.created_at);
    document.getElementById('post-detail-date').textContent = postDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Update featured image
    const featuredImageContainer = document.getElementById('post-detail-featured-image');
    if (post.images && post.images[0]) {
        featuredImageContainer.innerHTML = `<img src="${post.images[0]}" alt="${post.title}" style="width: 100%; height: 400px; object-fit: cover;">`;
    } else {
        featuredImageContainer.innerHTML = `
            <div style="width: 100%; height: 400px; background: linear-gradient(135deg, #1e3a8a, #1e40af); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                <i class="fas fa-newspaper"></i>
            </div>
        `;
    }

    // Update post content
    const contentElement = document.getElementById('post-detail-content');
    contentElement.innerHTML = post.content;

    // Update additional images gallery
    const galleryContainer = document.getElementById('post-detail-gallery');
    if (post.images && post.images.length > 1) {
        const additionalImages = post.images.slice(1);
        galleryContainer.innerHTML = additionalImages.map(image =>
            `<img src="${image}" alt="Hình ảnh bài viết" onclick="openImageModal('${image}')">`
        ).join('');
    } else {
        galleryContainer.innerHTML = '';
    }

    // Show modal
    document.getElementById('post-detail-modal').classList.add('active');
    document.getElementById('post-detail-modal').style.display = 'flex';
}

// Make functions global for onclick attributes
window.editMatch = editMatch;
window.deleteMatch = deleteMatch;
window.viewMatchDetail = viewMatchDetail;
window.viewPostDetail = viewPostDetail;