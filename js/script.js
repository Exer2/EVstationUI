// EV Charging Station UI - JavaScript

// DOM elements
const dateTimeElement = document.getElementById('dateTime');
const statusIcon = document.getElementById('statusIcon');
const statusText = document.getElementById('statusText');
const chargingTime = document.getElementById('chargingTime');
const batteryPercentage = document.getElementById('batteryPercentage');
const chargingRate = document.getElementById('chargingRate');
const currentCost = document.getElementById('currentCost');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const economyMode = document.getElementById('economyMode');
const fastMode = document.getElementById('fastMode');
const infoButton = document.getElementById('infoButton');
const infoModal = document.getElementById('infoModal');
const closeButton = document.querySelector('.close-button');

// UI state
const uiState = {
    charging: false,
    chargingStartTime: null,
    energyDelivered: 0,
    batteryPercentage: 0,
    initialBatteryPercentage: 20, // Začetni odstotek baterije
    maxBatteryCapacity: 60,      // Maksimalna kapaciteta baterije v kWh
    chargingRate: 0,
    baseChargingRate: 11, // Base charging rate (average of 7-15 kW)
    maxVariation: 0.5,    // Maximum variation in kW (smaller for more consistency)
    pricePerKwh: 0.20,
    simInterval: null,
    chargingMode: 'economy', // 'economy' or 'fast'
    rates: {
        economy: {
            baseRate: 11,  // kW
            pricePerKwh: 0.20 // €
        },
        fast: {
            baseRate: 22,  // kW
            pricePerKwh: 0.35 // €
        }
    }
};

// Initialize the application
function initApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Event listeners
    startButton.addEventListener('click', startCharging);
    stopButton.addEventListener('click', stopCharging);
    
    // Charging mode event listeners
    economyMode.addEventListener('click', () => setChargingMode('economy'));
    fastMode.addEventListener('click', () => setChargingMode('fast'));
    
    // Info button event listeners
    infoButton.addEventListener('click', showInfoModal);
    closeButton.addEventListener('click', closeInfoModal);
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            closeInfoModal();
        }
    });
    
    // Set initial state display
    updateUI();
    
    // Connect to Node-RED
    connectToNodeRED();
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    dateTimeElement.textContent = `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

// WebSocket connection
let ws;

// Initialize the application
function initApp() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Event listeners
    startButton.addEventListener('click', startCharging);
    stopButton.addEventListener('click', stopCharging);
    
    // Charging mode event listeners
    economyMode.addEventListener('click', () => setChargingMode('economy'));
    fastMode.addEventListener('click', () => setChargingMode('fast'));
    
    // Info button event listeners
    infoButton.addEventListener('click', showInfoModal);
    closeButton.addEventListener('click', closeInfoModal);
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            closeInfoModal();
        }
    });
    
    // Set initial state display
    updateUI();
    
    // Connect to Node-RED
    connectToNodeRED();
}

// Connect to Node-RED using WebSocket
function connectToNodeRED() {
    ws = new WebSocket('ws://localhost:1880/ev-charging');
    
    ws.onopen = function() {
        console.log('Connected to Node-RED');
        // Send initial state
        sendStateToNodeRED();
    };
    
    ws.onmessage = function(event) {
        handleNodeREDMessage(event.data);
    };
    
    ws.onclose = function() {
        console.log('Disconnected from Node-RED');
        // Try to reconnect after 3 seconds
        setTimeout(connectToNodeRED, 3000);
    };
    
    ws.onerror = function(error) {
        console.error('WebSocket Error:', error);
    };
}

// Send current state to Node-RED
function sendStateToNodeRED() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        const stateData = {
            charging: uiState.charging,
            batteryPercentage: uiState.batteryPercentage,
            chargingRate: uiState.chargingRate,
            energyDelivered: uiState.energyDelivered,
            currentCost: parseFloat((uiState.energyDelivered * uiState.pricePerKwh).toFixed(2)),
            timestamp: new Date().toISOString()
        };
        
        ws.send(JSON.stringify(stateData));
    }
}

// Handle messages from Node-RED
function handleNodeREDMessage(message) {
    try {
        const data = JSON.parse(message);
        
        // Handle remote control commands
        if (data.command === 'start' && !uiState.charging) {
            startCharging();
        } else if (data.command === 'stop' && uiState.charging) {
            stopCharging();
        }
        
        // Handle config updates
        if (data.config) {
            if (data.config.pricePerKwh !== undefined) {
                uiState.pricePerKwh = data.config.pricePerKwh;
            }
            if (data.config.baseChargingRate !== undefined) {
                uiState.baseChargingRate = data.config.baseChargingRate;
            }
            // Update UI after config change
            updateChargingInfo();
        }
        
    } catch (error) {
        console.error('Error parsing message from Node-RED:', error);
    }
}


// Start charging
function startCharging() {
    uiState.charging = true;
    uiState.chargingStartTime = new Date();
    uiState.energyDelivered = 0;
    uiState.batteryPercentage = uiState.initialBatteryPercentage;
    
    // Set initial charging rate based on selected mode
    if (uiState.chargingMode === 'fast') {
        uiState.chargingRate = uiState.rates.fast.baseRate;
        uiState.pricePerKwh = uiState.rates.fast.pricePerKwh;
    } else {
        uiState.chargingRate = uiState.rates.economy.baseRate;
        uiState.pricePerKwh = uiState.rates.economy.pricePerKwh;
    }
    
    // Update UI elements
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
    statusIcon.style.backgroundColor = 'var(--success-color)';
    statusText.textContent = 'Polnjenje v teku';
    // Simulate charging
    uiState.simInterval = setInterval(simulateCharging, 1000);
    
    // Reset display
    chargingTime.textContent = '00:00 h';
    batteryPercentage.textContent = `${uiState.batteryPercentage} %`;
    currentCost.textContent = '0.00 €';
    chargingRate.textContent = `${uiState.chargingRate.toFixed(1)} kW`;
    sendStateToNodeRED();

}

// Stop charging
function stopCharging() {
    uiState.charging = false;
    clearInterval(uiState.simInterval);
    
    // Update UI elements
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
    statusIcon.style.backgroundColor = 'var(--warning-color)';
    statusText.textContent = 'Pripravljen na polnjenje';
    sendStateToNodeRED();

}

// Update charging time display
function updateChargingTime() {
    const now = new Date();
    const elapsedMs = now - uiState.chargingStartTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    
    chargingTime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} h`;
}

// Simulate charging process
function simulateCharging() {
    // Update charging time
    updateChargingTime();
    
    // Small variation in charging rate to make it more realistic but consistent
    const variation = (Math.random() * 2 - 1) * uiState.maxVariation; // Random value between -maxVariation and +maxVariation
    uiState.chargingRate = uiState.baseChargingRate + variation;
    
    // Ensure charging rate stays positive
    if (uiState.chargingRate < 0) {
        uiState.chargingRate = 0.1; // Minimum charging rate
    }
    
    // Update energy delivered (kWh) - converting kW to kWh for 1 second
    uiState.energyDelivered += uiState.chargingRate / 3600;
    
    // Izračun odstotka baterije
    // Izračunamo koliko odstotkov predstavlja trenutna dovedena energija
    const percentageIncrease = (uiState.chargingRate / 3600) / uiState.maxBatteryCapacity * 100;
    uiState.batteryPercentage += percentageIncrease;
    
    // Omejimo maksimalni odstotek baterije na 100%
    if (uiState.batteryPercentage > 100) {
        uiState.batteryPercentage = 100;
    }
    
    // Update UI
    updateChargingInfo();

    // Send update to Node-RED every 5 seconds
    if (Math.floor(Date.now() / 1000) % 5 === 0) {
        sendStateToNodeRED();
    }
}

// Update charging information display
function updateChargingInfo() {
    // Charging rate
    chargingRate.textContent = `${uiState.chargingRate.toFixed(1)} kW`;
    
    // Energy delivered
    batteryPercentage.textContent = `${uiState.batteryPercentage.toFixed(2)} %`;
    
    // Cost calculation
    const cost = uiState.energyDelivered * uiState.pricePerKwh;
    currentCost.textContent = `${cost.toFixed(2)} €`;
}

// Update UI elements
function updateUI() {
    if (!uiState.charging) {
        statusText.textContent = 'Pripravljen na polnjenje';
        statusIcon.style.backgroundColor = 'var(--warning-color)';
    } else {
        statusText.textContent = 'Polnjenje v teku';
        statusIcon.style.backgroundColor = 'var(--success-color)';
    }
}

// Set charging mode (economy/fast)
function setChargingMode(mode) {
    if (mode === 'economy') {
        uiState.chargingMode = 'economy';
        economyMode.classList.add('active');
        fastMode.classList.remove('active');
        
        // Update rates
        uiState.baseChargingRate = uiState.rates.economy.baseRate;
        uiState.pricePerKwh = uiState.rates.economy.pricePerKwh;
    } else if (mode === 'fast') {
        uiState.chargingMode = 'fast';
        fastMode.classList.add('active');
        economyMode.classList.remove('active');
        
        // Update rates
        uiState.baseChargingRate = uiState.rates.fast.baseRate;
        uiState.pricePerKwh = uiState.rates.fast.pricePerKwh;
    }
    
    // If already charging, update the charging rate and info
    if (uiState.charging) {
        uiState.chargingRate = uiState.baseChargingRate;
        chargingRate.textContent = `${uiState.chargingRate.toFixed(1)} kW`;
        updateChargingInfo();
    }
    
    // Send update to Node-RED if connected
    if (ws && ws.readyState === WebSocket.OPEN) {
        sendStateToNodeRED();
    }
}

// Show info modal with pricing and power details
function showInfoModal() {
    // Update values to ensure they match the current rates
    document.getElementById('economyPower').textContent = `${uiState.rates.economy.baseRate} kW`;
    document.getElementById('economyPrice').textContent = `${uiState.rates.economy.pricePerKwh.toFixed(2)} € / kWh`;
    document.getElementById('fastPower').textContent = `${uiState.rates.fast.baseRate} kW`;
    document.getElementById('fastPrice').textContent = `${uiState.rates.fast.pricePerKwh.toFixed(2)} € / kWh`;
    
    // Show modal
    infoModal.style.display = 'block';
}

// Close info modal
function closeInfoModal() {
    infoModal.style.display = 'none';
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
