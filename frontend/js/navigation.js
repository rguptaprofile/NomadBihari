/* ===== Navigation JavaScript ===== */

document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

function initializeNavigation() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle menu on hamburger click
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && menuToggle) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                closeMenu();
            }
        }
    });

    // Handle scroll for navbar changes
    window.addEventListener('scroll', handleNavbarScroll);

    // Set active link based on current section
    updateActiveLink();
}

function toggleMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
}

function closeMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
    }
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
    }
}

function updateActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentUrl = window.location.pathname;

    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Check if link href matches current URL
        if (link.getAttribute('href') === currentUrl || 
            (currentUrl === '/' && link.getAttribute('href') === '#home')) {
            link.classList.add('active');
        }
    });

    // For hash-based navigation
    if (window.location.hash) {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === window.location.hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Update active link on hash change
window.addEventListener('hashchange', updateActiveLink);

// ===== Dashboard Navigation =====
function initializeDashboardNavigation() {
    const dashboardMenu = document.querySelectorAll('.sidebar-menu a');

    dashboardMenu.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            dashboardMenu.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');

            // Load the corresponding content
            const page = this.getAttribute('data-page');
            if (page) {
                loadDashboardPage(page);
            }
        });
    });

    // Load home page by default
    const homeLink = document.querySelector('[data-page="home"]');
    if (homeLink) {
        homeLink.click();
    }
}

async function loadDashboardPage(page) {
    const contentArea = document.getElementById('dashboardMain');
    if (!contentArea) return;

    try {
        // Show loading spinner
        contentArea.innerHTML = '<div class="spinner"></div>';

        // Fetch page content (you would implement this based on your structure)
        switch(page) {
            case 'home':
                loadHomePage();
                break;
            case 'profile':
                loadProfilePage();
                break;
            case 'posts':
                loadPostsPage();
                break;
            case 'analytics':
                loadAnalyticsPage();
                break;
            case 'settings':
                loadSettingsPage();
                break;
            default:
                contentArea.innerHTML = '<p>Page not found.</p>';
        }
    } catch (error) {
        console.error('Error loading page:', error);
        contentArea.innerHTML = '<p>Error loading page. Please try again.</p>';
    }
}

function loadHomePage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Home</h2>
        <div class="feed" id="feed"></div>
    `;
    loadFeed();
}

function loadProfilePage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>My Profile</h2>
        <div id="profileContent"></div>
    `;
    loadUserProfile();
}

function loadPostsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>My Blog/Articles</h2>
        <button class="btn-primary" onclick="openCreatePostModal()">+ Create New Post</button>
        <div id="myPosts" class="feed" style="margin-top: 30px;"></div>
    `;
    loadUserPosts();
}

function loadAnalyticsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Analytics</h2>
        <div id="analyticsContent"></div>
    `;
    loadAnalytics();
}

function loadSettingsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Settings</h2>
        <div id="settingsContent"></div>
    `;
    loadSettings();
}

// Load feed posts
async function loadFeed() {
    const feedContainer = document.getElementById('feed');
    if (!feedContainer) return;

    try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/posts/feed`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const posts = await response.json();

        if (posts.length === 0) {
            feedContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No posts available. Follow users to see their posts!</p>';
            return;
        }

        feedContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
        attachPostEventListeners();
    } catch (error) {
        console.error('Error loading feed:', error);
        feedContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading posts.</p>';
    }
}

// Create post card HTML
function createPostCard(post) {
    const isLiked = post.isLikedByUser ? 'liked' : '';
    
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <div class="post-author">
                    <div class="post-author-avatar">${post.authorName.charAt(0).toUpperCase()}</div>
                    <div class="post-author-info">
                        <div class="post-author-name">${post.authorName}</div>
                        <div class="post-author-time">${formatTimeAgo(post.createdAt)}</div>
                    </div>
                </div>
            </div>
            ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="post-image">` : ''}
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-description">${post.description}</p>
            </div>
            <div class="post-actions">
                <div class="post-action like-btn ${isLiked}" data-post-id="${post.id}" onclick="toggleLike(${post.id})">
                    ❤️ ${post.likesCount}
                </div>
                <div class="post-action comment-btn" onclick="toggleComments(${post.id})">
                    💬 ${post.commentsCount}
                </div>
                <div class="post-action share-btn" onclick="sharePost(${post.id})">
                    📤 ${post.sharesCount}
                </div>
            </div>
            <div id="comments-${post.id}" class="comments-section" style="display: none;"></div>
        </div>
    `;
}

// Toggle like button
async function toggleLike(postId) {
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = '/pages/signin.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const likeBtn = document.querySelector(`[data-post-id="${postId}"].like-btn`);
            if (likeBtn) {
                likeBtn.classList.toggle('liked');
                // Update count
                loadFeed();
            }
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// Toggle comments section
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        if (commentsSection.style.display === 'none') {
            commentsSection.style.display = 'block';
            loadComments(postId);
        } else {
            commentsSection.style.display = 'none';
        }
    }
}

// Load comments
async function loadComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (!commentsSection) return;

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
        const comments = await response.json();

        let commentsHTML = '';
        if (comments.length === 0) {
            commentsHTML = '<p style="text-align: center; color: #999;">No comments yet. Be the first to comment!</p>';
        } else {
            commentsHTML = comments.map(comment => `
                <div class="comment">
                    <div class="comment-author">${comment.authorName}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-time">${formatTimeAgo(comment.createdAt)}</div>
                </div>
            `).join('');
        }

        const token = localStorage.getItem('userToken');
        if (token) {
            commentsHTML += `
                <div class="comment-form">
                    <input type="text" id="comment-input-${postId}" placeholder="Add a comment..." class="comment-input" data-post-id="${postId}">
                    <button onclick="submitComment(${postId})">Post</button>
                </div>
            `;
        }

        commentsSection.innerHTML = commentsHTML;
    } catch (error) {
        console.error('Error loading comments:', error);
        commentsSection.innerHTML = '<p>Error loading comments.</p>';
    }
}

// Submit comment
async function submitComment(postId) {
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = '/pages/signin.html';
        return;
    }

    const commentInput = document.getElementById(`comment-input-${postId}`);
    const text = commentInput.value.trim();

    if (!text) {
        alert('Please enter a comment');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            commentInput.value = '';
            loadComments(postId);
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

// Share post
async function sharePost(postId) {
    const shareUrl = `${window.location.origin}/pages/post.html?id=${postId}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Check out this post!',
                url: shareUrl
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('Link copied to clipboard!');
        });
    }
}

// Attach post event listeners
function attachPostEventListeners() {
    // This is called after posts are rendered
}

// Load user profile
async function loadUserProfile() {
    const profileContent = document.getElementById('profileContent');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const user = await response.json();
        
        profileContent.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3>${user.firstName} ${user.lastName}</h3>
                <p>Email: ${user.email}</p>
                <p>Phone: ${user.phone}</p>
                <p>Date of Birth: ${formatDate(user.dob)}</p>
                <p>Bio: ${user.bio || 'No bio added yet'}</p>
                <button class="btn-primary" onclick="openEditProfileModal()">Edit Profile</button>
            </div>
        `;
    } catch (error) {
        console.error('Error loading profile:', error);
        profileContent.innerHTML = '<p>Error loading profile.</p>';
    }
}

// Load user posts
async function loadUserPosts() {
    const postContainer = document.getElementById('myPosts');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const posts = await response.json();

        if (posts.length === 0) {
            postContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">You haven\'t created any posts yet. Create one now!</p>';
            return;
        }

        postContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
        postContainer.innerHTML = '<p>Error loading posts.</p>';
    }
}

// Load analytics
async function loadAnalytics() {
    const analyticsContent = document.getElementById('analyticsContent');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}/analytics`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const analytics = await response.json();

        analyticsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Total Views</h3>
                    <p style="font-size: 24px; color: #FF6B35;">${analytics.totalViews}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Total Likes</h3>
                    <p style="font-size: 24px; color: #FF6B35;">${analytics.totalLikes}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Total Comments</h3>
                    <p style="font-size: 24px; color: #FF6B35;">${analytics.totalComments}</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3>Total Shares</h3>
                    <p style="font-size: 24px; color: #FF6B35;">${analytics.totalShares}</p>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading analytics:', error);
        analyticsContent.innerHTML = '<p>Error loading analytics.</p>';
    }
}

// Load settings
async function loadSettings() {
    const settingsContent = document.getElementById('settingsContent');

    settingsContent.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Account Settings</h3>
            <div style="margin-bottom: 20px;">
                <label>
                    <input type="checkbox" id="emailNotifications" checked>
                    Receive email notifications
                </label>
            </div>
            <div style="margin-bottom: 20px;">
                <label>
                    <input type="checkbox" id="pushNotifications" checked>
                    Receive push notifications
                </label>
            </div>
            <div>
                <button class="btn-primary" onclick="logout()">Logout</button>
                <button class="btn-secondary" onclick="deleteAccount()" style="margin-left: 10px;">Delete Account</button>
            </div>
        </div>
    `;
}

// Open create post modal
function openCreatePostModal() {
    alert('Create post modal will open here');
    // This would open a modal for creating new posts
}

// Open edit profile modal
function openEditProfileModal() {
    alert('Edit profile modal will open here');
    // This would open a modal for editing profile
}

// Delete account
async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Account deleted successfully');
            logout();
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account');
    }
}
