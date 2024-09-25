console.log("script.js loaded");
let isAdding = false;
document.addEventListener("DOMContentLoaded", function () {
    const departmentLink = document.querySelector('.sidebar a[href="department.html"]');

    // Get the username from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');

    // Check if the username is not "admin"
    if (username !== "admin") {
        // Hide the department link
        departmentLink.style.display = "none";
    }
});
document.addEventListener("DOMContentLoaded", function () {
    const viewUsersLink = document.getElementById("viewtableUsersLink");

    // Get the current URL
    const currentUrl = window.location.href;

    // Check if the current URL includes "user-list.html"
    if (currentUrl.includes("user-list.html")) {
        viewUsersLink.onclick = function (event) {
            event.preventDefault(); // Prevent the default anchor behavior
            window.location.href = currentUrl; // Redirect to the same page
        };
    }
});
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('sidebtn').addEventListener('click', function () {
        const sidebar = document.getElementById('sidebarid');
        if (getComputedStyle(sidebar).display === 'block') {
          sidebar.style.display = 'none';
        } else {
          sidebar.style.display = 'block';
        }
      });
      
});

function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = inputId === 'password' ? document.getElementById('eyeIconPassword') : document.getElementById('eyeIconConfirm');

    if (passwordInput.type === "password") {
        passwordInput.type = "text"; // Change to text to make it visible
        eyeIcon.classList.remove('fa-eye'); // Change icon to eye-slash
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = "password"; // Change back to password to obscure it
        eyeIcon.classList.remove('fa-eye-slash'); // Change icon back to eye
        eyeIcon.classList.add('fa-eye');
    }
}

function showToast(message, success = true) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: success 
            ? "#ffffff" // White for success
            : "#ff0000", // Red for error
        style: {
            color: "#000000", // Black text color
        },
    }).showToast();
}

function validateForm() {//1
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const email = document.getElementById('email_id').value;
    const phoneNo = document.getElementById('phone_no').value;
    const place = document.getElementById('place').value;
    const role = document.getElementById('role').value;
    const errorDiv = document.getElementById('error');

    errorDiv.innerHTML = '';

    // Basic field validation
    if (name === '' || username === '' || password === '' || email === '' || phoneNo === '' || place === '' || role === '') {
        errorDiv.innerHTML = 'All fields are required!';
        return false;
    }

    // Password validation
    if (password !== confirmPassword) {
        showToast('Passwords do not match.', false);
        return false;
    }
    
    if (password.length < 8) {
       showToast('Password must be at least 8 characters long.', false);
        return false;
    }

    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    if (!upperCase.test(password)) {
        showToast('Password must contain at least one uppercase letter.', false);
        return false;
    }

    if (!lowerCase.test(password)) {
        showToast('Password must contain at least one lowercase letter.', false);
        return false;
    }

    if (!number.test(password)) {
        showToast('Password must contain at least one number.', false);
        return false;
    }

    if (!specialChar.test(password)) {
        showToast('Password must contain at least one special character.', false);
        return false;
    }

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Basic email pattern
    if (!emailPattern.test(email)) {
        showToast('Invalid email address.', false);
        return false;
    }

    // Fetch request to send data to the backend
    fetch('http://localhost:3000/register', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            username: username,
            password: password,
            confirm_password: confirmPassword,
            email: email,
            phone: phoneNo,
            place: place,
            role: role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Registration successful!');
            document.getElementById('registerForm').reset(); // Reset form
            window.location.href = `home.html?username=${encodeURIComponent(username)}`;
        } else {
            showToast('Registration failed. Please try again.', false);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    return false; // Prevent default form submission
}//1


// Function to load users into the user list table
function loadUsers() {
    console.log("Loading users...");
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    fetch('http://localhost:3000/users')
        .then(response => response.json())
        .then(data => {
            const userTableBody = document.querySelector('#userTable tbody');
            userTableBody.innerHTML = ''; // Clear existing data

            if (data.users && Array.isArray(data.users)) {
                // Check if the user is an admin
                const isAdmin = (username === "admin");

                data.users.forEach(user => {
                    // For admins, show all users; for regular users, show only their details
                    if (isAdmin || user.username === username) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.phone}</td>
                            <td>${user.place}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="edit-button" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
                                <button class="delete-button" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        `;
                        userTableBody.appendChild(row);
                    }
                });
                
                $('#userTable').DataTable(); 
            } else {
                console.error('No users found or invalid response format');
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });
}


let currentUserId = null; // Store the current user ID for editing

// Function to open the modal with the user's details
function editUser(userId) {//3
    console.log('Editing user:', userId);
    currentUserId = userId; // Store the user ID
    fetch(`http://localhost:3000/users/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Populate the modal with the user details
                document.getElementById('edit_name').value = data.user.name;
                document.getElementById('edit_username').value = data.user.username;
                document.getElementById('edit_password').value = data.user.password; // Password remains empty for security
                document.getElementById('edit_email').value = data.user.email;
                document.getElementById('edit_phone').value = data.user.phone;
                document.getElementById('edit_place').value = data.user.place;

                // Display the modal
                document.getElementById('editUserModal').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error fetching user details:', error);
        });
}//3

// Function to close the modal
function closeModal() {//4
    document.getElementById('editUserModal').style.display = 'none';
    // Clear the modal fields
    document.getElementById('edit_name').value = '';
    document.getElementById('edit_username').value = '';
    document.getElementById('edit_password').value = '';
    document.getElementById('edit_email').value = '';
    document.getElementById('edit_phone').value = '';
    document.getElementById('edit_place').value = '';
}//4

// Function to update the user's details
function updateUser() {//5
    const name = document.getElementById('edit_name').value;
    const username = document.getElementById('edit_username').value;
    const password = document.getElementById('edit_password').value;
    const email = document.getElementById('edit_email').value;
    const phone = document.getElementById('edit_phone').value;
    const place = document.getElementById('edit_place').value;

    // Create the update payload
    const updateData = { name, username, email, phone, place };
    if (password) {
        updateData.password = password; // Only update the password if it's filled
    }

    fetch(`http://localhost:3000/users/${currentUserId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('User updated successfully!');
            loadUsers(); // Reload the user list
            closeModal(); // Close the modal
        } else {
            alert('Failed to update user.');
        }
    })
    .catch(error => {
        console.error('Error updating user:', error);
    });
}//5

// Function to handle user deletion
function deleteUser(userId) {//6
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`http://localhost:3000/users/${userId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('User deleted successfully!');
                loadUsers(); // Reload user list
            } else {
                showToast('Failed to delete user.',false);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showToast('Failed to delete user.', false);
        });
    }
}//6

// Load users when the user list page is opened
if (document.title === "User List") {//7
    loadUsers();
}
//login page js
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM fully loaded and parsed'); // Log when DOM is ready

    const loginForm = document.getElementById('loginForm');
    console.log('Login Form:', loginForm); // Log the form elements

    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById('loginusername').value;
            const password = document.getElementById('loginpassword').value;

            fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showToast('Login successful!');
                    setTimeout(() => {
                        window.location.href = `welcome.html?username=${encodeURIComponent(username)}`;
                    }, 1000); // Redirect on successful login
                } else {
                    showToast('Login failed. Please check your credentials.', false);
                    setTimeout(() => location.reload(), 2000);
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
            });
        });
    } else {
        console.error('Login form not found!'); // Log an error if not found
    }
});


// Function to load departments into the department list table
function loadDepartments() {
    console.log("Loading departments...");
    fetch('http://localhost:3000/department')
        .then(response => response.json())
        .then(data => {
            const departmentTableBody = document.querySelector('#departmentTable tbody');
            departmentTableBody.innerHTML = ''; // Clear existing data

            if (data.departments && Array.isArray(data.departments)) {
                data.departments.forEach(department => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    
                        <td>${department.depname}</td>
                        <td>${department.role}</td>
                        <td>${department.description}</td>
                        <td>
                                <button class="edit-button" onclick="showEditPrompt()"><i class="fas fa-edit"></i></button>
                                <button class="delete-button" onclick="showDeletePrompt()"><i class="fas fa-trash"></i></button>
                            </td>
                    `;
                    departmentTableBody.appendChild(row);
                });
                $('#departmentTable').DataTable(); 
            } else {
                console.error('No departments found or invalid response format');
            }
        })
        .catch(error => {
            console.error('Error fetching departments:', error);
        });
}

// Load departments when the relevant page is opened
if (document.title === "Department List") {
    loadDepartments();
}


// Function to show the Add Department modal
function showAddModal() {
    document.getElementById('modalTitle').innerText = 'Add Department';
    document.getElementById('depId').value = '';
    document.getElementById('depName').value = '';
    document.getElementById('role').value = '';
    document.getElementById('description').value = '';
    document.getElementById('departmentModal').style.display = 'block';
    isAdding = true;
    console.log('depId:', depId);
}

// Function to show the Edit Department prompt
function showEditPrompt() {
    const depId = prompt('Enter the Department ID you want to edit:');
    if (depId) {
        fetch(`http://localhost:3000/department/${depId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('modalTitle').innerText = 'Edit Department';
                    document.getElementById('depId').value = data.department.depid;
                    document.getElementById('depName').value = data.department.depname;
                    document.getElementById('role').value = data.department.role;
                    document.getElementById('description').value = data.department.description;
                    document.getElementById('departmentModal').style.display = 'block';
                } else {
                    showToast('Department not found.', false);
                }
            })
            .catch(error => console.error('Error fetching department:', error));
    }
}

// Function to show the Delete Department prompt
function showDeletePrompt() {
    const depId = prompt('Enter the Department ID you want to delete:');
    if (depId) {
        if (confirm(`Are you sure you want to delete department with ID ${depId}?`)) {
            fetch(`http://localhost:3000/department/${depId}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showToast('Department deleted successfully!');
                        loadDepartments(); // Refresh the department list
                    } else {
                        showToast('Failed to delete department.', false);
                    }
                })
                .catch(error => console.error('Error deleting department:', error));
        }
    }
}

// Function to save department (for both add and edit)
function saveDepartment() {
    console.log('Saving department...');
    const depId = document.getElementById('depId').value.trim();
    const depName = document.getElementById('depName').value;
    const role = document.getElementById('role').value;
    const description = document.getElementById('description').value;

    const method = isAdding ? 'POST' : 'PUT'; // Use POST if adding, otherwise PUT
    const url = isAdding ? `http://localhost:3000/department` : `http://localhost:3000/department/${depId}`;

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            depid: depId, // Include depId even for POST if required by your backend
            depname: depName,
            role: role,
            description: description
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Department ${isAdding ? 'added' : 'updated'} successfully!`);
            closeModall();
            // loadDepartments(); // Refresh the department list if needed
        } else {
            showToast('Failed to save department.', false);
        }
    })
    .catch(error => console.error('Error saving department:', error));
}


// Function to close the modal
function closeModall() {
    document.getElementById('departmentModal').style.display = 'none';
}
