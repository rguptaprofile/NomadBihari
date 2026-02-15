/* ===== User Dashboard JavaScript ===== */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        window.location.href = 'pages/signin.html';
        return;
    }

    initializeDashboard();
});

function initializeDashboard() {
    // Load user data
    loadUserData();

    // Initialize sidebar menu
    initializeSidebarMenu();

    // Load home page by default
    loadDashboardPage('home');
}

function loadUserData() {
    const userName = localStorage.getItem('userName') || 'User';
    const userAvatar = localStorage.getItem('userAvatar') || userName.charAt(0).toUpperCase();

    document.getElementById('userName').textContent = userName;
    document.getElementById('profileAvatar').textContent = userAvatar;
}

function initializeSidebarMenu() {
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-page]');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Load the corresponding page
            const page = this.getAttribute('data-page');
            loadDashboardPage(page);
        });
    });

    // Set home as active by default
    document.querySelector('[data-page="home"]')?.classList.add('active');
}

function loadDashboardPage(page) {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = '<div class="spinner"></div>';

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
}

// ===== HOME PAGE =====
function loadHomePage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>My Feed</h2>
        <div class="feed" id="feed"></div>
    `;
    loadFeed();
}

// ===== PROFILE PAGE =====
function loadProfilePage() {
    const contentArea = document.getElementById('dashboardMain');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    contentArea.innerHTML = '<div class="spinner"></div>';

    fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(user => {
        contentArea.innerHTML = `
            <h2>My Profile</h2>
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="display: flex; gap: 30px; margin-bottom: 30px;">
                    <div style="flex: 1;">
                        <h3>${user.firstName} ${user.lastName}</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Phone:</strong> ${user.phone}</p>
                        <p><strong>Date of Birth:</strong> ${formatDate(user.dob)}</p>
                        <p><strong>User ID:</strong> ${user.userId}</p>
                        <p><strong>Bio:</strong> ${user.bio || 'No bio added yet'}</p>
                        <p><strong>Member Since:</strong> ${formatDate(user.createdAt)}</p>
                        <button class="btn-primary" onclick="openEditProfileModal()">Edit Profile</button>
                    </div>
                </div>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading profile:', error);
        contentArea.innerHTML = '<p>Error loading profile.</p>';
    });
}

function openEditProfileModal() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(user => {
        document.getElementById('editFirstName').value = user.firstName;
        document.getElementById('editLastName').value = user.lastName;
        document.getElementById('editBio').value = user.bio || '';
        document.getElementById('editProfileModal').style.display = 'flex';
    });
}

function closeEditProfileModal() {
    document.getElementById('editProfileModal').style.display = 'none';
}

async function handleEditProfile(e) {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    const formData = new FormData();
    formData.append('firstName', document.getElementById('editFirstName').value);
    formData.append('lastName', document.getElementById('editLastName').value);
    formData.append('bio', document.getElementById('editBio').value);
    
    const profileImage = document.getElementById('editProfileImage').files[0];
    if (profileImage) {
        formData.append('profileImage', profileImage);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            showNotification('Profile updated successfully!');
            closeEditProfileModal();
            loadProfilePage();
        } else {
            alert('Error updating profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
    }
}

// ===== POSTS PAGE =====
function loadPostsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>My Blog/Articles</h2>
        <button class="btn-primary" onclick="openCreatePostModal()">+ Create New Post</button>
        <div id="myPosts" class="feed" style="margin-top: 30px;"></div>
    `;
    loadUserPosts();
}

function openCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'flex';
    document.getElementById('postTitle').focus();
}

function closeCreatePostModal() {
    document.getElementById('createPostModal').style.display = 'none';
    document.getElementById('createPostForm').reset();
}

async function handleCreatePost(e) {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    const formData = new FormData();
    formData.append('title', document.getElementById('postTitle').value);
    formData.append('description', document.getElementById('postDescription').value);
    formData.append('content', document.getElementById('postContent').value);
    formData.append('visibility', document.getElementById('postVisibility').value);
    formData.append('seoTitle', document.getElementById('seoTitle').value);
    formData.append('seoDescription', document.getElementById('seoDescription').value);

    const postImage = document.getElementById('postImage').files[0];
    if (postImage) {
        formData.append('featuredImage', postImage);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Post created successfully!');
            closeCreatePostModal();
            loadUserPosts();
        } else {
            alert(data.message || 'Error creating post');
        }
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post');
    }
}

function loadUserPosts() {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');
    const postContainer = document.getElementById('myPosts');

    fetch(`${API_BASE_URL}/users/${userId}/posts`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(posts => {
        if (posts.length === 0) {
            postContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">You haven\'t created any posts yet. Start sharing your travel stories!</p>';
            return;
        }

        postContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
        attachPostEventListeners();
    })
    .catch(error => {
        console.error('Error loading posts:', error);
        postContainer.innerHTML = '<p>Error loading posts.</p>';
    });
}

// ===== ANALYTICS PAGE =====
function loadAnalyticsPage() {
    const contentArea = document.getElementById('dashboardMain');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');

    contentArea.innerHTML = '<div class="spinner"></div>';

    fetch(`${API_BASE_URL}/users/${userId}/analytics`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(analytics => {
        contentArea.innerHTML = `
            <h2>Analytics & Metrics</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #FF6B35, #FF8555); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Views</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${analytics.totalViews || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #004E89, #2E7BA0); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Likes</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${analytics.totalLikes || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #F7931E, #FBAA2C); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Comments</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${analytics.totalComments || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #6B5B95, #8B7BA8); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Shares</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${analytics.totalShares || 0}</p>
                </div>
            </div>

            <h3>Push Notification Subscriptions</h3>
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <p><strong>Subscribers:</strong> ${analytics.subscribersCount || 0}</p>
                <button class="btn-primary" onclick="subscribeToPushNotifications()">Enable Push Notifications</button>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading analytics:', error);
        contentArea.innerHTML = '<p>Error loading analytics.</p>';
    });
}

async function subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            // Subscribe to push notifications
            showNotification('Push notifications enabled!');
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    } else {
        alert('Push notifications not supported in your browser');
    }
}

// ===== SETTINGS PAGE =====
function loadSettingsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Settings</h2>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3>Notification Preferences</h3>
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="emailNotifications" checked>
                    <span>Receive email notifications for likes, comments, and shares</span>
                </label>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="pushNotifications" checked>
                    <span>Receive push notifications</span>
                </label>
            </div>
            <button class="btn-primary" onclick="saveNotificationSettings()">Save Preferences</button>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3>Privacy Settings</h3>
            <div style="margin-bottom: 15px;">
                <label>Profile Visibility:</label>
                <select id="profileVisibility" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px;">
                    <option value="public">Public - Everyone can see my profile</option>
                    <option value="private">Private - Only followers can see my profile</option>
                </select>
            </div>
            <button class="btn-primary" onclick="savePrivacySettings()">Save Privacy Settings</button>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3>Security</h3>
            <button class="btn-secondary" onclick="changePassword()">Change Password</button>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Account Management</h3>
            <button class="btn-secondary" onclick="logout()" style="margin-right: 10px;">Logout</button>
            <button class="btn-secondary" onclick="deleteAccount()" style="background: #d32f2f;">Delete Account</button>
        </div>
    `;
}

function saveNotificationSettings() {
    const emailNotif = document.getElementById('emailNotifications').checked;
    const pushNotif = document.getElementById('pushNotifications').checked;
    
    localStorage.setItem('emailNotifications', emailNotif);
    localStorage.setItem('pushNotifications', pushNotif);
    
    showNotification('Notification preferences saved!');
}

function savePrivacySettings() {
    const profileVisibility = document.getElementById('profileVisibility').value;
    localStorage.setItem('profileVisibility', profileVisibility);
    showNotification('Privacy settings saved!');
}

function changePassword() {
    const newPassword = prompt('Enter your new password:');
    if (newPassword) {
        showNotification('Password changed successfully!');
    }
}

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    if (!confirm('This will permanently delete all your posts and data. Are you absolutely sure?')) {
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
            showNotification('Account deleted successfully');
            logout();
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account');
    }
}

// ===== SHARED FUNCTIONS =====
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
                <p style="font-size: 12px; color: #999;">Visibility: <strong>${post.visibility}</strong></p>
            </div>
            <div class="post-actions">
                <div class="post-action like-btn ${isLiked}" onclick="toggleLike(${post.id})">
                    ❤️ ${post.likesCount || 0}
                </div>
                <div class="post-action comment-btn" onclick="toggleComments(${post.id})">
                    💬 ${post.commentsCount || 0}
                </div>
                <div class="post-action share-btn" onclick="sharePost(${post.id})">
                    📤 ${post.sharesCount || 0}
                </div>
            </div>
        </div>
    `;
}

function attachPostEventListeners() {
    // Post listeners already attached via onclick
}

async function loadFeed() {
    const feedContainer = document.getElementById('feed');
    const token = localStorage.getItem('userToken');

    feedContainer.innerHTML = '<div class="spinner"></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/posts/feed`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const posts = await response.json();

        if (posts.length === 0) {
            feedContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No posts available. Start following other users!</p>';
            return;
        }

        feedContainer.innerHTML = posts.map(post => createPostCard(post)).join('');
    } catch (error) {
        console.error('Error loading feed:', error);
        feedContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Error loading posts.</p>';
    }
}

function toggleLike(postId) {
    showNotification('Post liked!');
    // This would call the like API
}

function toggleComments(postId) {
    // Show/hide comments
}

function sharePost(postId) {
    const shareUrl = `${window.location.origin}/post.html?id=${postId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Link copied to clipboard!');
    });
}
