
// Admin signup
async function addAdmin(event){
    try{
        event.preventDefault();

        const adminName = document.getElementById('name').value;
        const adminEmail = document.getElementById('email').value;
        const adminPass = document.getElementById('password').value;

        const response = await axios.post('http://localhost:3000/admin/signup', {
            name: adminName,
            email: adminEmail,
            password: adminPass
        });
       
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';

        console.log("New Admin added");
        window.location.href="adminLogin.html";

    } catch (error) {
        if (error.response) {
          alert(error.response.data.message); // Display the error message from the backend
        } else {
          console.error('Something went wrong:', error);
        }
    }}      
