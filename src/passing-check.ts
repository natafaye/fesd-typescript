let studentName = "Patrick"
const quizScore = 98

function isPassing(score: number) {
	if(score < 60) {
		return false
	} else {
		return true
	}
}

let passed = isPassing(quizScore)
console.log("Quiz passed: " + passed)
