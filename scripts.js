const API_URL = "https://script.google.com/macros/s/AKfycbxkRgjs1VtwPjtLVZmtFnTdSXYVLf8RuIRotRwws8SJ3KcYXiS2ahKUOoYtFIIi-6P9fg/exec"; // Replace with Apps Script Web App URL
let ticketData = [];
let currentTicket = null;

// Load ticket data from Google Sheets
async function loadData() {
  const checkInBtn = document.getElementById("check-in-btn");
  checkInBtn.disabled = true;
  showBanner("Loading data", "banner");

  const res = await fetch(API_URL);
  ticketData = await res.json();

  showBanner("Data loaded.", "banner");
  checkInBtn.disabled = false;

  return ticketData;
}

async function showGuestInfo(ticketNum) {
  await loadData();
  const guest = ticketData.find(t => String(t.ticket_number) === String(ticketNum));
  if (!guest) {
    alert("Ticket " + ticketNum + " not found.");
    return;
  }
  
  currentTicket = guest.ticket_number;
  document.getElementById("guest-info").classList.remove("hidden");
  document.getElementById("name").textContent = guest.first_name + " " + guest.last_name;
  document.getElementById("table").textContent = guest.table_num;
  document.getElementById("paid").textContent = guest.paid_bool;

  const statusEl = document.getElementById("checked-status");
  const checkInBtn = document.getElementById("check-in-btn");

  if (guest.checked_in === true) {
    statusEl.textContent = "Yes";
    statusEl.className = "checked";
    checkInBtn.disabled = true;
    checkInBtn.textContent = "Already Checked In";
  } else {
    statusEl.textContent = "No";
    statusEl.className = "not-checked";
    checkInBtn.disabled = false;
    checkInBtn.textContent = "Check In Guest";
  }

  checkInBtn.onclick = async () => {
    const newURL = API_URL + "?update=True&ticket_number=" + guest.ticket_number;
    try {
      showBanner("Checking in ticket...", "banner");
      await fetch(newURL);
      showBanner("Ticket checked in!", "banner2");
      document.getElementById("checked-status").textContent = "Yes";
      document.getElementById("check-in-btn").disabled = true;
    } catch (err) {
      console.error("Error checking in:", err);
    }
  };
}

function showBanner(message = "Ticket is being checked in!", bannerId, duration = 3000) {
  const banner = document.getElementById(bannerId);
  banner.textContent = message;

  banner.style.pointerEvents = "auto";
  banner.style.opacity = "1";

  setTimeout(() => {
    banner.style.opacity = "0";
    banner.style.pointerEvents = "none";
  }, duration);
}

async function qrCodeSuccessCallback(decodedText) {
  await html5QrcodeScanner.html5Qrcode.pause();

  try {
    await showGuestInfo(decodedText.trim());
  } catch (err) {
    console.error("Error during QR code processing:", err);
  }

  await html5QrcodeScanner.html5Qrcode.resume();
}

const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(qrCodeSuccessCallback);
