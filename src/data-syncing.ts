/**
 * This is some code from the Data Syncing video, converted into Typescript
 * Using Typescript would have made it very easy to find the bug that caused
 * the author and text of the review to be undefined
 * 
 * If you'd like to see what was changed between this and the original, select 
 * both the .js and .ts versions in the Explorer Sidebar (hold SHIFT), 
 * then right click on one of them and pick "Compare Selected"
 * Or you can just look for all the TYPESCRIPT CHANGE comments throughout the file
 */

// TYPESCRIPT CHANGE: Here's a custom type I made for reviews
type Review = {
    id: number
    author: string
    text: string
    stars: number
    movieId: number
}

/**** STATE ****/

// TYPESCRIPT CHANGE: These variable need a type, because the computer can't tell 
// what our plan for them is, since some they start out empty
let reviewList: Array<Review> = []
let reviewToEditId: number | null = null

let user = "Natalie"
let movieId = 3

/**** RENDERING & LISTENING ****/

/* TYPESCRIPT CHANGE: Here I'm using the "as" keyword to tell Typescript that it doesn't need
 * to typecheck these getElementById elements. I've already checked that they're hooked up
 * correctly and I just want Typescript to assume they'll be a div, a select, and a textarea
 * Be careful using the "as" keyword - this is one of very few cases when we might use it.
 * If I wasn't positive these variables will always be hooked up correctly, then I'd want 
 * to do some type-checking if checks before I use them, instead of using the "as" keyword
 * More info about the "as" keyword here: 
 * https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
 */
const reviewsContainer = document.getElementById("reviews-container") as HTMLDivElement
const reviewStarsSelect = document.getElementById("review-stars-select") as HTMLSelectElement
const reviewTextarea = document.getElementById("review-textarea") as HTMLTextAreaElement

/**
 * Render a list of reviews
 */
function renderReviewList() {
    // Clear out anything from previous renders
    reviewsContainer.innerHTML = ""

    // If there's no reviews, show an empty message
    if (reviewList.length === 0) {
        reviewsContainer.innerHTML = "No reviews yet"
    }

    // For each review, map it to a div, then append that div to the container
    reviewList.map(renderReview).forEach(div => reviewsContainer.appendChild(div))
}

/**
 * Render one review
 */
// TYPESCRIPT CHANGE: The review parameter is typed with the Review custom type
function renderReview(review: Review) {
    const reviewDiv = document.createElement("div")
    reviewDiv.className = "bg-light mb-3 p-4"
    reviewDiv.innerHTML = `
        <h5>${review.author}</h5>
        <p>${Array(review.stars).fill(null).map(_ => "⭐").join("")}</p>
        <p>${review.text}</p>
        <button id="edit-button" class="btn btn-sm btn-outline-primary">Edit</button>
        <button id="delete-button" class="btn btn-sm btn-outline-danger">Delete</button>
    `;
    // Attach the event listener to the edit button that gets the form ready to edit
    // TYPESCRIPT CHANGE: I'm positive that the querySelector call will give me a
    // HTMLButtonElement (since I just made the button a few lines above this)
    // so I tell Typescript to not worry about it, just assume it's an HTMLButtonElement
    // (I need the parenthesis to make it clear what I'm type asserting - but the 
    // parenthesis confused the line above, so I had to add a semi-colon up there)
    (reviewDiv.querySelector("#edit-button") as HTMLButtonElement).addEventListener("click", () => {
        reviewToEditId = review.id
        renderReviewForm(review)
    });
    // Attach the event listener to the delete button that deletes the review
    // TYPESCRIPT CHANGE: Added type assertion that the query selector will find a button
    // with that id, like I did with the edit button right above this
    (reviewDiv.querySelector("#delete-button") as HTMLButtonElement).addEventListener("click", async () => {
        
        // Delete on the backend first
        await deleteReview(review.id)
        // Delete on the frontend
        const indexToDelete = reviewList.indexOf(review)
        reviewList.splice(indexToDelete, 1)

        renderReviewList()
    })
    return reviewDiv
}

/**
 * Update the review form to match the review data given
 */
// TYPESCRIPT CHANGE: The review data parameter is typed to an object that has stars and text on it
// this function doesn't need any other properties on reviewData in order to set up the form
function renderReviewForm(reviewData: { stars: number, text: string }) {
    // TYPESCRIPT CHANGE: The value of a textbox is a string, but the stars property is a number
    // so Typescript got annoyed at me. I put the .toString() to explicitly convert it
    // to a string, instead of Javascript implicitly converting it
    reviewStarsSelect.value = reviewData.stars.toString()
    reviewTextarea.value = reviewData.text
}

/**
 * When the save button is clicked, either save an edit or a create
 */
// TYPESCRIPT CHANGE: The event parameter is typed as an Event object
// The Event type is built into Typescript, it's a type for any event object
async function onSaveReviewClick(event: Event) {
    event.preventDefault()
    const reviewData = {
        author: user,
        movieId: movieId,
        text: reviewTextarea.value,
        stars: parseInt(reviewStarsSelect.value)
    }

    if(reviewToEditId !== null) {
        // TYPESCRIPT CHANGE: I had to change around the logic here slightly to make it work nicely with types
        // The reviewData variable doesn't have an id property on it, 
        // so we need to make a new object in order to put an id on it

        // Update on backend
        const updatedReview = {
            ...reviewData,
            id: reviewToEditId
        }
        await putReview(updatedReview)

        // Update on frontend
        const indexToReplace = reviewList.findIndex(r => r.id === reviewToEditId)
        reviewList[indexToReplace] = updatedReview
    } else {
        // Update on backend
        const createdReview = await postReview(reviewData)

        // Update on frontend
        reviewList.push(createdReview)
    }

    renderReviewList()
    reviewToEditId = null
    // Clear the form
    renderReviewForm({ stars: 1, text: "" })
}

/**** FETCHING ****/

async function fetchAllReviews() {
    const response = await fetch("http://localhost:3005/reviews")
    return response.json()
}

/* TYPESCRIPT CHANGE: Here I'm using something a little bit fancy, for fun :)
 * The Omit type is a special type built into Typescript that lets you quickly make  
 * a new type that has all the properties of another type - except some are omitted
 * So this makes a type that has all the properties of Review, except the id property is omitted
 * (because when we post a new review to the backend, we don't want it to have 
 * an id property on it, we want the backend to give it an id)
 * More info about Omit here: https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys
 */
async function postReview(newReviewData: Omit<Review, "id">) {
    const response = await fetch("http://localhost:3005/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReviewData)
    })
    return response.json()
}

// TYPESCRIPT CHANGE: The updatedReview parameter is typed as the custom Review type
async function putReview(updatedReview: Review) {
    await fetch("http://localhost:3005/reviews/" + updatedReview.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedReview)
    })
}

// TYPESCRIPT CHANGE: The idToDelete parameter is typed as a number
async function deleteReview(idToDelete: number) {
    await fetch("http://localhost:3005/reviews/" + idToDelete, {
        method: "DELETE"
    })
}

/**** START UP ****/

async function startUp() {
    renderReviewList()
    reviewList = await fetchAllReviews()
    renderReviewList()
}

startUp()