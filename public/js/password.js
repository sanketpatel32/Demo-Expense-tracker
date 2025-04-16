const baseurl = "http://13.233.159.232";

const passwordReset = async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value.trim();

    console.log("📧 Sending reset request for:", email);
    try {
        console.log("📧 Sending reset request for:", email);
        const response = await axios.post(`${baseurl}/password/forgotpassword`, { email });

        if (response.status === 200) {
            alert("Password reset email sent successfully. Please check your inbox.");
            window.location.href = `${baseurl}/user/login`;
        } else {
            alert("Failed to send password reset email. Please try again.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Error sending email. Please try again later from the server.");
    }
}
