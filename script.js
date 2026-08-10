// Customer Accounts Data
let accounts = [
  { accountNumber: "0123-4567-8901", accountName: "Roel Richard", balance: 5000.00, pinNumber: "1111", status: "Active" },
  { accountNumber: "2345-6789-0123", accountName: "Dorie Marie", balance: 0.00, pinNumber: "2222", status: "Blocked" },
  { accountNumber: "3456-7890-1234", accountName: "Raize Darrel", balance: 10000.00, pinNumber: "3333", status: "Active" },
  { accountNumber: "4567-8901-2345", accountName: "Raiynne Desiree", balance: 2500.00, pinNumber: "4444", status: "Active" },
  { accountNumber: "5678-9012-3456", accountName: "Raine Desiree", balance: 10000.00, pinNumber: "5555", status: "Active" }
];

const ADMIN_ACC = "0000-0000-0000";
const ADMIN_PIN = "0000";

let state = "MAIN_MENU";
let selectedAccount = null;
let targetAccount = null;
let adminSourceAccount = null;
let newCustomerData = {};
let attempts = 0;

const screen = document.getElementById("screen");
const userInput = document.getElementById("userInput");
const buttonArea = document.getElementById("buttonArea");
const terminalControls = document.getElementById("terminalControls");
const atmContainer = document.querySelector(".atm-container");

const OUTPUT_4_STATES = [
    "BALANCE_VIEW",
    "WITHDRAW_AMOUNT",
    "DEPOSIT_AMOUNT",
    "TRANSFER_ACC",
    "TRANSFER_AMOUNT",
    "USER_CHANGE_PIN"
];

const ADMIN_SUB_STATES = [
    "ADMIN_VIEW_ALL",
    "ADMIN_SEARCH_ACC",
    "ADMIN_ADD_ACC",
    "ADMIN_ADD_NAME",
    "ADMIN_ADD_BAL",
    "ADMIN_ADD_PIN",
    "ADMIN_EDIT_NAME_ACC",
    "ADMIN_EDIT_NAME_NEW",
    "ADMIN_CHANGE_PIN_ACC",
    "ADMIN_CHANGE_PIN_NEW",
    "ADMIN_TRANSFER_SRC",
    "ADMIN_TRANSFER_TGT",
    "ADMIN_TRANSFER_AMT",
    "ADMIN_TOGGLE_STATUS_ACC",
    "ADMIN_SET_STATUS"
];

function updateClock() {
    const now = new Date();
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    const dateStr = now.toLocaleDateString('en-US', options);
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('liveClock').innerText = `${timeStr} | ${dateStr}`;
}
setInterval(updateClock, 1000);
updateClock();

function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = button.getElementsByClassName("ripple")[0];
    if (existingRipple) {
        existingRipple.remove();
    }

    button.appendChild(circle);
}

function setPinInputMode(isPin) {
    if (isPin) {
        userInput.type = "password";
    } else {
        userInput.type = "text";
    }
}

window.addEventListener("keydown", function(event) {
    if (event.key === "x" || event.key === "X") {
        const isTypingText = document.activeElement === userInput && (state === "ADMIN_ADD_NAME" || state === "ADMIN_EDIT_NAME_NEW");
        
        if (!isTypingText) {
            event.preventDefault();
            goBack();
        }
    }
});

userInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        handleInput(event);
    }
});

function goBack() {
    if (ADMIN_SUB_STATES.includes(state)) {
        showAdminMenu();
    } else if (OUTPUT_4_STATES.includes(state)) {
        showTransactionMenu();
    } else {
        showMainMenu();
    }
}

function display(content, alignLeft = false, isHTML = false, isWide = false) {
    if (isWide) {
        atmContainer.classList.add("wide-view");
    } else {
        atmContainer.classList.remove("wide-view");
    }

    if (isHTML) {
        screen.innerHTML = content;
    } else {
        screen.innerText = content;
    }
    
    userInput.value = "";
    
    if (alignLeft) {
        screen.classList.add("align-left");
    } else {
        screen.classList.remove("align-left");
    }

    screen.classList.remove("screen-fade");
    void screen.offsetWidth;
    screen.classList.add("screen-fade");
}

function setInputVisibility(visible, placeholder = "Type here...", isPin = false) {
    setPinInputMode(isPin);
    if (visible) {
        terminalControls.style.display = "flex";
        userInput.placeholder = placeholder;
        userInput.focus();
    } else {
        terminalControls.style.display = "none";
    }
}

function renderButtons(buttons) {
    buttonArea.innerHTML = "";
    buttons.forEach(btn => {
        const button = document.createElement("button");
        button.className = `action-btn ${btn.class || ''}`;
        button.innerText = btn.label;
        button.onclick = (e) => {
            createRipple(e);
            processCommand(btn.value);
        };
        buttonArea.appendChild(button);
    });
}

function renderExitToMenuButton() {
    renderButtons([
        { label: "Back to Transaction Menu", value: "X", class: "btn-quit" }
    ]);
}

function renderExitToAdminButton() {
    renderButtons([
        { label: "Back to Admin Menu", value: "X", class: "btn-quit" }
    ]);
}

function renderCustomerInputScreen(messageText, placeholderText, isPin = false) {
    display(messageText);
    setInputVisibility(true, placeholderText, isPin);
    renderExitToMenuButton();
}

function renderAdminInputScreen(messageText, placeholderText, isPin = false) {
    display(messageText);
    setInputVisibility(true, placeholderText, isPin);
    renderExitToAdminButton();
}

function showMainMenu() {
    state = "MAIN_MENU";
    display("Welcome to Richard Gwapo Banking Corporation!");
    setInputVisibility(false);
    renderButtons([
        { label: "Start Transaction", value: "S" },
        { label: "Quit", value: "Q", class: "btn-quit" }
    ]);
}

function showTransactionMenu() {
    state = "TRANS_MENU";
    display("SELECT TYPE OF TRANSACTION");
    setInputVisibility(false);
    renderButtons([
        { label: "Balance Inquiry", value: "B" },
        { label: "Withdrawal", value: "W" },
        { label: "Deposit", value: "D" },
        { label: "Transfer Fund", value: "T" },
        { label: "Change PIN", value: "P" },
        { label: "Cancel / Exit", value: "X", class: "btn-quit" }
    ]);
}

function showAdminMenu() {
    state = "ADMIN_MENU";
    display("ADMINISTRATOR PAGE\n\nSelect option:");
    setInputVisibility(false);
    renderButtons([
        { label: "View All Info", value: "1" },
        { label: "Search Customer", value: "2" },
        { label: "Add New Customer", value: "3" },
        { label: "Edit Name", value: "4" },
        { label: "Change PIN", value: "5" },
        { label: "Transfer Fund", value: "6" },
        { label: "Manage Status", value: "7" },
        { label: "Exit to Main", value: "X", class: "btn-quit" }
    ]);
}

function processCommand(input) {
    if (input && input.toUpperCase() === 'X') {
        goBack();
        return;
    }

    if (input === 'ADMIN') {
        showAdminMenu();
        return;
    }

    switch (state) {
        case "MAIN_MENU":
            if (input.toUpperCase() === 'S') {
                state = "LOGIN_ACC";
                display("LOGIN\n\nEnter your account number:");
                setInputVisibility(true, "Account Number...", false);
                renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
            } else if (input.toUpperCase() === 'Q') {
                display("Program Closed.\nThank you!");
                setInputVisibility(false);
                renderButtons([{ label: "Restart System", value: "S" }]);
            }
            break;

        case "LOGIN_ACC":
            if (input === ADMIN_ACC) {
                state = "ADMIN_PIN_ENTRY";
                display("ADMIN LOGIN\n\nEnter Admin PIN:");
                setInputVisibility(true, "Admin PIN...", true);
                renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
                return;
            }

            selectedAccount = accounts.find(acc => acc.accountNumber === input);
            if (!selectedAccount) {
                display("Incorrect account number!\n\nEnter your account number:");
                setInputVisibility(true, "Account Number...", false);
                renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
            } else if (selectedAccount.status === "Blocked") {
                state = "BLOCKED_PROMPT";
                display(`ACCOUNT IS BLOCKED!\n\nDo you want to activate account\n[${selectedAccount.accountNumber}]?`);
                setInputVisibility(false);
                renderButtons([
                    { label: "Activate Account", value: "ACTIVATE" },
                    { label: "Cancel / Main Menu", value: "X", class: "btn-quit" }
                ]);
            } else {
                attempts = 0; // Reset attempts counter
                state = "LOGIN_PIN";
                display("LOGIN\n\nEnter your PIN number:");
                setInputVisibility(true, "PIN Number...", true);
                renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
            }
            break;

        case "BLOCKED_PROMPT":
            if (input === "ACTIVATE") {
                state = "UNBLOCK_ADMIN_PIN";
                display("ADMIN ACTIVATION REQUIRED\n\nEnter Admin PIN to unblock:");
                setInputVisibility(true, "Admin PIN...", true);
                renderButtons([{ label: "Cancel", value: "X", class: "btn-quit" }]);
            }
            break;

        case "UNBLOCK_ADMIN_PIN":
            if (input === ADMIN_PIN) {
                selectedAccount.status = "Active";
                attempts = 0;
                state = "LOGIN_PIN";
                display(`ACCOUNT ACTIVATED!\nWelcome, ${selectedAccount.accountName}.\n\nEnter your PIN number:`);
                setInputVisibility(true, "PIN Number...", true);
                renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
            } else {
                display("Incorrect Admin PIN! Account remains blocked.");
                setInputVisibility(false);
                renderButtons([{ label: "Try Again", value: "ACTIVATE" }, { label: "Main Menu", value: "X", class: "btn-quit" }]);
                state = "BLOCKED_PROMPT";
            }
            break;

        case "ADMIN_PIN_ENTRY":
            if (input === ADMIN_PIN) {
                showAdminMenu();
            } else {
                display("Incorrect Admin PIN!\n\nEnter Admin PIN:");
                setInputVisibility(true, "Admin PIN...", true);
                renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
            }
            break;

        case "LOGIN_PIN":
            if (input === selectedAccount.pinNumber) {
                attempts = 0;
                showTransactionMenu();
            } else {
                attempts++;
                if (attempts >= 3) {
                    selectedAccount.status = "Blocked";
                    
                    display("CAPTURED CARD.... PLEASE CALL 143-44");
                    setInputVisibility(false);
                    buttonArea.innerHTML = "";
                    
                    setTimeout(() => {
                        attempts = 0;
                        selectedAccount = null;
                        showMainMenu();
                    }, 3000);
                } else {
                    display(`Incorrect PIN!\nAttempts left: ${3 - attempts}`);
                    setInputVisibility(true, "PIN Number...", true);
                    renderButtons([{ label: "Back to Main Menu", value: "X", class: "btn-quit" }]);
                }
            }
            break;

        case "TRANS_MENU":
            let opt = input.toUpperCase();
            if (opt === 'B') {
                state = "BALANCE_VIEW";
                display(
                    "BALANCE INQUIRY\n\n" +
                    `Account #: ${selectedAccount.accountNumber}\n` +
                    `Name:      ${selectedAccount.accountName}\n` +
                    `Balance:   ₱${selectedAccount.balance.toFixed(2)}\n` +
                    `Status:    [${selectedAccount.status}]`
                );
                setInputVisibility(false);
                renderExitToMenuButton();
            } else if (opt === 'W') {
                state = "WITHDRAW_AMOUNT";
                renderCustomerInputScreen(`WITHDRAWAL\nBalance: ₱${selectedAccount.balance.toFixed(2)}\n\nEnter amount:`, "Amount...");
            } else if (opt === 'D') {
                state = "DEPOSIT_AMOUNT";
                renderCustomerInputScreen(`DEPOSIT\nBalance: ₱${selectedAccount.balance.toFixed(2)}\n\nEnter amount:`, "Amount...");
            } else if (opt === 'T') {
                state = "TRANSFER_ACC";
                renderCustomerInputScreen("TRANSFER FUND\n\nEnter target account number:", "Target Account...");
            } else if (opt === 'P') {
                state = "USER_CHANGE_PIN";
                renderCustomerInputScreen("CHANGE PIN\n\nEnter your NEW 4-digit PIN:", "New PIN...", true);
            } else if (opt === 'RESTART') {
                showMainMenu();
            }
            break;

        case "USER_CHANGE_PIN":
            if (input.length === 4 && !isNaN(input)) {
                selectedAccount.pinNumber = input;
                display("PIN Changed Successfully!");
                setInputVisibility(false);
                renderExitToMenuButton();
            } else {
                renderCustomerInputScreen("Invalid PIN! Must be 4 digits.\n\nEnter your NEW 4-digit PIN:", "Enter 4-digit PIN...", true);
            }
            break;

        case "WITHDRAW_AMOUNT":
            let wAmt = Number(input);
            if (isNaN(wAmt) || input.trim() === "") {
                renderCustomerInputScreen("INVALID INPUT!\nPlease enter a valid whole number.\n\nEnter amount:", "Enter amount...");
            } else if (wAmt < 100) {
                renderCustomerInputScreen("INVALID AMOUNT!\nMinimum withdrawal amount is ₱100.\n\nEnter amount:", "Enter amount...");
            } else if (wAmt % 100 !== 0) {
                renderCustomerInputScreen("INVALID DENOMINATION!\nAmount must be in multiples of 100.\n\nEnter amount:", "Enter amount...");
            } else if (wAmt > selectedAccount.balance) {
                renderCustomerInputScreen(`INSUFFICIENT FUNDS!\nYour balance is ₱${selectedAccount.balance.toFixed(2)}.\n\nEnter amount:`, "Enter amount...");
            } else {
                selectedAccount.balance -= wAmt;
                display(
                    "WITHDRAWAL SUCCESSFUL!\n\n" +
                    `Amount Withdrawn: ₱${wAmt.toFixed(2)}\n` +
                    `New Balance:      ₱${selectedAccount.balance.toFixed(2)}`
                );
                setInputVisibility(false);
                renderExitToMenuButton();
            }
            break;

        case "DEPOSIT_AMOUNT":
            let dAmt = parseFloat(input);
            if (isNaN(dAmt) || dAmt < 100) {
                renderCustomerInputScreen("Invalid Amount!\nMinimum deposit is ₱100.\n\nEnter amount:", "Try again...");
            } else {
                selectedAccount.balance += dAmt;
                display(`Deposit Successful!\nNew Balance: ₱${selectedAccount.balance.toFixed(2)}`);
                setInputVisibility(false);
                renderExitToMenuButton();
            }
            break;

        case "TRANSFER_ACC":
            targetAccount = accounts.find(acc => acc.accountNumber === input);
            if (!targetAccount || targetAccount.accountNumber === selectedAccount.accountNumber) {
                renderCustomerInputScreen("Invalid target account number!\n\nEnter target account number:", "Target Account...");
            } else {
                state = "TRANSFER_AMOUNT";
                renderCustomerInputScreen(`Transferring to: ${targetAccount.accountNumber}\n\nEnter amount:`, "Amount...");
            }
            break;

        case "TRANSFER_AMOUNT":
            let tAmt = parseFloat(input);
            let fee = Math.floor(tAmt / 1000) * 25; // ₱25 charge per 1000
            let netReceived = tAmt - fee;

            if (isNaN(tAmt) || tAmt < 1000 || tAmt > selectedAccount.balance) {
                renderCustomerInputScreen("Invalid amount or Insufficient Funds!\nMin Transfer: ₱1,000.\n\nEnter amount:", "Try again...");
            } else if (netReceived <= 0) {
                renderCustomerInputScreen("Amount too low after transaction fee!\n\nEnter amount:", "Try again...");
            } else {
                selectedAccount.balance -= tAmt;
                targetAccount.balance += netReceived;

                display(
                    "TRANSFER SUCCESSFUL!\n\n" +
                    `Transferred Amount: ₱${tAmt.toFixed(2)}\n` +
                    `Fee Deducted (Target): ₱${fee.toFixed(2)}\n` +
                    `Target Received:   ₱${netReceived.toFixed(2)}\n` +
                    `Your New Balance:  ₱${selectedAccount.balance.toFixed(2)}`
                );
                setInputVisibility(false);
                renderExitToMenuButton();
            }
            break;

        
        case "ADMIN_MENU":
            if (input === '1') {
                state = "ADMIN_VIEW_ALL";
                
                let html = `<div class="table-title">Customer List Directory</div>`;
                html += `<table class="customer-table">
                            <thead>
                                <tr>
                                    <th>Acc No.</th>
                                    <th>Name</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>`;
                
                accounts.forEach(a => {
                    let badgeClass = a.status === "Active" ? "badge-active" : "badge-blocked";
                    html += `<tr>
                                <td>${a.accountNumber}</td>
                                <td>${a.accountName}</td>
                                <td>₱${a.balance.toFixed(2)}</td>
                                <td><span class="badge ${badgeClass}">${a.status}</span></td>
                            </tr>`;
                });
                
                html += `</tbody></table>`;
                
                display(html, true, true, true); 
                setInputVisibility(false);
                renderExitToAdminButton();
            } else if (input === '2') {
                state = "ADMIN_SEARCH_ACC";
                renderAdminInputScreen("SEARCH CUSTOMER\n\nEnter Account Number:", "Account Number...");
            } else if (input === '3') {
                state = "ADMIN_ADD_ACC";
                newCustomerData = {};
                renderAdminInputScreen("ADD NEW CUSTOMER\n\nEnter New Account Number:", "0000-0000-0000");
            } else if (input === '4') {
                state = "ADMIN_EDIT_NAME_ACC";
                renderAdminInputScreen("EDIT CUSTOMER NAME\n\nEnter Account Number:", "Account Number...");
            } else if (input === '5') {
                state = "ADMIN_CHANGE_PIN_ACC";
                renderAdminInputScreen("CHANGE CUSTOMER PIN\n\nEnter Account Number:", "Account Number...");
            } else if (input === '6') {
                state = "ADMIN_TRANSFER_SRC";
                renderAdminInputScreen("ADMIN TRANSFER FUND\n\nEnter SOURCE Account Number:", "Source Account...");
            } else if (input === '7') {
                state = "ADMIN_TOGGLE_STATUS_ACC";
                renderAdminInputScreen("MANAGE ACCOUNT STATUS\n\nEnter Account Number:", "Account Number...");
            } else {
                showAdminMenu();
            }
            break;

        case "ADMIN_TRANSFER_SRC":
            adminSourceAccount = accounts.find(acc => acc.accountNumber === input);
            if (!adminSourceAccount) {
                renderAdminInputScreen("Source Account not found!\n\nEnter SOURCE Account Number:", "Try again...");
            } else if (adminSourceAccount.status === "Blocked") {
                renderAdminInputScreen("Source Account is BLOCKED!\n\nEnter SOURCE Account Number:", "Try another account...");
            } else {
                state = "ADMIN_TRANSFER_TGT";
                renderAdminInputScreen(`Source: ${adminSourceAccount.accountName} (₱${adminSourceAccount.balance.toFixed(2)})\n\nEnter TARGET Account Number:`, "Target Account...");
            }
            break;

        case "ADMIN_TRANSFER_TGT":
            targetAccount = accounts.find(acc => acc.accountNumber === input);
            if (!targetAccount || targetAccount.accountNumber === adminSourceAccount.accountNumber) {
                renderAdminInputScreen("Invalid Target Account Number!\n\nEnter TARGET Account Number:", "Try again...");
            } else {
                state = "ADMIN_TRANSFER_AMT";
                renderAdminInputScreen(`From: ${adminSourceAccount.accountName}\nTo: ${targetAccount.accountName}\n\nEnter Transfer Amount:`, "Amount...");
            }
            break;

        case "ADMIN_TRANSFER_AMT":
            let admTAmt = parseFloat(input);
            let admFee = Math.floor(admTAmt / 1000) * 25;
            let admNetReceived = admTAmt - admFee;
            
            if (isNaN(admTAmt) || admTAmt < 1000 || admTAmt > adminSourceAccount.balance) {
                renderAdminInputScreen("Invalid Amount or Insufficient Funds!\nMin: 1000.\n\nEnter Transfer Amount:", "Try again...");
            } else {
                adminSourceAccount.balance -= admTAmt;
                targetAccount.balance += admNetReceived;
                display(
                    "TRANSFER SUCCESSFUL!\n\n" +
                    `Transferred:       ₱${admTAmt.toFixed(2)}\n` +
                    `Fee (Target Deduct): ₱${admFee.toFixed(2)}\n` +
                    `Target Received:   ₱${admNetReceived.toFixed(2)}\n` +
                    `Source New Bal:    ₱${adminSourceAccount.balance.toFixed(2)}`
                );
                setInputVisibility(false);
                renderExitToAdminButton();
            }
            break;

        case "ADMIN_SEARCH_ACC":
            let found = accounts.find(acc => acc.accountNumber === input);
            if (found) {
                display(
                    "CUSTOMER FOUND:\n\n" +
                    `Account #: ${found.accountNumber}\n` +
                    `Name:      ${found.accountName}\n` +
                    `Balance:   ₱${found.balance.toFixed(2)}\n` +
                    `PIN:       ${found.pinNumber}\n` +
                    `Status:    [${found.status}]`
                );
                setInputVisibility(false);
                renderExitToAdminButton();
            } else {
                renderAdminInputScreen("Account not found!\n\nEnter Account Number:", "Try again...");
            }
            break;

        case "ADMIN_ADD_ACC":
            if (input.trim() === "") {
                renderAdminInputScreen("Account Number cannot be blank!\n\nEnter New Account Number:", "0000-0000-0000");
                return;
            }
            if (!/^[0-9-]+$/.test(input)) {
                renderAdminInputScreen("Account Number must contain digits only (dashes optional)!\n\nEnter New Account Number:", "0000-0000-0000");
                return;
            }
            if (accounts.some(acc => acc.accountNumber === input)) {
                renderAdminInputScreen("Account Number already exists!\n\nEnter New Account Number:", "0000-0000-0000");
                return;
            }
            newCustomerData.accountNumber = input;
            state = "ADMIN_ADD_NAME";
            renderAdminInputScreen("ADD NEW CUSTOMER\n\nEnter Customer Name:", "Full Name...");
            break;

        case "ADMIN_ADD_NAME":
            if (input.trim() === "") {
                renderAdminInputScreen("Name cannot be blank!\n\nEnter Customer Name:", "Full Name...");
                return;
            }
            if (!/^[A-Za-z\s.'-]+$/.test(input)) {
                renderAdminInputScreen("Name must contain letters only!\n\nEnter Customer Name:", "Full Name...");
                return;
            }
            newCustomerData.accountName = input.trim();
            state = "ADMIN_ADD_BAL";
            renderAdminInputScreen("ADD NEW CUSTOMER\n\nEnter Initial Deposit Amount:", "Initial Amount...");
            break;

        case "ADMIN_ADD_BAL":
            let initBal = parseFloat(input);
            if (isNaN(initBal) || initBal < 0) {
                renderAdminInputScreen("Invalid Amount!\n\nEnter Initial Deposit Amount:", "Amount...");
                return;
            }
            newCustomerData.balance = initBal;
            state = "ADMIN_ADD_PIN";
            renderAdminInputScreen("ADD NEW CUSTOMER\n\nEnter 4-digit PIN Number:", "4-digit PIN...", true);
            break;

        case "ADMIN_ADD_PIN":
            if (input.length !== 4 || isNaN(input)) {
                renderAdminInputScreen("Invalid PIN! Must be exactly 4 digits.\n\nEnter 4-digit PIN Number:", "4-digit PIN...", true);
                return;
            }
            newCustomerData.pinNumber = input;
            newCustomerData.status = "Active"; 
            
            accounts.push({ ...newCustomerData });

            display(`NEW CUSTOMER CREATED!\n\nName:      ${newCustomerData.accountName}\nAccount #: ${newCustomerData.accountNumber}\nStatus:    [Active]`);
            setInputVisibility(false);
            renderExitToAdminButton();
            break;

        case "ADMIN_EDIT_NAME_ACC":
            targetAccount = accounts.find(acc => acc.accountNumber === input);
            if (targetAccount) {
                state = "ADMIN_EDIT_NAME_NEW";
                renderAdminInputScreen(`Current Name: ${targetAccount.accountName}\n\nEnter NEW Name:`, "New Name...");
            } else {
                renderAdminInputScreen("Account not found!\n\nEnter Account Number:", "Try again...");
            }
            break;

        case "ADMIN_EDIT_NAME_NEW":
            targetAccount.accountName = input;
            display(`Customer Name Updated Successfully!\nNew Name: ${targetAccount.accountName}`);
            setInputVisibility(false);
            renderExitToAdminButton();
            break;

        case "ADMIN_CHANGE_PIN_ACC":
            targetAccount = accounts.find(acc => acc.accountNumber === input);
            if (targetAccount) {
                state = "ADMIN_CHANGE_PIN_NEW";
                renderAdminInputScreen(`Account: ${targetAccount.accountNumber}\n\nEnter NEW 4-digit PIN:`, "New PIN...", true);
            } else {
                renderAdminInputScreen("Account not found!\n\nEnter Account Number:", "Try again...");
            }
            break;

        case "ADMIN_CHANGE_PIN_NEW":
            if (input.length === 4 && !isNaN(input)) {
                targetAccount.pinNumber = input;
                display(`PIN Updated Successfully for Account ${targetAccount.accountNumber}!`);
                setInputVisibility(false);
                renderExitToAdminButton();
            } else {
                renderAdminInputScreen("Invalid PIN!\n\nEnter NEW 4-digit PIN:", "4 digits...", true);
            }
            break;

        case "ADMIN_TOGGLE_STATUS_ACC":
            targetAccount = accounts.find(acc => acc.accountNumber === input);
            if (!targetAccount) {
                renderAdminInputScreen("Customer Account Number not found!\n\nEnter Account Number:", "Try again...");
            } else {
                state = "ADMIN_SET_STATUS";
                display(`Account: ${targetAccount.accountNumber} (${targetAccount.accountName})\nCurrent Status: [${targetAccount.status}]\n\nSelect action:`);
                setInputVisibility(false);
                renderButtons([
                    { label: "Activate", value: "Active" },
                    { label: "Block", value: "Blocked" },
                    { label: "Back to Admin Menu", value: "X", class: "btn-quit" }
                ]);
            }
            break;

        case "ADMIN_SET_STATUS":
            targetAccount.status = input;
            display(`Status updated successfully!\n\nAccount ${targetAccount.accountNumber}\nis now [${targetAccount.status}].`);
            setInputVisibility(false);
            renderExitToAdminButton();
            break;

        default:
            showMainMenu();
            break;
    }
}

function handleInput(event) {
    if (event && event.currentTarget) {
        createRipple(event);
    }
    processCommand(userInput.value.trim());
}

// Initial start
showMainMenu();
