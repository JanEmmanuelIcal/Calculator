// Calculator logic with safer evaluation, input handling, and keyboard support
const displayEl = document.getElementById('display');

let expression = '';

function updateDisplay() {
    displayEl.innerText = expression === '' ? '0' : expression;
}

function isOperator(ch) {
    return /[+\-*/]/.test(ch);
}

function appendCharacter(char) {
    // Only allow one decimal per number
    if (char === '.') {
        // find last number token
        const m = expression.match(/(?:^|[+\-*/])(\d*\.?\d*)$/);
        if (m && m[1] && m[1].includes('.')) return; // already has decimal
        if (!m) {
            // if expression is empty or ends with operator, prepend 0
            if (expression === '' || isOperator(expression.slice(-1))) {
                expression += '0';
            }
        }
        expression += '.';
        updateDisplay();
        return;
    }

    if (isOperator(char)) {
        if (expression === '' && char !== '-') {
            // don't allow leading operator other than minus
            return;
        }
        // replace trailing operator with new one
        if (isOperator(expression.slice(-1))) {
            expression = expression.slice(0, -1) + char;
        } else {
            expression += char;
        }
        updateDisplay();
        return;
    }

    // numbers
    expression += char;
    updateDisplay();
}

function clearDisplay() {
    expression = '';
    updateDisplay();
}

function deleteLast() {
    if (expression.length === 0) return;
    expression = expression.slice(0, -1);
    updateDisplay();
}

function applyPercent() {
    // convert last number to percentage (divide by 100)
    const m = expression.match(/(\d*\.?\d+)$/);
    if (!m) return;
    const num = parseFloat(m[1]);
    const replaced = String(num / 100);
    expression = expression.slice(0, -m[1].length) + replaced;
    updateDisplay();
}

function sanitizeExpression(exp) {
    // allow only digits, operators, parentheses and decimal
    // this is a lightweight check for local static app
    if (/[^0-9+\-*/(). ]/.test(exp)) throw new Error('Invalid characters');
    return exp;
}

function calculateResult() {
    if (expression === '') return;
    // remove trailing operator(s)
    while (expression.length > 0 && isOperator(expression.slice(-1))) {
        expression = expression.slice(0, -1);
    }
    if (expression === '') return;

    try {
        const safe = sanitizeExpression(expression);
        // evaluate using Function for slightly safer eval behavior
        // wrap in parentheses to allow unary leading expressions
        const result = Function('"use strict"; return (' + safe + ')')();
        if (typeof result === 'number' && isFinite(result)) {
            // trim floating point artifacts
            const rounded = Math.round((result + Number.EPSILON) * 1e10) / 1e10;
            expression = String(rounded);
            updateDisplay();
        } else {
            throw new Error('Math error');
        }
    } catch (err) {
        displayEl.innerText = 'Error';
        expression = '';
        setTimeout(updateDisplay, 900);
    }
}

// Button delegation
const buttons = document.querySelector('.buttons');
buttons.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const val = btn.dataset.value;
    const action = btn.dataset.action;
    if (val) {
        appendCharacter(val);
    } else if (action) {
        if (action === 'clear') clearDisplay();
        else if (action === 'delete') deleteLast();
        else if (action === 'equals') calculateResult();
        else if (action === 'percent') applyPercent();
    }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        appendCharacter(e.key);
        return;
    }
    if (['+','-','*','/'].includes(e.key)) {
        appendCharacter(e.key);
        return;
    }
    if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
        return;
    }
    if (e.key === '.' ) {
        appendCharacter('.');
        return;
    }
    if (e.key === 'Backspace') {
        deleteLast();
        return;
    }
    if (e.key === 'Escape' || e.key === 'Esc') {
        clearDisplay();
        return;
    }
    if (e.key === '%') {
        applyPercent();
        return;
    }
});

// init
updateDisplay();
