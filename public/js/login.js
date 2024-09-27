const token = localStorage.getItem('token');

if(token){
    window.location.href="index.html";
}

// User login
async function login(event) {
    event.preventDefault();
    const userEmail = document.getElementById('email').value;
    const userPass = document.getElementById('password').value;

    try {
        const response = await axios.post('http://localhost:3000/user/login', {
            email: userEmail,
            password: userPass
        });
    
        alert(response.data.message);
        console.log("Login success");
        localStorage.setItem('token', response.data.token);
        window.location.href="index.html";
    
    } catch (error) {
        if (error.response.status === 404) {
            alert("User not found");
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

