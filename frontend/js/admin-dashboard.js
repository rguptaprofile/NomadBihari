/* ===== Admin Dashboard JavaScript ===== */

document.addEventListener('DOMContentLoaded', function() {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
        window.location.href = 'pages/signin.html';
        return;
    }

    initializeAdminDashboard();
});

function initializeAdminDashboard() {
    loadAdminData();
    initializeSidebarMenu();
    loadDashboardPage('home');
}

function loadAdminData() {
    const adminName = localStorage.getItem('adminName') || 'Admin';
    document.getElementById('adminName').textContent = adminName;
}

function initializeSidebarMenu() {
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a[data-page]');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            const page = this.getAttribute('data-page');
            loadDashboardPage(page);
        });
    });

    document.querySelector('[data-page="home"]')?.classList.add('active');
}

function loadDashboardPage(page) {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = '<div class="spinner"></div>';

    switch(page) {
        case 'home':
            loadAdminHomePage();
            break;
        case 'users':
            loadUsersPage();
            break;
        case 'posts':
            loadPostsManagementPage();
            break;
        case 'analytics':
            loadAnalyticsPage();
            break;
        case 'earnings':
            loadEarningsPage();
            break;
        case 'contact':
            loadContactQueriesPage();
            break;
        case 'admin-profile':
            loadAdminProfilePage();
            break;
        case 'settings':
            loadAdminSettingsPage();
            break;
        default:
            contentArea.innerHTML = '<p>Page not found.</p>';
    }
}

// ===== HOME PAGE =====
function loadAdminHomePage() {
    const contentArea = document.getElementById('dashboardMain');
    const token = localStorage.getItem('adminToken');

    contentArea.innerHTML = '<h2>Dashboard Overview</h2><div class="spinner"></div>';

    fetch(`${API_BASE_URL}/admin/dashboard/overview`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        contentArea.innerHTML = `
            <h2>Dashboard Overview</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #FF6B35, #FF8555); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Users</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalUsers || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #004E89, #2E7BA0); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Posts</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalPosts || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #F7931E, #FBAA2C); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Engagement</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalEngagement || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #6B5B95, #8B7BA8); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Revenue</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">₹${data.totalRevenue || 0}</p>
                </div>
            </div>

            <h3>Recent Activity</h3>
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                ${data.recentActivity && data.recentActivity.length > 0 ? `
                    <ul style="list-style: none; padding: 0;">
                        ${data.recentActivity.map(activity => `
                            <li style="padding: 10px; border-bottom: 1px solid #ddd;">
                                ${activity.description} - <small>${formatTimeAgo(activity.timestamp)}</small>
                            </li>
                        `).join('')}
                    </ul>
                ` : '<p>No recent activity</p>'}
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading dashboard:', error);
        contentArea.innerHTML = '<p>Error loading dashboard.</p>';
    });
}

// ===== USERS PAGE =====
function loadUsersPage() {
    const contentArea = document.getElementById('dashboardMain');
    const token = localStorage.getItem('adminToken');

    contentArea.innerHTML = `
        <h2>User Management</h2>
        <div style="margin-bottom: 20px;">
            <input type="text" id="userSearch" placeholder="Search by name, email, or user ID" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
        <div id="usersContent"><div class="spinner"></div></div>
    `;

    loadUsers();

    document.getElementById('userSearch')?.addEventListener('input', debounce(loadUsers, 300));
}

function loadUsers() {
    const token = localStorage.getItem('adminToken');
    const searchQuery = document.getElementById('userSearch')?.value || '';
    const usersContent = document.getElementById('usersContent');

    fetch(`${API_BASE_URL}/admin/users?search=${encodeURIComponent(searchQuery)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(users => {
        if (users.length === 0) {
            usersContent.innerHTML = '<p>No users found.</p>';
            return;
        }

        usersContent.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <thead style="background: var(--secondary-color); color: white;">
                    <tr>
                        <th style="padding: 15px; text-align: left;">User ID</th>
                        <th style="padding: 15px; text-align: left;">Name</th>
                        <th style="padding: 15px; text-align: left;">Email</th>
                        <th style="padding: 15px; text-align: left;">Posts</th>
                        <th style="padding: 15px; text-align: left;">Joined</th>
                        <th style="padding: 15px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 15px;">${user.userId}</td>
                            <td style="padding: 15px;">${user.firstName} ${user.lastName}</td>
                            <td style="padding: 15px;">${user.email}</td>
                            <td style="padding: 15px;">${user.postCount || 0}</td>
                            <td style="padding: 15px;">${formatDate(user.createdAt)}</td>
                            <td style="padding: 15px; text-align: center;">
                                <button onclick="viewUserDetails(${user.id})" class="btn-primary" style="padding: 5px 10px; font-size: 12px;">View</button>
                                <button onclick="banUser(${user.id})" class="btn-secondary" style="padding: 5px 10px; font-size: 12px; margin-left: 5px;">Ban</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(error => {
        console.error('Error loading users:', error);
        usersContent.innerHTML = '<p>Error loading users.</p>';
    });
}

function viewUserDetails(userId) {
    alert('User details for ID: ' + userId);
    // Implementation for viewing detailed user information
}

function banUser(userId) {
    if (confirm('Are you sure you want to ban this user?')) {
        alert('User banned successfully');
        loadUsers();
    }
}

// ===== POSTS MANAGEMENT PAGE =====
function loadPostsManagementPage() {
    const contentArea = document.getElementById('dashboardMain');
    const token = localStorage.getItem('adminToken');

    contentArea.innerHTML = `
        <h2>Posts Management</h2>
        <div style="margin-bottom: 20px;">
            <input type="text" id="postSearch" placeholder="Search posts by title or author" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
        <div id="postsContent"><div class="spinner"></div></div>
    `;

    loadAdminPosts();

    document.getElementById('postSearch')?.addEventListener('input', debounce(loadAdminPosts, 300));
}

function loadAdminPosts() {
    const token = localStorage.getItem('adminToken');
    const searchQuery = document.getElementById('postSearch')?.value || '';
    const postsContent = document.getElementById('postsContent');

    fetch(`${API_BASE_URL}/admin/posts?search=${encodeURIComponent(searchQuery)}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(posts => {
        if (posts.length === 0) {
            postsContent.innerHTML = '<p>No posts found.</p>';
            return;
        }

        postsContent.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <thead style="background: var(--secondary-color); color: white;">
                    <tr>
                        <th style="padding: 15px; text-align: left;">Title</th>
                        <th style="padding: 15px; text-align: left;">Author</th>
                        <th style="padding: 15px; text-align: left;">Visibility</th>
                        <th style="padding: 15px; text-align: left;">Views</th>
                        <th style="padding: 15px; text-align: left;">Created</th>
                        <th style="padding: 15px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 15px;">${post.title}</td>
                            <td style="padding: 15px;">${post.authorName}</td>
                            <td style="padding: 15px;"><span style="background: ${post.visibility === 'public' ? '#d4edda' : '#e2e3e5'}; padding: 5px 10px; border-radius: 5px;">${post.visibility}</span></td>
                            <td style="padding: 15px;">${post.viewCount || 0}</td>
                            <td style="padding: 15px;">${formatDate(post.createdAt)}</td>
                            <td style="padding: 15px; text-align: center;">
                                <button onclick="deletePost(${post.id})" class="btn-secondary" style="padding: 5px 10px; font-size: 12px;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    })
    .catch(error => {
        console.error('Error loading posts:', error);
        postsContent.innerHTML = '<p>Error loading posts.</p>';
    });
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        alert('Post deleted successfully');
        loadAdminPosts();
    }
}

// ===== ANALYTICS PAGE =====
function loadAnalyticsPage() {
    const contentArea = document.getElementById('dashboardMain');
    const token = localStorage.getItem('adminToken');

    contentArea.innerHTML = `
        <h2>Website Analytics</h2>
        <div class="spinner"></div>
    `;

    fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        contentArea.innerHTML = `
            <h2>Website Analytics</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #FF6B35, #FF8555); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Views</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalViews || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #004E89, #2E7BA0); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Likes</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalLikes || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #F7931E, #FBAA2C); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Comments</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalComments || 0}</p>
                </div>
                <div style="background: linear-gradient(135deg, #6B5B95, #8B7BA8); color: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="margin: 0; opacity: 0.9;">Total Shares</p>
                    <p style="margin: 10px 0 0 0; font-size: 28px; font-weight: bold;">${data.totalShares || 0}</p>
                </div>
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading analytics:', error);
        contentArea.innerHTML = '<p>Error loading analytics.</p>';
    });
}

// ===== EARNINGS PAGE =====
function loadEarningsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Ad Revenue & Earnings</h2>
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Total Website Earnings</h3>
            <p style="font-size: 28px; color: var(--primary-color); font-weight: bold;">₹0.00</p>
            <div style="margin-top: 30px;">
                <h4>Ad Revenue Sources</h4>
                <ul>
                    <li>Display Ads: ₹0.00</li>
                    <li>Sponsored Content: ₹0.00</li>
                    <li>Affiliate Revenue: ₹0.00</li>
                </ul>
            </div>
        </div>
    `;
}

// ===== CONTACT QUERIES PAGE =====
function loadContactQueriesPage() {
    const contentArea = document.getElementById('dashboardMain');
    const token = localStorage.getItem('adminToken');

    contentArea.innerHTML = '<h2>Contact Queries</h2><div class="spinner"></div>';

    fetch(`${API_BASE_URL}/admin/contact-queries`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(queries => {
        if (queries.length === 0) {
            contentArea.innerHTML = '<h2>Contact Queries</h2><p>No contact queries yet.</p>';
            return;
        }

        contentArea.innerHTML = `
            <h2>Contact Queries</h2>
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px;">
                ${queries.map(query => `
                    <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h3>${query.subject}</h3>
                        <p><strong>From:</strong> ${query.name} (${query.email})</p>
                        <p><strong>Phone:</strong> ${query.phone || 'N/A'}</p>
                        <p><strong>Status:</strong> <span style="background: ${query.status === 'new' ? '#d4edda' : '#fff3cd'}; padding: 5px 10px; border-radius: 5px;">${query.status}</span></p>
                        <p><strong>Message:</strong></p>
                        <p>${query.message}</p>
                        <button onclick="replyToQuery(${query.id})" class="btn-primary" style="padding: 8px 15px; font-size: 12px;">Reply</button>
                    </div>
                `).join('')}
            </div>
        `;
    })
    .catch(error => {
        console.error('Error loading contact queries:', error);
        contentArea.innerHTML = '<p>Error loading contact queries.</p>';
    });
}

function replyToQuery(queryId) {
    const reply = prompt('Enter your reply:');
    if (reply) {
        alert('Reply sent successfully');
        loadContactQueriesPage();
    }
}

// ===== ADMIN PROFILE PAGE =====
function loadAdminProfilePage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Admin Profile</h2>
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Nomad Bihari Administrator</h3>
            <p><strong>Email:</strong> admin@nomadbihari.com</p>
            <p><strong>Role:</strong> Platform Administrator</p>
            <p><strong>Permissions:</strong> Full Access</p>
            <button class="btn-primary" onclick="editAdminProfile()">Edit Profile</button>
        </div>
    `;
}

function editAdminProfile() {
    alert('Edit admin profile functionality');
}

// ===== SETTINGS PAGE =====
function loadAdminSettingsPage() {
    const contentArea = document.getElementById('dashboardMain');
    contentArea.innerHTML = `
        <h2>Website Settings</h2>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3>General Settings</h3>
            <div class="form-group">
                <label>Website Title</label>
                <input type="text" value="Nomad Bihari" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
            </div>
            <div class="form-group">
                <label>Website Description</label>
                <textarea style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px;">A platform for travelers to share experiences</textarea>
            </div>
            <button class="btn-primary" onclick="saveGeneralSettings()">Save General Settings</button>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
            <h3>Security Settings</h3>
            <button class="btn-secondary" onclick="changeAdminPassword()">Change Admin Password</button>
            <button class="btn-secondary" onclick="manageTwoFactor()" style="margin-left: 10px;">Manage Two-Factor Authentication</button>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Moderation Settings</h3>
            <div style="margin-bottom: 15px;">
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" checked>
                    <span>Auto-moderate inappropriate content</span>
                </label>
            </div>
            <button class="btn-primary" onclick="saveModerationSettings()">Save Moderation Settings</button>
        </div>
    `;
}

function saveGeneralSettings() {
    showNotification('General settings saved!');
}

function changeAdminPassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword) {
        showNotification('Admin password changed!');
    }
}

function manageTwoFactor() {
    alert('Two-factor authentication management');
}

function saveModerationSettings() {
    showNotification('Moderation settings saved!');
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}
