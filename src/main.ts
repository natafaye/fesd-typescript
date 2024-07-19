import "bootstrap/dist/css/bootstrap.min.css"

type User = {
    id: number
    username: string
    password: string
}

let loginAttempts = 0
let loggedInUser: User | null = null

// We'd never store passwords like this in real life!
// Passwords have to be stored encrypted on the Back-End, never as plain text on the Front-End
// But this is just a demo, so we'll keep it simple
let userList: Array<User> = [
    { id: 0, username: "abby", password: "verysecure" },
    { id: 1, username: "gerome", password: "uknowimsecure" },
    { id: 2, username: "brian", password: "thisissosecure" }
]

function renderLoginPage() {
    if(loggedInUser) {
        return `
            <div class="text-center mt-5">
                <h4 class="display-4">Welcome ${loggedInUser.username}!</h4>
                <button id="logout-button" class="btn btn-lg btn-warning mt-4">Logout</button>
            </div>
        `
    }
    return `
        <form class="bg-light p-3 mx-auto mt-5 w-50">
            <h3 class="mb-4">Login</h3>
            <input type="text" id="username-input" placeholder="Username" class="form-control form-control-lg"/>
            <input type="password" id="password-input" placeholder="Password" class="form-control form-control-lg my-3"/>
            <button id="login-button" class="btn btn-lg btn-success">Login</button>
        </form>
    `
}

function setUpLoginButton() {
    const loginButton = document.querySelector("#login-button")
    const usernameInput = document.querySelector("#username-input")
    const passwordInput = document.querySelector("#password-input")

    if(!loginButton || !usernameInput || !passwordInput) return

    loginButton.addEventListener("click", (event) => {
        event.preventDefault()

        loginAttempts++

        const matchingUser = userList.find(user => user.username === (usernameInput as HTMLInputElement).value)

        if(matchingUser && matchingUser.password === (passwordInput as HTMLInputElement).value) {
            loggedInUser = matchingUser
            render()
            return
        }

        if(loginAttempts >= 3) {
            alert(
                "I know you're not " + matchingUser.username + 
                "\n\nPlease stop trying to hack his account."
            )
            return
        }

        alert("Login Failed")
    })
}

function setUpLogoutButton() {
    const logoutButton = document.querySelector("#logout-button")

    if(!logoutButton) return

    logoutButton.addEventListener("click", () => {
        loggedInUser = null
        loginAttempts = 0
        render()
    })
}

function render() {
    (document.querySelector("#app") as HTMLDivElement).innerHTML = renderLoginPage()
    setUpLoginButton()
    setUpLogoutButton()
}

render()
