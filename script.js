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

function focusMobileInput() {
    mobileInput.focus()
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
    mobileInput.value = ""
}

function addLetter(letter) {
    if (finished) return
    if (currentCol >= COLS) return

    board[currentRow][currentCol] = letter
    getCell(currentRow, currentCol).textContent = letter
    currentCol++
}

function removeLetter() {
    if (finished) return
    if (currentCol <= 0) return

    currentCol--
    board[currentRow][currentCol] = ""
    getCell(currentRow, currentCol).textContent = ""
}

function getCell(r, c) {
    return boardEl.children[r].children[c]
}

function evaluateGuess(guess, target) {
    const result = Array(COLS).fill("absent")
    const targetUsed = Array(COLS).fill(false)
    const guessUsed = Array(COLS).fill(false)

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
                break
            }
        }
    }

    return result
}

function paintRow(rowIndex, result) {
    for (let i = 0; i < COLS; i++) {
        const cell = getCell(rowIndex, i)
        cell.classList.remove("correct", "present", "absent")
        cell.classList.add(result[i])
    }
}

function clearCurrentRow() {
    for (let c = 0; c < COLS; c++) {
        board[currentRow][c] = ""
        getCell(currentRow, c).textContent = ""
    }
    currentCol = 0
}

function submitGuess() {
    if (finished) return

    if (currentCol !== COLS) {
        statusEl.textContent = "Beseda mora imeti 5 črk"
        return
    }

    const guess = board[currentRow].join("")

    if (!validWords.has(guess)) {
        statusEl.textContent = "Te besede ni v bazi"
        clearCurrentRow()
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
    if (e.target === mobileInput) return
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

mobileInput.addEventListener("keydown", (e) => {
    if (finished) return

    if (e.key === "Enter") {
        e.preventDefault()
        submitGuess()
        mobileInput.value = ""
        return
    }

    if (e.key === "Backspace") {
        e.preventDefault()
        removeLetter()
        mobileInput.value = ""
    }
})

mobileInput.addEventListener("input", () => {
    if (finished) {
        mobileInput.value = ""
        return
    }

    const letters = mobileInput.value.toUpperCase().replace(/[^A-ZČŠŽ]/g, "")

    for (const char of letters) {
        addLetter(char)
    }

    mobileInput.value = ""
})

boardEl.addEventListener("click", focusMobileInput)
statusEl.addEventListener("click", focusMobileInput)

document.body.addEventListener("click", (e) => {
    if (e.target !== newGameBtn) {
        focusMobileInput()
    }
})

newGameBtn.addEventListener("click", () => {
    newGame()
    focusMobileInput()
})

loadWords().then(() => {
    newGame()
})
