/* =====================================================
   ADMIN TENTS & CHAIRS REQUEST MANAGEMENT
   - Table and calendar views
   - Filter and search functionality  
   - Approve/deny/complete/archive/delete actions
   - CSV export
   - Manual booking creation
   
   TEMP FILE - TO BE APPENDED TO script.js
===================================================== */

// This code should be added at the end of script.js after line 3895

if (window.location.pathname.endsWith('admin-tents-requests.html')) {
  console.log('🎪 Admin Tents & Chairs Request Management page loaded');

  // Global state
  let allRequests = [];
  let filteredRequests = [];
  let currentView = 'table'; // 'table' or 'calendar'
  let currentTab = 'all'; // 'all' or 'history'
  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();

  // Normalize delivery/mode strings to canonical values for comparison
  function normalizeMode(str) {
    if (!str) return '';
    const s = String(str).toLowerCase();
    if (s.includes('pick')) return 'pick-up';
    if (s.includes('deliver')) return 'delivery';
    if (s.includes('internal')) return 'internal';
    return s.replace(/[^a-z]/g, '');
  }

  // Initialize inventory in Firestore if it doesn't exist
  async function initializeInventory() {
    try {
      const inventoryDocRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryDocRef);

      if (!inventorySnap.exists()) {
        console.log('📦 Creating initial inventory document...');
        await setDoc(inventoryDocRef, {
          availableTents: 24,
          availableChairs: 600,
          tentsInUse: 0,
          chairsInUse: 0,
          lastUpdated: new Date().toISOString()
        });
        console.log('✅ Inventory document created');
      } else {
        console.log('📦 Inventory document already exists');
      }
    } catch (error) {
      console.error('❌ Error initializing inventory:', error);
    }
  }

  // Load all tents & chairs requests from Firestore
  async function loadTentsRequests() {
    try {
      console.log('🔄 Loading tents & chairs requests from Firestore...');
      
      const requestsRef = collection(db, 'tentsChairsBookings');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      allRequests = [];
      querySnapshot.forEach((docSnap) => {
        // Filter out archived requests
        const data = docSnap.data();
        if (!data.archived) {
          allRequests.push({
            id: docSnap.id,
            ...data
          });
        }
      });

      console.log(`✅ Loaded ${allRequests.length} requests`);
      
      // Apply filters and render
      applyFilters();
      
    } catch (error) {
      console.error('❌ Error loading requests:', error);
    }
  }

  // Apply filters based on tab, search, status, date, mode
  function applyFilters() {
    console.log('🔍 Applying filters...');
    
    // Support both legacy tents-prefixed IDs and the page IDs
    const searchTerm = (
      document.getElementById('tentsSearchInput')?.value || document.getElementById('searchInput')?.value || ''
    ).toLowerCase();
    const statusFilter = document.getElementById('tentsStatusFilter')?.value || document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('tentsDateFilter')?.value || document.getElementById('dateFilter')?.value || '';
    const modeFilter = document.getElementById('tentsModeFilter')?.value || document.getElementById('deliveryFilter')?.value || 'all';

    filteredRequests = allRequests.filter(req => {
      // Tab filter (all vs history)
      if (currentTab === 'history') {
        if (!['completed', 'rejected', 'cancelled'].includes(req.status)) {
          return false;
        }
      } else {
        if (['completed', 'rejected', 'cancelled'].includes(req.status)) {
          return false;
        }
      }

      // Search filter
      if (searchTerm) {
        const fullName = (req.fullName || '').toLowerCase();
        const address = (req.completeAddress || '').toLowerCase();
        if (!fullName.includes(searchTerm) && !address.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter) {
        const reqStartDate = req.startDate;
        if (reqStartDate !== dateFilter) {
          return false;
        }
      }

      // Mode filter (normalize to treat variants like "Self-Pickup", "Pick up", and "Pick-up" consistently)
      if (modeFilter !== 'all') {
        if (normalizeMode(req.modeOfReceiving) !== normalizeMode(modeFilter)) {
          return false;
        }
      }

      return true;
    });

    console.log(`✅ Filtered to ${filteredRequests.length} requests`);
    
    // Render based on current view
    if (currentView === 'table') {
      renderTableView();
    } else {
      renderCalendarView();
    }

    // Update stats
    updateStats();
  }

  // Render table view
  function renderTableView() {
    console.log('📊 Rendering table view...');
    
    const container = document.getElementById('tentsContentArea');
    if (!container) return;

    if (filteredRequests.length === 0) {
      container.innerHTML = `
        <div class="tents-no-bookings">
          <p>No requests found matching your filters.</p>
        </div>
      `;
      return;
    }

    let tableHTML = `
      <div class="tents-table-container">
        <table class="tents-table">
          <thead>
            <tr>
              <th>Submitted On</th>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Chairs</th>
              <th>Tents</th>
              <th>Delivery</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
              ${currentTab === 'history' || currentTab === 'archives' ? '<th>Remarks</th>' : ''}
            </tr>
          </thead>
          <tbody>
    `;

    filteredRequests.forEach(req => {
      const submittedDate = req.createdAt ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'N/A';
      const startDate = req.startDate || 'N/A';
      const endDate = req.endDate || 'N/A';
      const chairs = req.quantityChairs || 0;
      const tents = req.quantityTents || 0;
      const mode = req.modeOfReceiving || 'N/A';
      const address = req.completeAddress || 'N/A';
      const status = req.status || 'pending';
      const fullName = (req.firstName || req.lastName)
        ? `${(req.firstName || '').trim()} ${(req.lastName || '').trim()}`.trim()
        : (req.fullName || req.userEmail || 'Unknown');

      tableHTML += `
        <tr>
          <td>${submittedDate}</td>
          <td>${sanitizeInput(fullName)}</td>
          <td>${startDate}</td>
          <td>${endDate}</td>
          <td>${chairs}</td>
          <td>${tents}</td>
          <td>${mode}</td>
          <td>${address}</td>
          <td><span class="tents-status-badge tents-status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
          <td>${getActionButtons(req)}</td>
          ${currentTab === 'history' || currentTab === 'archives' ? `<td>${renderRemarks(req)}</td>` : ''}
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHTML;
  }

  // Render remarks helper
  function renderRemarks(req) {
    const reason = req.rejectionReason || req.remarks || '';
    if (!reason) return '<span class="text-muted">—</span>';
    const displayRaw = (reason || '').replace(/\n/g, ' ');
    const displayShort = displayRaw.length > 140 ? displayRaw.slice(0, 140) + '…' : displayRaw;
    const encFull = encodeURIComponent(reason);
    const encTrunc = encodeURIComponent(displayShort);
    return `<span class="remarks-text collapsed" data-full="${encFull}" data-trunc="${encTrunc}" onclick="toggleRemark(this)">${sanitizeInput(displayShort)}</span>`;
  }

  // Get action buttons based on request status
  function getActionButtons(req) {
    const status = req.status;
    const id = req.id;

    if (currentTab === 'history') {
      // History tab: show archive/delete
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-archive" onclick="window.archiveRequest('${id}')">Archive</button>
          <button class="tents-btn tents-btn-delete" onclick="window.deleteRequest('${id}')">Delete</button>
        </div>
      `;
    }

    // Active requests tab
    if (status === 'pending') {
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-approve" onclick="window.approveRequest('${id}')">Approve</button>
          <button class="tents-btn tents-btn-deny" onclick="window.denyRequest('${id}')">Deny</button>
        </div>
      `;
    } else if (status === 'approved') {
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
        </div>
      `;
    } else if (status === 'in-progress') {
      return `
        <div class="tents-action-buttons">
          <button class="tents-btn tents-btn-complete" onclick="window.completeRequest('${id}')">Mark Complete</button>
        </div>
      `;
    }

    return '<span style="color: #6b7280;">No actions</span>';
  }

  // Approve request
  window.approveRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Approve Request',
      'Are you sure you want to approve this request?'
    );
    if (!confirmed) return;

    try {
      console.log(`✅ Approving request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'approved'
      });

      console.log('✅ Request approved');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error approving request:', error);
      await showConfirmModal('Error', 'Failed to approve request. Please try again.', null, true);
    }
  };

  // Deny request
  window.denyRequest = async function(requestId) {
    const reasonInput = await showConfirmModal(
      'Deny Request',
      'Please provide a reason for denying this request (optional):',
      null,
      false,
      { placeholder: 'Enter reason (optional)...', defaultValue: '', multiline: true }
    );
    if (reasonInput === false) return;

    const reason = typeof reasonInput === 'string' ? reasonInput : '';

    try {
      console.log(`❌ Denying request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      });

      console.log('✅ Request denied');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error denying request:', error);
      await showConfirmModal('Error', 'Failed to deny request. Please try again.', null, true);
    }
  };

  // Complete request
  window.completeRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Mark as Completed',
      'Mark this request as completed?'
    );
    if (!confirmed) return;

    try {
      console.log(`✓ Completing request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        status: 'completed',
        completedAt: new Date()
      });

      console.log('✅ Request marked as completed');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error completing request:', error);
      await showConfirmModal('Error', 'Failed to complete request. Please try again.', null, true);
    }
  };

  // Archive request (soft delete)
  window.archiveRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Archive Request',
      'Archive this request? It will be hidden from history.'
    );
    if (!confirmed) return;

    try {
      console.log(`📦 Archiving request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await updateDoc(requestRef, {
        archived: true,
        archivedAt: new Date().toISOString()
      });

      console.log('✅ Request archived');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error archiving request:', error);
      await showConfirmModal('Error', 'Failed to archive request. Please try again.', null, true);
    }
  };

  // Delete request (permanent)
  window.deleteRequest = async function(requestId) {
    const confirmed = await showConfirmModal(
      'Delete Request',
      '⚠️ PERMANENTLY DELETE this request? This cannot be undone!'
    );
    if (!confirmed) return;

    try {
      console.log(`🗑️ Deleting request ${requestId}...`);
      
      const requestRef = doc(db, 'tentsChairsBookings', requestId);
      await deleteDoc(requestRef);

      console.log('✅ Request deleted');
      await loadTentsRequests(); // Reload
      
    } catch (error) {
      console.error('❌ Error deleting request:', error);
      await showConfirmModal('Error', 'Failed to delete request. Please try again.', null, true);
    }
  };

  // Render calendar view
  function renderCalendarView() {
    console.log('📅 Rendering calendar view...');
    
    const container = document.getElementById('tentsContentArea');
    if (!container) return;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = `
      <div class="tents-calendar-container">
        <div class="tents-calendar-header">
          <h2>${monthNames[currentMonth]} ${currentYear}</h2>
          <div class="tents-calendar-nav">
            <button class="tents-calendar-nav-btn" id="prevMonthBtn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button class="tents-calendar-nav-btn" id="nextMonthBtn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="tents-calendar-grid">
          <div class="tents-calendar-days">
            <div class="tents-calendar-day-header">Sun</div>
            <div class="tents-calendar-day-header">Mon</div>
            <div class="tents-calendar-day-header">Tue</div>
            <div class="tents-calendar-day-header">Wed</div>
            <div class="tents-calendar-day-header">Thu</div>
            <div class="tents-calendar-day-header">Fri</div>
            <div class="tents-calendar-day-header">Sat</div>
          </div>
          <div class="tents-calendar-days">
    `;

    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="tents-calendar-date empty"></div>';
    }

    // Days with bookings
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = filteredRequests.filter(req => 
        req.startDate === dateStr || req.endDate === dateStr
      );

      const hasBookings = dayBookings.length > 0;
      
      calendarHTML += `
        <div class="tents-calendar-date ${hasBookings ? 'has-bookings' : ''}" data-date="${dateStr}">
          <div class="tents-date-number">${day}</div>
      `;

      // Show up to 3 bookings
      dayBookings.slice(0, 3).forEach(booking => {
        const statusClass = `tents-event-${booking.status}`;
        calendarHTML += `
          <div class="tents-calendar-event ${statusClass}">
            <div class="tents-event-name">${booking.fullName || 'Unknown'}</div>
            <div>${booking.quantityTents || 0}T / ${booking.quantityChairs || 0}C</div>
          </div>
        `;
      });

      if (dayBookings.length > 3) {
        calendarHTML += `<div style="font-size: 10px; color: #6b7280; margin-top: 4px;">+${dayBookings.length - 3} more</div>`;
      }

      calendarHTML += '</div>';
    }

    calendarHTML += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = calendarHTML;

    // Add event listeners
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendarView();
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendarView();
    });

    // Click on dates with bookings
    document.querySelectorAll('.tents-calendar-date.has-bookings').forEach(dateEl => {
      dateEl.addEventListener('click', () => {
        const date = dateEl.getAttribute('data-date');
        showDateBookingsModal(date);
      });
    });
  }

  // Show modal with bookings for a specific date
  function showDateBookingsModal(date) {
    console.log(`📅 Showing bookings for ${date}`);
    
    const dateBookings = filteredRequests.filter(req => 
      req.startDate === date || req.endDate === date
    );

    const modal = document.getElementById('tentsModal');
    const modalTitle = document.querySelector('.tents-modal-header h3');
    const modalBody = document.querySelector('.tents-modal-body');

    if (!modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = `Bookings for ${new Date(date).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;

    let bodyHTML = '';
    
    if (dateBookings.length === 0) {
      bodyHTML = '<div class="tents-no-bookings"><p>No bookings on this date.</p></div>';
    } else {
      dateBookings.forEach(booking => {
        bodyHTML += `
          <div class="tents-booking-item">
            <div class="tents-booking-item-header">${booking.fullName || 'Unknown'}</div>
            <div class="tents-booking-item-details">
              <strong>Period:</strong> ${booking.startDate} to ${booking.endDate}<br>
              <strong>Tents:</strong> ${booking.quantityTents || 0} | <strong>Chairs:</strong> ${booking.quantityChairs || 0}<br>
              <strong>Mode:</strong> ${booking.modeOfReceiving || 'N/A'}<br>
              <strong>Status:</strong> <span class="tents-status-badge tents-status-${booking.status}">${booking.status}</span>
            </div>
          </div>
        `;
      });
    }

    modalBody.innerHTML = bodyHTML;
    modal.classList.add('active');
  }

  // Update stats cards
  async function updateStats() {
    try {
      const inventoryDocRef = doc(db, 'inventory', 'equipment');
      const inventorySnap = await getDoc(inventoryDocRef);

      let availableTents = 24;
      let availableChairs = 600;
      let tentsInUse = 0;
      let chairsInUse = 0;

      if (inventorySnap.exists()) {
        const data = inventorySnap.data();
        availableTents = data.availableTents || 24;
        availableChairs = data.availableChairs || 600;
        tentsInUse = data.tentsInUse || 0;
        chairsInUse = data.chairsInUse || 0;
      }

      // Update DOM
      document.getElementById('availableTentsCount').textContent = availableTents;
      document.getElementById('availableChairsCount').textContent = availableChairs;
      document.getElementById('tentsInUseCount').textContent = tentsInUse;
      document.getElementById('chairsInUseCount').textContent = chairsInUse;

      console.log(`📊 Stats updated - Tents: ${availableTents} avail, ${tentsInUse} in use | Chairs: ${availableChairs} avail, ${chairsInUse} in use`);
      
    } catch (error) {
      console.error('❌ Error updating stats:', error);
    }
  }

  // Export to CSV
  window.exportToCSV = function() {
    console.log('📥 Exporting to CSV...');

    if (filteredRequests.length === 0) {
      showConfirmModal('No data', 'No requests to export.', null, true);
      return;
    }

  // CSV headers
  let csvContent = 'Submitted On,Name,Start Date,End Date,Chairs,Tents,Delivery,Address,Status,Remarks\n';

    // CSV rows
    filteredRequests.forEach(req => {
      const submittedDate = req.createdAt ? new Date(req.createdAt.toDate()).toLocaleDateString() : 'N/A';
      const name = (req.fullName || 'Unknown').replace(/,/g, ';'); // Escape commas
      const startDate = req.startDate || 'N/A';
      const endDate = req.endDate || 'N/A';
      const chairs = req.quantityChairs || 0;
      const tents = req.quantityTents || 0;
      const mode = req.modeOfReceiving || 'N/A';
      const address = (req.completeAddress || 'N/A').replace(/,/g, ';'); // Escape commas
      const status = req.status || 'pending';

      // include remarks (escape commas)
      const remark = (req.rejectionReason || req.remarks || '').replace(/,/g, ';').replace(/"/g, '""');
      csvContent += `${submittedDate},${name},${startDate},${endDate},${chairs},${tents},${mode},${address},${status},"${remark}"\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tents-chairs-requests-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ CSV export complete');
  };

  // Event listeners for tabs
  document.querySelectorAll('.tents-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tents-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      currentTab = tab.textContent.toLowerCase().includes('history') ? 'history' : 'all';
      console.log(`🔄 Switched to ${currentTab} tab`);
      applyFilters();
    });
  });

  // Event listeners for view toggle
  document.querySelectorAll('.tents-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tents-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentView = btn.id === 'tableViewBtn' ? 'table' : 'calendar';
      console.log(`🔄 Switched to ${currentView} view`);
      applyFilters();
    });
  });

  // Event listeners for filters
  // Attach listeners to both legacy and current IDs
  document.getElementById('tentsSearchInput')?.addEventListener('input', applyFilters);
  document.getElementById('searchInput')?.addEventListener('input', applyFilters);

  document.getElementById('tentsStatusFilter')?.addEventListener('change', applyFilters);
  document.getElementById('statusFilter')?.addEventListener('change', applyFilters);

  document.getElementById('tentsDateFilter')?.addEventListener('change', applyFilters);
  document.getElementById('dateFilter')?.addEventListener('change', applyFilters);

  document.getElementById('tentsModeFilter')?.addEventListener('change', applyFilters);
  document.getElementById('deliveryFilter')?.addEventListener('change', applyFilters);

  // Export dropdown toggle
  document.getElementById('exportBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('exportDropdown');
    dropdown?.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    document.getElementById('exportDropdown')?.classList.remove('active');
  });

  // Modal close
  document.getElementById('tentsModalClose')?.addEventListener('click', () => {
    document.getElementById('tentsModal')?.classList.remove('active');
  });

  // Close modal when clicking overlay
  document.getElementById('tentsModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'tentsModal') {
      e.target.classList.remove('active');
    }
  });

  // Initialize on page load
  initializeInventory().then(() => {
    loadTentsRequests();
    updateStats();
  });
}
