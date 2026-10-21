const BASE_URL = "http://localhost:8080/api";



export async function login(username, password) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
            role:"USER"
        })
    });

    // Read the response body as plain text
    
    // If login fails, show the backend error message
    if (response.ok) {
        const token = await response.text();
        localStorage.setItem("token", token);
        console.log("Login successful");
        return token;
    }else{
        const data = await response.json();
        throw new Error(data.message);
    }
 

}
export function logout() {
    localStorage.removeItem("token");
}

export async function register(username, password) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const data = await response.json();
    if (!response.ok) {
        console.log(data.message);
        throw Error(data.message);
    }

    console.log("register successfull");

}
