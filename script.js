const ROWS = 6
const COLS = 5

let words = []
let validWords = new Set()
let targetWord = ""
let currentRow = 0
let currentCol = 0
let board = []
let finished = false

const boardEl = document.getElementById("board")
const statusEl = document.getElementById("status")
const newGameBtn = document.getElementById("newGame")
const mobileInput = document.getElementById("mobileInput")

async function loadWords() {
    const res = await fetch("besede.txt")
    const text = await res.text()

    words = text.split(/\r?\n/)
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length === 5)

    validWords = new Set(words)
}

function buildBoard() {
    boardEl.innerHTML = ""
    board = []

    for (let r = 0; r < ROWS; r++) {
        const row = []
        const rowEl = document.createElement("div")
        rowEl.className = "row"

        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement("div")
            cell.className = "cell"
            rowEl.appendChild(cell)
            row.push("")
        }

        boardEl.appendChild(rowEl)
        board.push(row)
    }
}

function newGame() {
    if (words.length === 0) {
        statusEl.textContent = "Besede niso naložene"
        return
    }

    targetWord = words[Math.floor(Math.random() * words.length)]
    currentRow = 0
    currentCol = 0
    finished = false
    statusEl.textContent = "Vnesi 5-črkovno besedo"
    buildBoard()

    mobileInput.focus()
}

function addLetter(letter) {
    if (currentCol >= COLS) return

    board[currentRow][currentCol] = letter
    const cell = getCell(currentRow, currentCol)
    cell.textContent = letter
    currentCol++
}

function removeLetter() {
    if (currentCol <= 0) return

    currentCol--
    board[currentRow][currentCol] = ""
    const cell = getCell(currentRow, currentCol)
    cell.textContent = ""
}

function getCell(r, c) {
    return boardEl.children[r].children[c]
}

function evaluateGuess(guess, target) {
    let result = Array(COLS).fill("absent")
    let targetUsed = Array(COLS).fill(false)
    let guessUsed = Array(COLS).fill(false)

    for (let i = 0; i < COLS; i++) {
        if (guess[i] === target[i]) {
            result[i] = "correct"
            targetUsed[i] = true
            guessUsed[i] = true
        }
    }

    for (let i = 0; i < COLS; i++) {
        if (guessUsed[i]) continue

        for (let j = 0; j < COLS; j++) {
            if (!targetUsed[j] && guess[i] === target[j]) {
                result[i] = "present"
                targetUsed[j] = true
                guessUsed[i] = true
                break
            }
        }
    }

    return result
}

function paintRow(rowIndex, result) {
    for (let i = 0; i < COLS; i++) {
        const cell = getCell(rowIndex, i)
        cell.classList.add(result[i])
    }
}

function submitGuess() {
    if (currentCol !== COLS) {
        statusEl.textContent = "Beseda mora imeti 5 črk"
        return
    }

    const guess = board[currentRow].join("")

    if (!validWords.has(guess)) {
        statusEl.textContent = "Te besede ni v bazi"

        for (let c = 0; c < COLS; c++) {
            board[currentRow][c] = ""
            getCell(currentRow, c).textContent = ""
        }

        currentCol = 0
        return
    }

    const result = evaluateGuess(guess, targetWord)
    paintRow(currentRow, result)

    if (guess === targetWord) {
        statusEl.textContent = "Bravo. Uganil si besedo."
        finished = true
        return
    }

    currentRow++
    currentCol = 0

    if (currentRow >= ROWS) {
        statusEl.textContent = "Konec igre. Beseda je bila: " + targetWord
        finished = true
        return
    }

    statusEl.textContent = "Nadaljuj"
}

document.addEventListener("keydown", (e) => {

    if (document.activeElement === mobileInput) return

    if (finished) return

    if (e.key === "Enter") {
        submitGuess()
        return
    }

    if (e.key === "Backspace") {
        removeLetter()
        return
    }

    const char = e.key.toUpperCase()

    if (/^[A-ZČŠŽ]$/.test(char)) {
        addLetter(char)
    }
})

mobileInput.addEventListener("input", () => {

    const char = mobileInput.value.toUpperCase()

    if (/^[A-ZČŠŽ]$/.test(char)) {
        addLetter(char)
    }

    mobileInput.value = ""
})

document.addEventListener("click", () => {
    mobileInput.focus()
})

newGameBtn.addEventListener("click", newGame)

loadWords().then(newGame)
