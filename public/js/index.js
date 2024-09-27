const token = localStorage.getItem("token");

if (!token) {
  alert("You need to login first");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  // Fetch and display services
  fetchAndDisplayServices();

  // Event listener for "Book Now" buttons (this will be set dynamically after fetching services)
  document.getElementById("profileIcon").addEventListener("click", function (event) {
    event.preventDefault();
    fetchUserProfile(); // Call function to fetch user profile
    fetchAppointments();
  });
});

// Function to fetch services from the backend
async function fetchAndDisplayServices() {
  try {
    const response = await axios.get("http://localhost:3000/services/getServices", {
      headers: { Authorization: token }
    });
    const services = response.data; // Assuming this returns an array of services

    displayServices(services); // Call the function to display the fetched services
  } catch (error) {
    console.error("Error fetching services:", error);
    alert("Failed to load services data. Please try again.");
  }
}

function displayServices(services) {
  const servicesContainer = document.querySelector(".row"); // Assuming .row is the container for services

  // Clear any existing service elements
  servicesContainer.innerHTML = '';

  // Loop through each service in the services array
  services.forEach((service) => {
    // Create a new div element for each service card
    const serviceCard = document.createElement("div");
    serviceCard.classList.add("col-md-4");

    // Set the inner HTML of the service card
    serviceCard.innerHTML = `
      <div class="card service-card">
        <div class="card-body">
          <h5 class="card-title" id="serviceTitle">${service.name}</h5>
          <p class="card-text" id="serviceDescription">${service.description}</p>
          <p class="card-text" id="serviceDuration"><strong>Duration:</strong> ${service.duration} minutes</p>
          <p class="card-text" id="servicePrice"><strong>Price:</strong> $${service.price}</p>
          <button class="btn btn-primary btn-block book-btn" data-service-id="${service._id}" data-service-name="${service.name}">Book Now</button>
        </div>
      </div>
    `;

    // Append the newly created service card to the container
    servicesContainer.appendChild(serviceCard);
  });

  // Reattach event listeners to dynamically created "Book Now" buttons
  attachBookNowEventListeners();
}

// Function to attach event listeners to "Book Now" buttons
function attachBookNowEventListeners() {
  const bookButtons = document.querySelectorAll(".book-btn");
  bookButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const serviceId = this.getAttribute("data-service-id");
      getAvailableSlots(serviceId);
    });
  });
}

// Function to fetch available slots from the backend
async function getAvailableSlots(serviceId) {
  try {
    const response = await axios.get("http://localhost:3000/user/getOpenSlots", {
      headers: { Authorization: token }
    });
    
    const data = response.data;
    console.log('slotssssss', data)
    displayAvailableSlots(data.slots, serviceId); // Pass serviceId to the display function
  } catch (error) {
    console.error('Error fetching available slots:', error);
  }
}

// Function to display slots in the UI
function displayAvailableSlots(slots, serviceId) {
  const slotsContainer = document.getElementById('slotsContainer'); // Ensure there's a container with this ID
  const availableSlots = document.getElementById('availableSlots'); // Ensure there's a container with this ID

  if(slots.length<=0){
    availableSlots.textContent='Slots will be available soon...';
  }
  availableSlots.textContent='';
  slotsContainer.innerHTML = ''; // Clear any existing content

  slots.forEach(slot => {
    const slotDateTime = new Date(slot.date);

    const date = slotDateTime.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const time = slotDateTime.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const slotElement = document.createElement('div');
    slotElement.classList.add('slot');
    slotElement.innerHTML = `
      <p>Date: ${date}</p>
      <p>Time: ${time}</p>
      <button class="btn btn-primary book-slot-btn" data-slot-id="${slot._id}">Book Slot</button>
    `;
    slotsContainer.appendChild(slotElement);

    slotElement.querySelector('.book-slot-btn').addEventListener('click', function() {
      bookAppointment(slot._id, serviceId);
    });    
  });

  availableSlots.appendChild(slotsContainer);

  // Show the modal
  $("#slotsModal").modal("show");
}


// Function to book an appointment for the selected slot
async function bookAppointment(slotId, serviceId) {
  const appointmentDetails = {
    slot: slotId,
    service: serviceId
  };

  try {
    const response = await axios.post("http://localhost:3000/user/appointment", appointmentDetails, {
      headers: { Authorization: token },
    });

    alert(`Appointment booked successfully!`);
    $("#slotsModal").modal("hide");
  } catch (error) {
    console.log(error);
    alert("Failed to book appointment. Please try again.");
  }
}

// Function to fetch user profile data
async function fetchUserProfile() {
  try {
    const response = await axios.get("http://localhost:3000/user/profile", {
      headers: { Authorization: token }, // Include the token in the request headers
    });

    const userData = response.data; // Get user data from response
    document.getElementById("profileName").value = userData.name;
    document.getElementById("profileEmail").value = userData.email;
    $("#profileModal").modal("show"); // Show the profile modal

  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("Failed to load profile data. Please try again.");
  }
}


// Function to fetch user profile data
async function fetchAppointments() {
  try {
    const response = await axios.get("http://localhost:3000/user/getAppointments", {
      headers: { Authorization: token }, // Include the token in the request headers
    });

    const appointments = response.data; // Get user data from response
    displayUserAppointments(appointments); // Function to display appointments
    $("#profileModal").modal("show"); // Show the profile modal

  } catch (error) {
    console.error("Error fetching user appointments:", error);
    alert("Failed to load appointments data. Please try again.");
  }
}


// Display user appointments
function displayUserAppointments(appointments) {
  const appointmentsList = document.getElementById('appointmentsList');
  appointmentsList.innerHTML = '';

  // If no appointments, show a message
  if (appointments.length === 0) {
    appointmentsList.innerHTML = '<li class="list-group-item">No appointments booked.</li>';
    return;
  }

  // Loop through the appointments and display each one
  appointments.forEach(appointment => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item');

    // Display the service name, date, and time
    const serviceName = appointment.serviceId ? appointment.serviceId.name : 'N/A';
    const slotDate = appointment.slotId ? new Date(appointment.slotId.date).toLocaleDateString('en-GB') : 'N/A';
    const slotTime = appointment.slotId ? new Date(appointment.slotId.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    listItem.textContent = `Service: ${serviceName}, Date: ${slotDate}, Time: ${slotTime}`;

    // Check if the appointment status is "completed"
    if (appointment.status === "completed") {
      // Display the "Completed" label for completed appointments
      const completedLabel = document.createElement('span');
      completedLabel.classList.add('badge', 'badge-success', 'ml-2');
      completedLabel.innerText = 'Completed';
      listItem.appendChild(completedLabel);
    } else {
      // If not completed, show the "Cancel" button
      const cancel = document.createElement('button');
      cancel.classList.add('btn', 'btn-danger', 'delete-btn');
      cancel.style.float = 'right';
      cancel.innerText = "Cancel";
      cancel.addEventListener('click', () => deleteUserAppointment(appointment._id, appointment.slotId._id));
      listItem.appendChild(cancel);
    }

    // Append the appointment list item to the appointments list
    appointmentsList.appendChild(listItem);
  });
}


// DeleteUserAppointment function 
async function deleteUserAppointment(appointmentId, slotId) {
  try {
    const response = await axios.delete(`http://localhost:3000/user/cancelAppointment/${appointmentId}/${slotId}`, {
      headers: { Authorization: token },
    });
    alert('Appointment deleted successfully!');
    fetchAppointments(); // Refresh the appointments list after deletion

  } catch (error) {
    console.error('Error deleting appointment:', error);
    alert('Failed to delete appointment. Please try again.');
  }
}

// User Logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}


