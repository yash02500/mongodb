const adminToken = localStorage.getItem("adminToken");

if (!adminToken) {
    alert("You need to login first");
    window.location.href = "adminLogin.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the dashboard by loading data
    loadServices();
    loadUsers();
    loadAppointments();
    loadSlots();
});

// Load services data from the backend
async function loadServices() {
    try {
        const response = await axios.get("http://localhost:3000/admin/getServices", {
            headers: { adminAuthorization: adminToken }
        });
        const services = response.data; // Assuming this returns an array of services

        displayAdminServices(services); // Call the function to display the fetched services
    } catch (error) {
        console.error("Error fetching services:", error);
        alert("Failed to load services data. Please try again.");
    }
}


// Display services dynamically in the table
function displayAdminServices(services) {
    const servicesTableBody = document.querySelector('#servicesTable tbody');
    servicesTableBody.innerHTML = ''; // Clear existing content

    services.forEach(service => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${service.name}</td>
        <td>${service.description}</td>
        <td>${service.duration} mins</td>
        <td>$${service.price}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteService(${service.id})">Delete</button>
        </td>
      `;
        servicesTableBody.appendChild(row);
    });
}


// Function to handle adding a new service
document.getElementById('addService').addEventListener('click', () => addService());
async function addService() {
    const serviceName = document.getElementById('serviceName').value;
    const serviceDescription = document.getElementById('serviceDescription').value;
    const serviceDuration = document.getElementById('serviceDuration').value;
    const servicePrice = document.getElementById('servicePrice').value;

    const service = {
        name: serviceName,
        description: serviceDescription,
        duration: serviceDuration,
        price: servicePrice
    }
    try {
        const response = await axios.post("http://localhost:3000/admin/addServices", service, {
            headers: { adminAuthorization: adminToken },
        })

        alert('Service added successfully!');
        // Reset input fields
        document.getElementById('serviceName').value = '';
        document.getElementById('serviceDescription').value = '';
        document.getElementById('serviceDuration').value = '';
        document.getElementById('servicePrice').value = '';

        loadServices(); // Refresh services list
    } catch (error) {
        console.error('Error adding service:', error);
    }
}


// Function to delete a service
async function deleteService(serviceId) {
    try {
        const response = await axios.delete(`http://localhost:3000/admin/deleteService/${serviceId}`, {
            headers: { adminAuthorization: adminToken },
        });

        alert('Service deleted successfully!');
        loadServices(); // Refresh the appointments list after deletion

    } catch (error) {
        console.error('Error deleting service:', error);
    }
}


// Load users data from the backend 
async function loadUsers() {
    try {
        const response = await axios.get("http://localhost:3000/admin/getUsers", {
            headers: { adminAuthorization: adminToken }
        });
        const users = response.data; // Assuming this returns an array of users

        displayUsers(users); // Call the function to display the fetched users
    } catch (error) {
        console.error("Error fetching users:", error);
        alert("Failed to load users data. Please try again.");
    }
}

// Display users dynamically in the table
function displayUsers(users) {
    const usersTableBody = document.querySelector('#usersTable tbody');
    usersTableBody.innerHTML = ''; // Clear existing content

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="editUser(${user.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
        </td>
      `;
        usersTableBody.appendChild(row);
    });
}



// Function to delete a user
async function deleteUser(userId) {
    try {
        const response = await axios.delete(`http://localhost:3000/admin/removeUser/${userId}`, {
            headers: { adminAuthorization: adminToken },
        });
        alert('User deleted successfully!');
        loadUsers();

    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
    }
}


// Function to edit a user
async function editUser(userId) {
    try {
        const response = await axios.get(`http://localhost:3000/admin/editUser/${userId}`, {
            headers: { adminAuthorization: adminToken },
        });
        const user = response.data;
        // Populate the modal with the current user details
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userId').value = user.id;

        // Show the modal
        $('#editUserModal').modal('show');
    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to load user details. Please try again.');
    }
}

// Save user updated
async function saveUserChanges(event) {
    event.preventDefault();
    const userId = document.getElementById('userId').value;
    const updatedName = document.getElementById('userName').value;
    const updatedEmail = document.getElementById('userEmail').value;

    const updatedUser = {
        name: updatedName,
        email: updatedEmail
    };
    try {
        const response = await axios.put(`http://localhost:3000/admin/saveEditedUser/${userId}`, updatedUser, {
            headers: { adminAuthorization: adminToken }
        })
        alert('User updated successfully!');
        $('#editUserModal').modal('hide');
        loadUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Please try again.');
    }

}


// Load appointments data from the backend
async function loadAppointments() {
    try {
        const response = await axios.get("http://localhost:3000/admin/getAppointments", {
            headers: { adminAuthorization: adminToken }, // Include the token in the request headers
        });

        const appointments = response.data; // Get user data from response
        displayAppointments(appointments); // Function to display appointments    
    } catch (error) {
        console.error("Error fetching appointments:", error);
        alert("Failed to load appointments data. Please try again.");
    }
}

// Display appointments dynamically in the table
function displayAppointments(appointments) {
    const appointmentsTableBody = document.querySelector('#appointmentsTable tbody');
    appointmentsTableBody.innerHTML = ''; // Clear existing content

    appointments.forEach(appointment => {
        const slotDate = new Date(appointment.slotId.date);  // Full date object
        const time = slotDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const formattedDate = slotDate.toLocaleDateString('en-GB');
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${appointment._id}</td>
        <td>${appointment.userId.name}</td>
        <td>${appointment.serviceId.name}</td>
        <td>${formattedDate}</td>
        <td>${time}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteAppointment(${appointment._id})">Delete</button>
        </td>
      `;
        appointmentsTableBody.appendChild(row);
    });
}

// Function to delete an appointment
async function deleteAppointment(appointmentId) {
    try {
        const response = await axios.delete(`http://localhost:3000/admin/cancelAppointment/${appointmentId}`, {
            headers: { adminAuthorization: adminToken },
        });
        alert('Appointment deleted successfully!');
        loadAppointments(); // Refresh the appointments list after deletion

    } catch (error) {
        console.error('Error deleting appointment:', error);
        alert('Failed to delete appointment. Please try again.');
    }
}


// Load slots data from the backend
async function loadSlots() {
    try {
        const response = await axios.get("http://localhost:3000/admin/getSlots", {
            headers: { adminAuthorization: adminToken }
        });
        const slots = response.data; // Assuming this returns an array of slots

        displaySlots(slots); // Call the function to display the fetched slots
    } catch (error) {
        console.error("Error fetching slots:", error);
        alert("Failed to load slots data. Please try again.");
    }
}

// Display slots dynamically in the table
function displaySlots(slots) {
    const slotsTableBody = document.querySelector('#slotsTable tbody');
    slotsTableBody.innerHTML = '';

    slots.forEach(slot => {
        const row = document.createElement('tr');

        const slotDateTime = new Date(slot.date);
        const date = slotDateTime.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
        const time = slotDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // Format as HH:mm

        row.innerHTML = `
            <td>${slot._id}</td>
            <td>${date}
            </td>
            <td>${time}</td>
            <td>${slot.isBooked ? '✅' : '❌'}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteSlot('${slot._id}')">Delete</button>
            </td>
        `;
        slotsTableBody.appendChild(row);
    });
}


// Function to delete a slot
async function deleteSlot(slotId) {
    if (!confirm("Are you sure you want to delete this slot?")) {
        return;
    }
      // console.log(slotId,'slotid gotttt');
    try {
        const response = await axios.delete(`http://localhost:3000/admin/deleteSlot/${slotId}`, {
            headers: { adminAuthorization: adminToken }
        });

        alert("Slot deleted successfully!");
        loadSlots(); // Reload slots to update the table
    } catch (error) {
        console.error("Error deleting slot:", error);
        alert("Failed to delete slot. Please try again.");
    }
}


// Function to add a new slot
document.getElementById('addSlot').addEventListener('click', addSlot);
async function addSlot(event) {
    event.preventDefault();
    const slotDate = document.getElementById('slotDate').value;
    const slotTime = document.getElementById('slotTime').value;

    if (!slotDate || !slotTime) {
        alert("Please enter both date and time for the slot.");
        return;
    }

    // Combine date and time into a single Date object
    const slotDateTime = new Date(`${slotDate}T${slotTime}`);

    const slot = {
        dateTime: slotDateTime
    };

    try {
        const response = await axios.post("http://localhost:3000/admin/addSlot", slot, {
            headers: { adminAuthorization: adminToken }
        });

        alert("Slot added successfully!");
        loadSlots();
    } catch (error) {
        console.error("Error adding slot:", error);
        alert("Failed to add slot. Please try again.");
    }
}


// Admin Logout
function adminLogout() {
    localStorage.removeItem("adminToken");
    window.location.href = "adminLogin.html";
}
