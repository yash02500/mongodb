const adminToken = localStorage.getItem('adminToken');

if(adminToken){
    window.location.href="admin.html";
}

// User login
async function adminLogin(event) {
    event.preventDefault();
    const adminEmail = document.getElementById('email').value;
    const adminPass = document.getElementById('password').value;

    try {
        const response = await axios.post('http://localhost:3000/admin/login', {
            email: adminEmail,
            password: adminPass
        });
    
        alert(response.data.message);
        console.log("Login success");
        localStorage.setItem('adminToken', response.data.adminToken);
        window.location.href="admin.html";
    
    } catch (error) {
        if (error.response.status === 404) {
            alert("Admin not found");
            document.body.innerHTML += '<center><h4>Wrong email address please enter correct one</h4></center>';
            console.error(error);
        }
        
        if(error.response.status === 400){
                alert("Login values missing!");
                document.body.innerHTML += '<center><h4>Please enter the login details</h4></center>';
                console.error(error);
            }

        else{
            alert("Wrong email or password");
            document.body.innerHTML += '<center><h4>Incorrect password please enter correct one</h4></center>';
            console.error(error);
        }
    }

    // Clear the input fields
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
};

