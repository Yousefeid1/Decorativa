/* ===== MARBLEFLOW ERP — APPLICATION LOGIC ===== */

// ===== STATE =====
const APP = {
  currentUser: null,
  currentModule: 'dashboard',
  currentLang: 'en',
  data: {
    products: [],
    warehouses: [],
    movements: [],
    batches: [],
    orders: [],
    shipments: [],
    contracts: [],
    customers: [],
    leads: [],
    complaints: [],
    invoices: [],
    expenses: [],
    employees: [],
    users: [],
    auditLog: [],
    notifications: []
  }
};

// ===== USERS/AUTH =====
const USERS_DB = [
  { email: 'admin@marbleflow.com', password: 'admin123', name: 'Admin User', role: 'Company Owner', avatar: 'A', dept: 'Management' },
  { email: 'sales@marbleflow.com', password: 'sales123', name: 'Sara Ahmed', role: 'Department Manager', avatar: 'S', dept: 'Sales' },
  { email: 'emp@marbleflow.com', password: 'emp123', name: 'Omar Khalil', role: 'Employee', avatar: 'O', dept: 'Inventory' }
];

// ===== RBAC =====
const RBAC = {
  'Company Owner': { modules: ['dashboard','inventory','sales','crm','accounting','analytics','hr','users','settings'], canDelete: true, canEditFinance: true, seeAllUsers: true, canApprove: true },
  'Admin':         { modules: ['dashboard','inventory','sales','crm','accounting','analytics','hr','users','settings'], canDelete: true, canEditFinance: true, seeAllUsers: true, canApprove: true },
  'Department Manager': { modules: ['dashboard','inventory','sales','crm','accounting','analytics','hr'], canDelete: false, canEditFinance: true, seeAllUsers: false, canApprove: true },
  'Employee':      { modules: ['dashboard','inventory','sales'], canDelete: false, canEditFinance: false, seeAllUsers: false, canApprove: false }
};

function hasPermission(action) {
  if (!APP.currentUser) return false;
  const perms = RBAC[APP.currentUser.role];
  return perms ? !!perms[action] : false;
}

function canAccessModule(mod) {
  if (!APP.currentUser) return false;
  const perms = RBAC[APP.currentUser.role];
  return perms ? perms.modules.includes(mod) : false;
}

function applyRBAC() {
  // Filter nav items
  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    const mod = item.getAttribute('data-module');
    item.style.display = canAccessModule(mod) ? '' : 'none';
  });
  // Hide delete buttons for non-admins
  if (!hasPermission('canDelete')) {
    document.querySelectorAll('.btn-danger').forEach(btn => btn.style.display = 'none');
  }
  // HR salary: hide for non-admins
  if (!hasPermission('canEditFinance')) {
    document.querySelectorAll('[data-sensitive="salary"]').forEach(el => { el.textContent = '••••'; });
  }
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const user = USERS_DB.find(u => u.email === email && u.password === pass);
  if (!user) { showToast('error', 'Login Failed', 'Invalid email or password.'); return; }
  APP.currentUser = user;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-role').textContent = user.role;
  document.getElementById('user-avatar').textContent = user.avatar;
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  seedData();
  applyRBAC();
  initDashboard();
  showToast('success', 'Welcome Back!', `Logged in as ${user.name}`);
  logAudit('Login', 'Auth', `User logged in from ${getRandomIP()}`);
}

function doLogout() {
  logAudit('Logout', 'Auth', 'User logged out');
  APP.currentUser = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
}

// ===== SEED DATA =====
function seedData() {
  APP.data.products = [
    { id: 'P001', name: 'Carrara White Marble', type: 'Marble', color: 'White', size: '60×60', quality: 'Premium A+', stock: 320, price: 85, warehouse: 'Main Factory', usage: 'Export', supplier: 'Carrara Marmi SRL', minStock: 50, origin: 'Italy', notes: 'Top export grade' },
    { id: 'P002', name: 'Black Galaxy Granite', type: 'Granite', color: 'Black/Gold', size: '60×60', quality: 'Grade A', stock: 210, price: 72, warehouse: 'Cairo Showroom', usage: 'Both', supplier: 'India Stone Co.', minStock: 40, origin: 'India', notes: '' },
    { id: 'P003', name: 'Emperador Brown', type: 'Marble', color: 'Brown', size: '30×60', quality: 'Grade A', stock: 145, price: 95, warehouse: 'Main Factory', usage: 'Export', supplier: 'Spanish Stone Inc.', minStock: 60, origin: 'Spain', notes: 'High demand from EU' },
    { id: 'P004', name: 'Crema Marfil', type: 'Marble', color: 'Cream', size: '40×40', quality: 'Grade B', stock: 38, price: 58, warehouse: 'Alexandria Store', usage: 'Local', supplier: 'Cairo Stone', minStock: 50, origin: 'Egypt', notes: 'Low stock alert' },
    { id: 'P005', name: 'Absolute Black Granite', type: 'Granite', color: 'Black', size: '60×60', quality: 'Premium A+', stock: 180, price: 110, warehouse: 'Main Factory', usage: 'Export', supplier: 'South Africa Minerals', minStock: 30, origin: 'South Africa', notes: '' },
    { id: 'P006', name: 'Rosso Verona', type: 'Marble', color: 'Red', size: '30×30', quality: 'Grade A', stock: 92, price: 78, warehouse: 'External Storage A', usage: 'Export', supplier: 'Verona Marmi', minStock: 40, origin: 'Italy', notes: '' },
    { id: 'P007', name: 'Turkish Beige Travertine', type: 'Travertine', color: 'Beige', size: '40×60', quality: 'Grade A', stock: 22, price: 65, warehouse: 'Cairo Showroom', usage: 'Both', supplier: 'Afyon Stone Turkey', minStock: 35, origin: 'Turkey', notes: 'Critical low stock' },
    { id: 'P008', name: 'Green Onyx', type: 'Onyx', color: 'Green', size: '30×30', quality: 'Premium A+', stock: 55, price: 190, warehouse: 'Main Factory', usage: 'Export', supplier: 'Pakistan Onyx Ltd', minStock: 20, origin: 'Pakistan', notes: 'Premium collector item' }
  ];

  APP.data.warehouses = [
    { id: 'W001', name: 'Main Factory', location: 'Shaq El-Thoban, Cairo', capacity: 5000, used: 3820, products: 4, manager: 'Hassan Ali' },
    { id: 'W002', name: 'Cairo Showroom', location: 'Nasr City, Cairo', capacity: 800, used: 590, products: 3, manager: 'Mona Samir' },
    { id: 'W003', name: 'Alexandria Store', location: 'Alexandria Industrial Zone', capacity: 1200, used: 380, products: 2, manager: 'Karim Adel' },
    { id: 'W004', name: 'External Storage A', location: '10th of Ramadan City', capacity: 2000, used: 920, products: 1, manager: 'Tariq Badr' }
  ];

  APP.data.movements = [
    { date: '2024-11-15', product: 'Carrara White Marble', type: 'Inbound', qty: 200, from: 'Supplier', to: 'Main Factory', ref: 'PO-2024-088', user: 'Omar Khalil' },
    { date: '2024-11-14', product: 'Black Galaxy Granite', type: 'Outbound', qty: 80, from: 'Cairo Showroom', to: 'Customer', ref: 'ORD-2024-234', user: 'Sara Ahmed' },
    { date: '2024-11-14', product: 'Emperador Brown', type: 'Outbound', qty: 50, from: 'Main Factory', to: 'Customer', ref: 'ORD-2024-235', user: 'Sara Ahmed' },
    { date: '2024-11-13', product: 'Crema Marfil', type: 'Transfer', qty: 30, from: 'Main Factory', to: 'Alexandria Store', ref: 'TRF-2024-012', user: 'Omar Khalil' },
    { date: '2024-11-12', product: 'Green Onyx', type: 'Inbound', qty: 40, from: 'Supplier', to: 'Main Factory', ref: 'PO-2024-089', user: 'Omar Khalil' }
  ];

  APP.data.batches = [
    { id: 'B-2024-0881', product: 'Carrara White Marble', qty: 200, date: '2024-11-15', quality: 'Premium A+', warehouse: 'Main Factory', origin: 'Italy' },
    { id: 'B-2024-0880', product: 'Black Galaxy Granite', qty: 150, date: '2024-11-10', quality: 'Grade A', warehouse: 'Cairo Showroom', origin: 'India' },
    { id: 'B-2024-0879', product: 'Absolute Black Granite', qty: 180, date: '2024-11-05', quality: 'Premium A+', warehouse: 'Main Factory', origin: 'South Africa' },
    { id: 'B-2024-0878', product: 'Green Onyx', qty: 55, date: '2024-11-01', quality: 'Premium A+', warehouse: 'Main Factory', origin: 'Pakistan' }
  ];

  APP.data.orders = [
    { id: 'ORD-2024-240', customer: 'Marco Rossi', product: 'Carrara White Marble', qty: 120, total: '$10,200', status: 'Shipped', type: 'Export', date: '2024-11-10' },
    { id: 'ORD-2024-239', customer: 'Sarah Williams', product: 'Black Galaxy Granite', qty: 80, total: '$5,760', status: 'Delivered', type: 'Export', date: '2024-11-08' },
    { id: 'ORD-2024-238', customer: 'Ahmed Hassan', product: 'Crema Marfil', qty: 50, total: '$2,900', status: 'Preparing', type: 'Local', date: '2024-11-14' },
    { id: 'ORD-2024-237', customer: 'Liu Wei', product: 'Green Onyx', qty: 30, total: '$5,700', status: 'Paid', type: 'Export', date: '2024-11-05' },
    { id: 'ORD-2024-236', customer: 'Hans Mueller', product: 'Emperador Brown', qty: 100, total: '$9,500', status: 'Preparing', type: 'Export', date: '2024-11-15' },
    { id: 'ORD-2024-235', customer: 'Fatima Al-Sayed', product: 'Rosso Verona', qty: 60, total: '$4,680', status: 'Shipped', type: 'Export', date: '2024-11-09' },
    { id: 'ORD-2024-234', customer: 'Carlos Mendez', product: 'Absolute Black', qty: 90, total: '$9,900', status: 'Preparing', type: 'Export', date: '2024-11-13' }
  ];

  APP.data.shipments = [
    { id: 'SHP-2024-088', order: 'ORD-2024-240', customer: 'Marco Rossi (Italy)', product: 'Carrara White Marble', qty: '120 m²', method: 'Sea Freight', port: 'Alexandria → Genoa', status: 'In Transit', progress: 60 },
    { id: 'SHP-2024-087', order: 'ORD-2024-235', customer: 'Fatima Al-Sayed (UAE)', product: 'Rosso Verona', qty: '60 m²', method: 'Sea Freight', port: 'Alexandria → Dubai', status: 'Delivered', progress: 100 },
    { id: 'SHP-2024-086', order: 'ORD-2024-237', customer: 'Liu Wei (China)', product: 'Green Onyx', qty: '30 m²', method: 'Air Freight', port: 'Cairo Airport → Shanghai', status: 'Preparing', progress: 20 }
  ];

  APP.data.contracts = [
    { id: 'CTR-2024-015', customer: 'Marco Rossi', title: 'Annual Supply Agreement – Carrara Marble', value: '$120,000', date: '2024-01-10', expires: '2024-12-31', status: 'Active' },
    { id: 'CTR-2024-014', customer: 'Liu Wei Trading Co.', title: 'Exclusive Export Contract – Onyx Range', value: '$85,000', date: '2024-03-15', expires: '2025-03-14', status: 'Active' },
    { id: 'CTR-2024-013', customer: 'Sarah Williams Interiors', title: 'Interior Design Supply – Multiple Products', value: '$42,000', date: '2024-06-01', expires: '2024-11-30', status: 'Expiring' }
  ];

  APP.data.customers = [
    { id: 'C001', name: 'Marco Rossi', company: 'Rossi Marble Italia', email: 'marco@rossimarbel.it', phone: '+39 333 1234567', country: 'Italy', type: 'VIP', reliability: 'Excellent', orders: 24, totalValue: '$142,800', points: 1420, tier: 'Gold' },
    { id: 'C002', name: 'Sarah Williams', company: 'Williams Interior Design', email: 'sarah@wid.com', phone: '+1 555 2345678', country: 'USA', type: 'International', reliability: 'Good', orders: 12, totalValue: '$68,400', points: 684, tier: 'Silver' },
    { id: 'C003', name: 'Ahmed Hassan', company: 'Hassan Construction', email: 'a.hassan@hconstruct.eg', phone: '+20 1001234567', country: 'Egypt', type: 'Local', reliability: 'Excellent', orders: 18, totalValue: '$32,400', points: 324, tier: 'Bronze' },
    { id: 'C004', name: 'Liu Wei', company: 'Wei Import Export', email: 'liu.wei@weiimport.cn', phone: '+86 138 0000 1234', country: 'China', type: 'Wholesale', reliability: 'Good', orders: 8, totalValue: '$96,000', points: 960, tier: 'Gold' },
    { id: 'C005', name: 'Hans Mueller', company: 'Mueller Bau GmbH', email: 'h.mueller@muellerbau.de', phone: '+49 30 12345678', country: 'Germany', type: 'International', reliability: 'Excellent', orders: 15, totalValue: '$118,500', points: 1185, tier: 'Platinum' },
    { id: 'C006', name: 'Fatima Al-Sayed', company: 'Al-Sayed Interiors LLC', email: 'fatima@alsayed.ae', phone: '+971 50 1234567', country: 'UAE', type: 'VIP', reliability: 'Excellent', orders: 20, totalValue: '$85,600', points: 856, tier: 'Gold' }
  ];

  APP.data.leads = [
    { id: 'L001', name: 'Pierre Dupont', company: 'Dupont Maison', country: 'France', status: 'New', value: '$45,000', date: '2024-11-10' },
    { id: 'L002', name: 'Yuki Tanaka', company: 'Tanaka Design Tokyo', country: 'Japan', status: 'Contacted', value: '$80,000', date: '2024-11-08' },
    { id: 'L003', name: 'Robert Brown', company: 'Brown Homes UK', country: 'UK', status: 'Proposal', value: '$120,000', date: '2024-11-05' },
    { id: 'L004', name: 'Anna Kowalski', company: 'Kowalski Architektura', country: 'Poland', status: 'Negotiation', value: '$65,000', date: '2024-11-01' },
    { id: 'L005', name: 'Carlos Vega', company: 'Vega Constructora', country: 'Spain', status: 'Won', value: '$95,000', date: '2024-10-28' }
  ];

  APP.data.complaints = [
    { id: 'COMP-001', customer: 'Ahmed Hassan', subject: 'Cracked tiles in Batch B-2024-0870', priority: 'High', status: 'In Progress', date: '2024-11-10', assigned: 'Sara Ahmed' },
    { id: 'COMP-002', customer: 'Sarah Williams', subject: 'Delivery delayed by 5 days', priority: 'Medium', status: 'Resolved', date: '2024-11-08', assigned: 'Omar Khalil' },
    { id: 'COMP-003', customer: 'Liu Wei', subject: 'Color variation in Onyx batch', priority: 'Low', status: 'Open', date: '2024-11-14', assigned: 'Sara Ahmed' }
  ];

  APP.data.invoices = [
    { id: 'INV-2024-088', customer: 'Marco Rossi', amount: '$10,200', currency: 'USD', due: '2024-12-10', status: 'Sent', method: 'Bank Transfer' },
    { id: 'INV-2024-087', customer: 'Liu Wei', amount: '$5,700', currency: 'USD', due: '2024-11-30', status: 'Paid', method: 'Bank Transfer' },
    { id: 'INV-2024-086', customer: 'Sarah Williams', amount: '$5,760', currency: 'USD', due: '2024-11-20', status: 'Overdue', method: 'Letter of Credit' },
    { id: 'INV-2024-085', customer: 'Hans Mueller', amount: '$9,500', currency: 'EUR', due: '2024-12-15', status: 'Draft', method: 'Bank Transfer' },
    { id: 'INV-2024-084', customer: 'Ahmed Hassan', amount: '$2,900', currency: 'EGP', due: '2024-12-01', status: 'Paid', method: 'Cash' }
  ];

  APP.data.expenses = [
    { type: 'Shipping', amount: '$2,400', desc: 'Sea freight – SHP-2024-088 to Genoa', date: '2024-11-10' },
    { type: 'Insurance', amount: '$480', desc: 'Cargo insurance for SHP-2024-088', date: '2024-11-10' },
    { type: 'Customs', amount: '$1,200', desc: 'Export customs fees – November batch', date: '2024-11-05' },
    { type: 'Storage', amount: '$650', desc: 'External Storage A – November rent', date: '2024-11-01' },
    { type: 'Shipping', amount: '$1,800', desc: 'Air freight – SHP-2024-086 to Shanghai', date: '2024-11-08' }
  ];

  APP.data.employees = [
    { id: 'E001', name: 'Sara Ahmed', title: 'Sales Manager', dept: 'Sales', email: 'sara@marbleflow.com', phone: '+20 1001111111', salary: 'EGP 18,000', hire: '2021-03-15', role: 'Department Manager', perf: 95 },
    { id: 'E002', name: 'Omar Khalil', title: 'Inventory Controller', dept: 'Inventory', email: 'omar@marbleflow.com', phone: '+20 1002222222', salary: 'EGP 12,000', hire: '2022-06-01', role: 'Employee', perf: 88 },
    { id: 'E003', name: 'Nour El-Din', title: 'Finance Officer', dept: 'Finance', email: 'nour@marbleflow.com', phone: '+20 1003333333', salary: 'EGP 14,000', hire: '2020-09-10', role: 'Employee', perf: 92 },
    { id: 'E004', name: 'Karim Adel', title: 'Warehouse Supervisor', dept: 'Operations', email: 'karim@marbleflow.com', phone: '+20 1004444444', salary: 'EGP 10,500', hire: '2023-01-20', role: 'Employee', perf: 84 }
  ];

  APP.data.users = [
    { id: 'U001', name: 'Admin User', email: 'admin@marbleflow.com', role: 'Company Owner', dept: 'Management', status: 'Active', lastLogin: '2024-11-15' },
    { id: 'U002', name: 'Sara Ahmed', email: 'sales@marbleflow.com', role: 'Department Manager', dept: 'Sales', status: 'Active', lastLogin: '2024-11-14' },
    { id: 'U003', name: 'Omar Khalil', email: 'emp@marbleflow.com', role: 'Employee', dept: 'Inventory', status: 'Active', lastLogin: '2024-11-15' }
  ];

  APP.data.notifications = [
    { type: 'warning', icon: '⚠️', title: 'Low Stock Alert: Crema Marfil', msg: 'Only 38 m² remaining (min: 50 m²)', time: '2 hours ago' },
    { type: 'warning', icon: '⚠️', title: 'Low Stock Alert: Turkish Beige Travertine', msg: 'Only 22 m² remaining (min: 35 m²)', time: '3 hours ago' },
    { type: 'error', icon: '🔴', title: 'Overdue Invoice: INV-2024-086', msg: 'Sarah Williams owes $5,760 – 3 days overdue', time: '1 day ago' },
    { type: 'success', icon: '✅', title: 'Order Delivered: ORD-2024-239', msg: 'Sarah Williams received her order in the USA', time: '2 days ago' },
    { type: 'info', icon: 'ℹ️', title: 'New Lead: Robert Brown (UK)', msg: 'Potential order value: $120,000', time: '3 days ago' }
  ];

  APP.data.auditLog = [
    { time: '2024-11-15 09:14', user: 'Admin User', action: 'Logged in', module: 'Auth', details: 'Successful login', ip: '192.168.1.100' },
    { time: '2024-11-15 09:18', user: 'Sara Ahmed', action: 'Created Order', module: 'Sales', details: 'ORD-2024-240 for Marco Rossi', ip: '192.168.1.101' },
    { time: '2024-11-15 10:05', user: 'Omar Khalil', action: 'Stock Movement', module: 'Inventory', details: 'Received 200 m² Carrara White Marble', ip: '192.168.1.102' },
    { time: '2024-11-14 14:30', user: 'Nour El-Din', action: 'Invoice Created', module: 'Accounting', details: 'INV-2024-088 for $10,200', ip: '192.168.1.103' },
    { time: '2024-11-14 11:20', user: 'Sara Ahmed', action: 'Customer Added', module: 'CRM', details: 'New customer: Hans Mueller (Germany)', ip: '192.168.1.101' }
  ];

  renderAllModules();
  renderNotifications();
}

// ===== MODULE NAVIGATION =====
function showModule(name) {
  if (!canAccessModule(name)) {
    showToast('error', 'Access Denied', 'You do not have permission to access this module.');
    return;
  }
  document.querySelectorAll('.module').forEach(m => { m.classList.remove('active'); m.classList.add('hidden'); });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const mod = document.getElementById('module-' + name);
  if (mod) { mod.classList.remove('hidden'); mod.classList.add('active'); }
  document.querySelector(`.nav-item[data-module="${name}"]`)?.classList.add('active');

  const labels = { dashboard: 'Dashboard', inventory: 'Inventory Management', sales: 'Sales & Export', crm: 'CRM & Customers', accounting: 'Accounting & Finance', analytics: 'Analytics & Reporting', hr: 'Human Resources', users: 'Users & Access', settings: 'System Settings' };
  document.getElementById('breadcrumb').textContent = labels[name] || name;
  APP.currentModule = name;
  logAudit('View', name, `Navigated to ${labels[name]}`);

  // Render charts on demand
  if (name === 'analytics') setTimeout(renderAnalyticsCharts, 100);
}

function showTab(module, tab) {
  // Resolve 'acc' alias to 'accounting' so HTML uses compact 'acc' shorthand
  // while the actual module element is 'module-accounting'
  const moduleAliases = { acc: 'accounting' };
  const resolvedModule = moduleAliases[module] || module;

  const modEl = document.getElementById('module-' + resolvedModule);
  if (!modEl) return;
  modEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  modEl.querySelectorAll('.tab-content').forEach(c => { c.classList.remove('active'); c.style.display = 'none'; });

  // Tab ID map — 'acc' and 'accounting' both resolve to acc-* IDs
  const tabMap = {
    inventory:  { products: 'inv-products', warehouses: 'inv-warehouses', movements: 'inv-movements', batches: 'inv-batches' },
    sales:      { orders: 'sales-orders', shipments: 'sales-shipments', contracts: 'sales-contracts', pricing: 'sales-pricing' },
    crm:        { customers: 'crm-customers', leads: 'crm-leads', complaints: 'crm-complaints', loyalty: 'crm-loyalty' },
    accounting: { invoices: 'acc-invoices', payments: 'acc-payments', expenses: 'acc-expenses', reports: 'acc-reports' },
    hr:         { employees: 'hr-employees', attendance: 'hr-attendance', payroll: 'hr-payroll', leaves: 'hr-leaves' },
    users:      { list: 'users-list', roles: 'users-roles', audit: 'users-audit' }
  };

  const tabId = (tabMap[resolvedModule] || {})[tab] || '';
  if (tabId) {
    const el = document.getElementById(tabId);
    if (el) { el.classList.add('active'); el.style.display = 'block'; }
    modEl.querySelectorAll('.tab-btn').forEach(b => { if (b.getAttribute('data-tab') === tabId) b.classList.add('active'); });
  }
}

// ===== RENDER ALL MODULES =====
function renderAllModules() {
  renderInventoryTable();
  renderWarehouses();
  renderMovements();
  renderBatches();
  renderOrders();
  renderShipments();
  renderContracts();
  renderPricingRules();
  renderCustomers();
  renderLeads();
  renderComplaints();
  renderLoyalty();
  renderInvoices();
  renderExpenses();
  renderPaymentsSummary();
  renderFinancialReports();
  renderEmployees();
  renderAttendance();
  renderPayroll();
  renderLeaves();
  renderUsers();
  renderRoles();
  renderAuditLog();
  renderNotifications();
  renderWarehouseSettings();
}

// ===== DASHBOARD =====
function initDashboard() {
  // Activity log
  const logs = [
    { color: '#c9a96e', action: 'New Order Created: ORD-2024-240 — Marco Rossi, 120 m² Carrara White', meta: 'Sara Ahmed • Sales • 2 hours ago' },
    { color: '#60a5fa', action: 'Stock Received: 200 m² Carrara White Marble at Main Factory', meta: 'Omar Khalil • Inventory • 3 hours ago' },
    { color: '#4ade80', action: 'Invoice Paid: INV-2024-087 — Liu Wei, $5,700', meta: 'Nour El-Din • Finance • 1 day ago' },
    { color: '#f87171', action: 'Low Stock Alert: Turkish Beige Travertine — 22 m² remaining', meta: 'System • Inventory • 3 hours ago' },
    { color: '#c9a96e', action: 'New Customer Added: Hans Mueller — Mueller Bau GmbH (Germany)', meta: 'Sara Ahmed • CRM • 1 day ago' },
    { color: '#4ade80', action: 'Shipment Delivered: SHP-2024-087 — Rosso Verona to Dubai', meta: 'System • Logistics • 2 days ago' }
  ];
  const logEl = document.getElementById('activity-log');
  logEl.innerHTML = logs.map(l => `
    <div class="log-item">
      <div class="log-dot" style="background:${l.color}"></div>
      <div class="log-body">
        <div class="log-action">${l.action}</div>
        <div class="log-meta">${l.meta}</div>
      </div>
    </div>`).join('');

  // Top customers
  const top = [
    { name: 'Marco Rossi', sub: 'Italy • $142,800 total', pct: 100 },
    { name: 'Hans Mueller', sub: 'Germany • $118,500 total', pct: 83 },
    { name: 'Liu Wei', sub: 'China • $96,000 total', pct: 67 },
    { name: 'Fatima Al-Sayed', sub: 'UAE • $85,600 total', pct: 60 },
    { name: 'Sarah Williams', sub: 'USA • $68,400 total', pct: 48 }
  ];
  document.getElementById('top-customers-list').innerHTML = top.map((t, i) => `
    <div class="top-item">
      <div class="top-rank">#${i+1}</div>
      <div class="top-info">
        <div class="top-name">${t.name}</div>
        <div class="top-sub">${t.sub}</div>
      </div>
      <div class="top-bar-track"><div class="top-bar-fill" style="width:${t.pct}%"></div></div>
    </div>`).join('');

  // Alerts
  const alerts = [
    { cls: 'critical', icon: '🔴', title: 'Overdue Invoice: Sarah Williams', text: '$5,760 overdue — 3 days past due' },
    { cls: 'warning', icon: '⚠️', title: 'Low Stock: Turkish Beige Travertine', text: '22 m² remaining (min 35 m²)' },
    { cls: 'warning', icon: '⚠️', title: 'Low Stock: Crema Marfil', text: '38 m² remaining (min 50 m²)' },
    { cls: 'info', icon: 'ℹ️', title: 'Contract Expiring: Rossi Annual', text: 'Expires 2024-12-31 — 47 days left' },
    { cls: 'info', icon: 'ℹ️', title: 'New Lead: Robert Brown (UK)', text: 'Potential $120,000 — follow up needed' }
  ];
  document.getElementById('alerts-list').innerHTML = alerts.map(a => `
    <div class="alert-item ${a.cls}">
      <div class="alert-icon">${a.icon}</div>
      <div class="alert-text"><strong>${a.title}</strong>${a.text}</div>
    </div>`).join('');

  // Charts
  setTimeout(renderDashboardCharts, 100);
}

let dashCharts = {};

function renderDashboardCharts() {
  // Revenue chart
  const rCtx = document.getElementById('revenue-chart');
  if (!rCtx) return;
  if (dashCharts.revenue) dashCharts.revenue.destroy();
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const rev = [185000, 210000, 195000, 240000, 228000, 265000, 290000, 275000, 312000, 295000, 340000, 284500];
  dashCharts.revenue = new Chart(rCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Revenue (USD)',
        data: rev,
        borderColor: '#c9a96e',
        backgroundColor: 'rgba(201,169,110,0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#c9a96e',
        pointRadius: 4,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 }, callback: v => '$' + (v/1000).toFixed(0) + 'k' } }
      }
    }
  });

  // Stock chart
  const sCtx = document.getElementById('stock-chart');
  if (dashCharts.stock) dashCharts.stock.destroy();
  dashCharts.stock = new Chart(sCtx, {
    type: 'doughnut',
    data: {
      labels: ['Marble', 'Granite', 'Travertine', 'Onyx', 'Limestone'],
      datasets: [{ data: [595, 390, 22, 55, 178], backgroundColor: ['#c9a96e','#60a5fa','#4ade80','#f87171','#a78bfa'], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 }, boxWidth: 12 } } },
      cutout: '65%'
    }
  });

  // Order Status chart
  const oCtx = document.getElementById('order-status-chart');
  if (dashCharts.orderStatus) dashCharts.orderStatus.destroy();
  dashCharts.orderStatus = new Chart(oCtx, {
    type: 'bar',
    data: {
      labels: ['Preparing', 'Shipped', 'Delivered', 'Paid', 'Cancelled'],
      datasets: [{ data: [13, 5, 18, 9, 2], backgroundColor: ['#c9a96e', '#60a5fa', '#4ade80', '#a78bfa', '#f87171'], borderRadius: 6, borderWidth: 0 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } }
      }
    }
  });
}

function updateRevenueChart(months) {
  const allMonths = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  const allRev   = [185000, 210000, 195000, 240000, 228000, 265000, 290000, 275000, 312000, 295000, 340000, 284500];
  const n = parseInt(months) || 12;
  const labels = allMonths.slice(-n);
  const data   = allRev.slice(-n);
  const chart = dashCharts.revenue;
  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

// ===== ANALYTICS CHARTS =====
let analCharts = {};

function renderAnalyticsCharts() {
  // Sales performance
  const sp = document.getElementById('sales-perf-chart');
  if (!sp) return;
  if (analCharts.salesPerf) analCharts.salesPerf.destroy();
  analCharts.salesPerf = new Chart(sp, {
    type: 'bar',
    data: {
      labels: ['Carrara White', 'Black Galaxy', 'Emperador', 'Crema Marfil', 'Abs. Black', 'Rosso Verona', 'Travertine', 'Green Onyx'],
      datasets: [
        { label: 'Sold (m²)', data: [480, 320, 280, 180, 220, 150, 90, 75], backgroundColor: '#c9a96e', borderRadius: 6 },
        { label: 'Revenue ($k)', data: [40.8, 23.0, 26.6, 10.4, 24.2, 11.7, 5.9, 14.3], backgroundColor: '#60a5fa', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8a8fa8', font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } }
      }
    }
  });

  // Revenue by country
  const cc = document.getElementById('country-chart');
  if (analCharts.country) analCharts.country.destroy();
  analCharts.country = new Chart(cc, {
    type: 'pie',
    data: {
      labels: ['Italy', 'Germany', 'China', 'UAE', 'USA', 'Egypt', 'Other'],
      datasets: [{ data: [28, 23, 19, 14, 8, 5, 3], backgroundColor: ['#c9a96e','#60a5fa','#4ade80','#f87171','#a78bfa','#fbbf24','#64748b'], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 }, boxWidth: 12 } } }
    }
  });

  // Stock velocity
  const vc = document.getElementById('velocity-chart');
  if (analCharts.velocity) analCharts.velocity.destroy();
  analCharts.velocity = new Chart(vc, {
    type: 'bar',
    data: {
      labels: ['Carrara White', 'Abs. Black', 'Emperador', 'Black Galaxy', 'Rosso Verona', 'Green Onyx', 'Travertine', 'Crema Marfil'],
      datasets: [{ data: [95, 88, 82, 76, 65, 58, 42, 30], backgroundColor: '#c9a96e', borderRadius: 4 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 10 } } },
        y: { grid: { display: false }, ticks: { color: '#8a8fa8', font: { size: 11 } } }
      }
    }
  });

  // Forecast
  const fc = document.getElementById('forecast-chart');
  if (analCharts.forecast) analCharts.forecast.destroy();
  const fMonths = ['Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25'];
  analCharts.forecast = new Chart(fc, {
    type: 'line',
    data: {
      labels: fMonths,
      datasets: [
        { label: 'Projected Revenue', data: [310000, 295000, 340000, 380000, 420000, 465000], borderColor: '#c9a96e', backgroundColor: 'rgba(201,169,110,0.06)', fill: true, tension: 0.4, borderWidth: 2, borderDash: [6, 3], pointRadius: 4 },
        { label: 'Projected Orders', data: [52, 48, 58, 65, 72, 80], borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.06)', fill: true, tension: 0.4, borderWidth: 2, borderDash: [6, 3], pointRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a8fa8', font: { family: 'DM Mono', size: 11 } } }
      }
    }
  });

  // Employee performance
  document.getElementById('emp-perf-list').innerHTML = APP.data.employees.map(e => `
    <div class="perf-item">
      <div class="perf-name">${e.name} <small style="color:var(--text-muted)">${e.dept}</small></div>
      <div class="perf-track"><div class="perf-fill" style="width:${e.perf}%"></div></div>
      <div class="perf-score">${e.perf}%</div>
    </div>`).join('');

  // Top products
  const prods = [
    { name: 'Carrara White Marble', val: '$40,800', icon: '⬜' },
    { name: 'Absolute Black Granite', val: '$24,200', icon: '⬛' },
    { name: 'Emperador Brown', val: '$26,600', icon: '🟫' },
    { name: 'Green Onyx', val: '$14,300', icon: '🟩' },
    { name: 'Black Galaxy Granite', val: '$23,040', icon: '🔲' }
  ];
  document.getElementById('top-products-list').innerHTML = prods.map((p, i) => `
    <div class="perf-item">
      <div style="font-size:18px;width:24px">${p.icon}</div>
      <div class="perf-name">${p.name}</div>
      <div class="perf-score">${p.val}</div>
    </div>`).join('');
}

// ===== INVENTORY =====
function renderInventoryTable() {
  const tbody = document.getElementById('inv-tbody');
  if (!tbody) return;
  tbody.innerHTML = APP.data.products.map(p => {
    const isLow = p.stock < p.minStock;
    const statusCls = isLow ? 'badge-red' : p.stock < p.minStock * 1.5 ? 'badge-amber' : 'badge-green';
    const statusText = isLow ? 'Low Stock' : 'In Stock';
    return `<tr>
      <td><strong>${p.name}</strong><br><small style="color:var(--text-muted);font-family:'DM Mono',monospace">${p.id}</small></td>
      <td><span class="badge badge-blue">${p.type}</span></td>
      <td>${p.color}</td>
      <td><span style="font-family:'DM Mono',monospace">${p.size}</span></td>
      <td><span class="badge badge-gold">${p.quality}</span></td>
      <td><strong style="font-family:'DM Mono',monospace;color:${isLow?'var(--ruby)':'var(--text-primary)'}">${p.stock}</strong></td>
      <td><span style="font-family:'DM Mono',monospace">$${p.price}</span></td>
      <td><span class="badge ${p.usage==='Export'?'badge-gold':p.usage==='Local'?'badge-blue':'badge-green'}">${p.usage}</span></td>
      <td>${p.warehouse}</td>
      <td><span class="badge ${statusCls}">${statusText}</span></td>
      <td>
        <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit">✎</button>
        <button class="btn-icon" onclick="viewBatch('${p.id}')" title="View Batch">◈</button>
        <button class="btn-icon btn-danger" onclick="deleteProduct('${p.id}')" title="Delete">✕</button>
      </td>
    </tr>`;
  }).join('');
}

function renderWarehouses() {
  const grid = document.getElementById('warehouse-grid');
  if (!grid) return;
  grid.innerHTML = APP.data.warehouses.map(w => {
    const pct = Math.round((w.used / w.capacity) * 100);
    const barColor = pct > 85 ? '#f87171' : pct > 65 ? '#fbbf24' : '#4ade80';
    return `<div class="warehouse-card">
      <div class="warehouse-name">${w.name}</div>
      <div class="warehouse-location">📍 ${w.location}</div>
      <div class="warehouse-stat"><span>Manager</span><span>${w.manager}</span></div>
      <div class="warehouse-stat"><span>Products</span><span>${w.products} types</span></div>
      <div class="warehouse-stat"><span>Stock Used</span><span>${w.used.toLocaleString()} m²</span></div>
      <div class="capacity-bar">
        <div class="capacity-label"><span>Capacity Utilization</span><span>${pct}%</span></div>
        <div class="capacity-track"><div class="capacity-fill" style="width:${pct}%;background:${barColor}"></div></div>
      </div>
    </div>`;
  }).join('');
}

function renderMovements() {
  const tbody = document.getElementById('mov-tbody');
  if (!tbody) return;
  tbody.innerHTML = APP.data.movements.map(m => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace">${m.date}</span></td>
      <td>${m.product}</td>
      <td><span class="badge ${m.type==='Inbound'?'badge-green':m.type==='Outbound'?'badge-red':m.type==='Transfer'?'badge-blue':'badge-amber'}">${m.type}</span></td>
      <td><strong style="font-family:'DM Mono',monospace">${m.qty}</strong></td>
      <td>${m.from}</td>
      <td>${m.to}</td>
      <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${m.ref}</span></td>
      <td>${m.user}</td>
    </tr>`).join('');
}

function renderBatches() {
  const grid = document.getElementById('batch-grid');
  if (!grid) return;
  grid.innerHTML = APP.data.batches.map(b => `
    <div class="batch-card">
      <div class="batch-qr">▦</div>
      <div class="batch-id">${b.id}</div>
      <div class="batch-name">${b.product}</div>
      <div class="batch-info">${b.qty} m² • ${b.quality}</div>
      <div class="batch-info" style="margin-top:4px">${b.warehouse}</div>
      <div class="batch-info" style="color:var(--text-muted)">${b.origin} • ${b.date}</div>
      <div style="margin-top:10px;display:flex;gap:6px">
        <button class="btn-icon" title="Print QR">⎙</button>
        <button class="btn-icon" title="View History">◷</button>
      </div>
    </div>`).join('');
}

// ===== ORDERS =====
function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  const statMap = { Preparing: 'badge-amber', Shipped: 'badge-blue', Delivered: 'badge-green', Paid: 'badge-gold', Cancelled: 'badge-red' };
  tbody.innerHTML = APP.data.orders.map(o => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${o.id}</span></td>
      <td><strong>${o.customer}</strong></td>
      <td>${o.product}</td>
      <td><span style="font-family:'DM Mono',monospace">${o.qty} m²</span></td>
      <td><strong style="font-family:'DM Mono',monospace">${o.total}</strong></td>
      <td><span class="badge ${statMap[o.status]||'badge-gray'}">${o.status}</span></td>
      <td><span class="badge ${o.type==='Export'?'badge-gold':'badge-blue'}">${o.type}</span></td>
      <td><span style="font-family:'DM Mono',monospace">${o.date}</span></td>
      <td>
        <button class="btn-icon" onclick="viewOrder('${o.id}')" title="View">◉</button>
        <button class="btn-icon" title="Print Invoice">⎙</button>
        <button class="btn-icon" onclick="updateOrderStatus('${o.id}')" title="Update Status">↻</button>
      </td>
    </tr>`).join('');
}

function renderShipments() {
  const el = document.getElementById('shipment-tracker');
  if (!el) return;
  const stepLabels = ['Order Placed', 'Preparing', 'Customs Cleared', 'In Transit', 'Port Arrived', 'Delivered'];
  el.innerHTML = APP.data.shipments.map(s => {
    const steps = Math.round((s.progress / 100) * stepLabels.length);
    return `<div class="shipment-card">
      <div class="shipment-header">
        <div>
          <div class="shipment-id">${s.id} • ${s.order}</div>
          <div class="shipment-title">${s.customer}</div>
          <div style="color:var(--text-muted);font-size:12px;margin-top:4px">${s.product} • ${s.qty} • ${s.method}</div>
          <div style="color:var(--text-muted);font-size:12px">📍 ${s.port}</div>
        </div>
        <span class="badge ${s.status==='Delivered'?'badge-green':s.status==='In Transit'?'badge-blue':'badge-amber'}">${s.status}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%"></div></div>
      <div class="progress-steps">${stepLabels.map((l, i) => `<span class="prog-step ${i < steps ? 'done' : i === steps ? 'current' : ''}">${l}</span>`).join('')}</div>
    </div>`;
  }).join('');
}

function renderContracts() {
  const el = document.getElementById('contracts-list');
  if (!el) return;
  el.innerHTML = APP.data.contracts.map(c => `
    <div class="contract-card">
      <div class="contract-icon">📄</div>
      <div class="contract-info">
        <div class="contract-id">${c.id}</div>
        <div class="contract-title">${c.title}</div>
        <div class="contract-meta">${c.customer} • ${c.value} • Expires: ${c.expires}</div>
      </div>
      <span class="badge ${c.status==='Active'?'badge-green':'badge-amber'}">${c.status}</span>
      <div class="contract-actions">
        <button class="btn-icon" title="Download PDF">⎙</button>
        <button class="btn-icon" title="Edit">✎</button>
      </div>
    </div>`).join('');
}

function renderPricingRules() {
  const el = document.getElementById('pricing-rules');
  if (!el) return;
  const rules = [
    { title: 'Volume Discounts', rules: [['1–99 m²', 'Base price'], ['100–299 m²', '-5% discount'], ['300–599 m²', '-8% discount'], ['600+ m²', '-12% discount']] },
    { title: 'Customer Type', rules: [['VIP Client', '-10%'], ['Wholesale', '-8%'], ['International', 'Base'], ['Local', '+5% markup']] },
    { title: 'Export Surcharges', rules: [['Sea Freight', '+$2.5/m²'], ['Air Freight', '+$8/m²'], ['Insurance', '+0.5% of value'], ['Customs Doc.', '+$150/shipment']] }
  ];
  el.innerHTML = rules.map(r => `
    <div class="pricing-card">
      <h4>${r.title}</h4>
      ${r.rules.map(([k, v]) => `<div class="pricing-rule"><span>${k}</span><span>${v}</span></div>`).join('')}
    </div>`).join('');
}

// ===== CRM =====
function renderCustomers() {
  const el = document.getElementById('customer-cards');
  if (!el) return;
  const tierMap = { Gold: 'tier-gold', Silver: 'tier-silver', Bronze: 'tier-bronze', Platinum: 'tier-platinum' };
  el.innerHTML = APP.data.customers.map(c => `
    <div class="customer-card" onclick="viewCustomer('${c.id}')">
      <div class="customer-card-header">
        <div class="cust-avatar">${c.name[0]}</div>
        <div class="cust-header-info">
          <div class="cust-name">${c.name}</div>
          <div class="cust-company">${c.company}</div>
        </div>
        <span class="badge ${c.type==='VIP'?'badge-gold':c.type==='Wholesale'?'badge-blue':'badge-gray'}">${c.type}</span>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:4px">📍 ${c.country} &nbsp; ✉ ${c.email}</div>
      <div class="cust-stat-row">
        <div class="cust-stat">
          <div class="cust-stat-val">${c.orders}</div>
          <div class="cust-stat-lbl">Orders</div>
        </div>
        <div class="cust-stat">
          <div class="cust-stat-val" style="font-size:14px">${c.totalValue}</div>
          <div class="cust-stat-lbl">Total Value</div>
        </div>
        <div class="cust-stat">
          <div class="cust-stat-val">${c.points}</div>
          <div class="cust-stat-lbl">Points</div>
        </div>
      </div>
    </div>`).join('');
}

function renderLeads() {
  const el = document.getElementById('leads-kanban');
  if (!el) return;
  const stages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won'];
  const colors = { New: '#60a5fa', Contacted: '#fbbf24', Proposal: '#c9a96e', Negotiation: '#a78bfa', Won: '#4ade80' };
  el.innerHTML = stages.map(stage => {
    const leads = APP.data.leads.filter(l => l.status === stage);
    return `<div class="kanban-col">
      <div class="kanban-col-header">
        <span style="color:${colors[stage]}">${stage}</span>
        <span class="nav-badge">${leads.length}</span>
      </div>
      ${leads.map(l => `<div class="kanban-card">
        <div class="kanban-card-name">${l.name}</div>
        <div class="kanban-card-info">${l.company}</div>
        <div class="kanban-card-info" style="margin-top:6px;color:var(--gold)">${l.value}</div>
        <div class="kanban-card-info">📍 ${l.country}</div>
      </div>`).join('')}
    </div>`;
  }).join('');
}

function renderComplaints() {
  const tbody = document.getElementById('complaints-tbody');
  if (!tbody) return;
  const prioMap = { High: 'badge-red', Medium: 'badge-amber', Low: 'badge-blue' };
  const statMap = { Open: 'badge-red', 'In Progress': 'badge-amber', Resolved: 'badge-green' };
  tbody.innerHTML = APP.data.complaints.map(c => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${c.id}</span></td>
      <td>${c.customer}</td>
      <td>${c.subject}</td>
      <td><span class="badge ${prioMap[c.priority]}">${c.priority}</span></td>
      <td><span class="badge ${statMap[c.status]}">${c.status}</span></td>
      <td><span style="font-family:'DM Mono',monospace">${c.date}</span></td>
      <td>${c.assigned}</td>
      <td>
        <button class="btn-icon" title="View">◉</button>
        <button class="btn-icon" title="Resolve">✓</button>
      </td>
    </tr>`).join('');
}

function renderLoyalty() {
  const el = document.getElementById('loyalty-grid');
  if (!el) return;
  const tierMap = { Gold: 'tier-gold', Silver: 'tier-silver', Bronze: 'tier-bronze', Platinum: 'tier-platinum' };
  const maxPoints = { Gold: 2000, Silver: 1000, Bronze: 500, Platinum: 3000 };
  el.innerHTML = APP.data.customers.map(c => `
    <div class="loyalty-card">
      <div class="loyalty-tier">
        <div class="loyalty-name">${c.name}</div>
        <span class="loyalty-tier-badge ${tierMap[c.tier]}">${c.tier}</span>
      </div>
      <div style="font-size:12px;color:var(--text-muted)">${c.company}</div>
      <div class="points-bar-track"><div class="points-bar-fill" style="width:${Math.min(100, (c.points/maxPoints[c.tier])*100)}%"></div></div>
      <div class="points-label">
        <span>${c.points} pts</span>
        <span>Next tier: ${maxPoints[c.tier]} pts</span>
      </div>
    </div>`).join('');
}

// ===== ACCOUNTING =====
function renderInvoices() {
  const tbody = document.getElementById('acc-inv-tbody');
  if (!tbody) return;
  const statMap = { Draft: 'badge-gray', Sent: 'badge-blue', Paid: 'badge-green', Overdue: 'badge-red' };
  // Auto-detect overdue
  const today = new Date().toISOString().split('T')[0];
  APP.data.invoices.forEach(inv => {
    if (inv.status !== 'Paid' && inv.due && inv.due < today) inv.status = 'Overdue';
  });
  tbody.innerHTML = APP.data.invoices.map(inv => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${inv.id}</span></td>
      <td>${inv.customer}</td>
      <td><strong style="font-family:'DM Mono',monospace">${inv.amount}</strong></td>
      <td><span class="badge badge-blue">${inv.currency}</span></td>
      <td><span style="font-family:'DM Mono',monospace">${inv.due}</span></td>
      <td><span class="badge ${statMap[inv.status]}">${inv.status}</span></td>
      <td>${inv.method}</td>
      <td>
        <button class="btn-icon" onclick="printInvoicePDF('${inv.id}')" title="Print PDF">⎙</button>
        ${inv.status !== 'Paid' ? `<button class="btn-icon" onclick="markInvoicePaid('${inv.id}')" title="Mark as Paid">✓</button>` : ''}
        ${inv.status === 'Overdue' || inv.status === 'Sent' ? `<button class="btn-icon" onclick="sendInvoiceReminder('${inv.id}')" title="Send Reminder">✉</button>` : ''}
      </td>
    </tr>`).join('');
}

function renderExpenses() {
  const el = document.getElementById('expenses-grid');
  if (!el) return;
  el.innerHTML = APP.data.expenses.map(e => `
    <div class="expense-card">
      <div class="expense-type">${e.type} • ${e.date}</div>
      <div class="expense-amount">${e.amount}</div>
      <div class="expense-desc">${e.desc}</div>
    </div>`).join('');
}

function renderPaymentsSummary() {
  const el = document.getElementById('payments-summary');
  if (!el) return;
  // Calculate real totals from invoice data
  const today = new Date().toISOString().split('T')[0];
  const parseAmt = s => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
  const paid     = APP.data.invoices.filter(i => i.status === 'Paid').reduce((a, i) => a + parseAmt(i.amount), 0);
  const overdue  = APP.data.invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + parseAmt(i.amount), 0);
  const pending  = APP.data.invoices.filter(i => i.status === 'Sent' || i.status === 'Draft').reduce((a, i) => a + parseAmt(i.amount), 0);
  const expenses = APP.data.expenses.reduce((a, e) => a + parseAmt(e.amount), 0);
  el.innerHTML = `
    <div class="pay-kpi"><div class="pay-kpi-val" style="color:var(--emerald)">$${paid.toLocaleString('en-US',{minimumFractionDigits:2})}</div><div class="pay-kpi-lbl">Total Paid (USD)</div></div>
    <div class="pay-kpi"><div class="pay-kpi-val" style="color:var(--ruby)">$${overdue.toLocaleString('en-US',{minimumFractionDigits:2})}</div><div class="pay-kpi-lbl">Overdue Amount</div></div>
    <div class="pay-kpi"><div class="pay-kpi-val" style="color:var(--amber)">$${pending.toLocaleString('en-US',{minimumFractionDigits:2})}</div><div class="pay-kpi-lbl">Pending Payments</div></div>
    <div class="pay-kpi"><div class="pay-kpi-val">$${expenses.toLocaleString('en-US',{minimumFractionDigits:2})}</div><div class="pay-kpi-lbl">Total Expenses</div></div>
    <div class="pay-kpi"><div class="pay-kpi-val" style="color:var(--gold)">$${(paid - expenses).toLocaleString('en-US',{minimumFractionDigits:2})}</div><div class="pay-kpi-lbl">Net Profit (Est.)</div></div>
    <div class="pay-kpi"><div class="pay-kpi-val">${APP.data.invoices.filter(i=>i.status==='Overdue').length}</div><div class="pay-kpi-lbl">Overdue Invoices</div></div>
  `;
}

function renderFinancialReports() {
  const el = document.getElementById('financial-reports');
  if (!el) return;
  const reports = [
    { icon: '📊', title: 'Monthly P&L Report', desc: 'Profit & Loss for current month' },
    { icon: '📈', title: 'Annual Revenue Report', desc: 'Full year financial summary' },
    { icon: '🚢', title: 'Shipment Cost Analysis', desc: 'Cost breakdown per shipment' },
    { icon: '🧾', title: 'Tax & Customs Report', desc: 'Export duties and customs fees' },
    { icon: '💳', title: 'Payment Aging Report', desc: 'Overdue and upcoming payments' },
    { icon: '📦', title: 'Product Profitability', desc: 'Profit per product/category' }
  ];
  el.innerHTML = reports.map(r => `
    <div class="report-card" onclick="showToast('info','Generating Report','${r.title} is being prepared...')">
      <div class="report-icon">${r.icon}</div>
      <div class="report-title">${r.title}</div>
      <div class="report-desc">${r.desc}</div>
    </div>`).join('');
}

// ===== HR =====
function renderEmployees() {
  const el = document.getElementById('employee-cards');
  if (!el) return;
  const deptColors = { Sales: '#c9a96e', Inventory: '#60a5fa', Finance: '#4ade80', HR: '#a78bfa', Operations: '#fbbf24', Management: '#f87171' };
  el.innerHTML = APP.data.employees.map(e => `
    <div class="employee-card">
      <div class="emp-avatar" style="background:linear-gradient(135deg,${deptColors[e.dept]||'#60a5fa'},rgba(0,0,0,0.3))">${e.name[0]}</div>
      <div class="emp-name">${e.name}</div>
      <div class="emp-title">${e.title}</div>
      <div class="emp-dept">${e.dept} • <span style="color:var(--text-muted)">${e.role}</span></div>
      <div style="margin-top:8px;font-size:11px;color:var(--text-muted)">${e.email}</div>
      <div class="emp-stat-row">
        <div><div class="emp-stat-val">${e.perf}%</div><div class="emp-stat-lbl">Performance</div></div>
        <div><div class="emp-stat-val">${e.salary.split(' ')[1]}</div><div class="emp-stat-lbl">Salary</div></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:6px;justify-content:center">
        <button class="btn-icon" title="Edit Employee">✎</button>
        <button class="btn-icon" title="View Profile">◉</button>
        <button class="btn-icon" title="Payslip">⎙</button>
      </div>
    </div>`).join('');
}

function renderAttendance() {
  const el = document.getElementById('attendance-grid');
  if (!el) return;
  const days = Array.from({length: 15}, (_, i) => i + 1);
  el.innerHTML = APP.data.employees.map(e => {
    const dayHtml = days.map(d => {
      const r = Math.random();
      const cls = r > 0.85 ? 'absent' : r > 0.75 ? 'leave' : 'present';
      return `<div class="att-day ${cls}">${d}</div>`;
    }).join('');
    return `<div class="attendance-row">
      <div class="att-name">${e.name}</div>
      <div class="att-days">${dayHtml}</div>
    </div>`;
  }).join('');
}

function renderPayroll() {
  const el = document.getElementById('payroll-table');
  if (!el) return;
  el.innerHTML = `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Employee</th><th>Department</th><th>Base Salary</th><th>Bonus</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${APP.data.employees.map(e => {
      const base = parseInt(e.salary.replace(/[^0-9]/g,''));
      const bonus = Math.round(base * (e.perf/100 - 0.7) * 0.2);
      const ded = Math.round(base * 0.11);
      const net = base + bonus - ded;
      return `<tr>
        <td><strong>${e.name}</strong></td>
        <td>${e.dept}</td>
        <td style="font-family:'DM Mono',monospace">${e.salary}</td>
        <td style="color:var(--emerald);font-family:'DM Mono',monospace">EGP ${bonus.toLocaleString()}</td>
        <td style="color:var(--ruby);font-family:'DM Mono',monospace">EGP ${ded.toLocaleString()}</td>
        <td><strong style="font-family:'DM Mono',monospace;color:var(--gold)">EGP ${net.toLocaleString()}</strong></td>
        <td><span class="badge badge-green">Processed</span></td>
        <td><button class="btn-icon" title="Print Payslip">⎙</button></td>
      </tr>`;
    }).join('')}</tbody>
  </table></div>`;
}

function renderLeaves() {
  const el = document.getElementById('leaves-table');
  if (!el) return;
  const leaves = [
    { emp: 'Sara Ahmed', type: 'Annual Leave', from: '2024-12-20', to: '2024-12-27', days: 7, status: 'Approved' },
    { emp: 'Omar Khalil', type: 'Sick Leave', from: '2024-11-12', to: '2024-11-13', days: 2, status: 'Approved' },
    { emp: 'Nour El-Din', type: 'Annual Leave', from: '2025-01-05', to: '2025-01-09', days: 5, status: 'Pending' },
    { emp: 'Karim Adel', type: 'Emergency Leave', from: '2024-11-08', to: '2024-11-08', days: 1, status: 'Approved' }
  ];
  el.innerHTML = `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Employee</th><th>Leave Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${leaves.map(l => `<tr>
      <td>${l.emp}</td>
      <td><span class="badge badge-blue">${l.type}</span></td>
      <td style="font-family:'DM Mono',monospace">${l.from}</td>
      <td style="font-family:'DM Mono',monospace">${l.to}</td>
      <td style="font-family:'DM Mono',monospace">${l.days}</td>
      <td><span class="badge ${l.status==='Approved'?'badge-green':'badge-amber'}">${l.status}</span></td>
      <td>
        ${l.status === 'Pending' ? `
          <button class="btn-icon" onclick="approveLeave('${l.emp}','${l.type}')" title="Approve">✓</button>
          <button class="btn-icon btn-danger" onclick="rejectLeave('${l.emp}','${l.type}')" title="Reject">✕</button>
        ` : '<span style="color:var(--text-muted);font-size:11px">—</span>'}
      </td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

// ===== USERS =====
function renderUsers() {
  const el = document.getElementById('users-grid');
  if (!el) return;
  const roleColors = { 'Company Owner': '#c9a96e', 'Admin': '#f87171', 'Department Manager': '#60a5fa', 'Employee': '#8a8fa8' };
  el.innerHTML = APP.data.users.map(u => `
    <div class="user-card">
      <div class="user-card-avatar" style="background:linear-gradient(135deg,${roleColors[u.role]||'#60a5fa'},rgba(0,0,0,0.3))">${u.name[0]}</div>
      <div class="user-card-info">
        <div class="user-card-name">${u.name}</div>
        <div class="user-card-email">${u.email}</div>
        <span class="badge ${u.role==='Company Owner'?'badge-gold':u.role==='Admin'?'badge-red':u.role==='Department Manager'?'badge-blue':'badge-gray'}">${u.role}</span>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Last: ${u.lastLogin}</div>
        <div class="user-card-actions">
          <button class="btn-icon" title="Edit User">✎</button>
          <button class="btn-icon" title="Permissions">🔐</button>
          <button class="btn-icon btn-danger" title="Deactivate">✕</button>
        </div>
      </div>
    </div>`).join('');
}

function renderRoles() {
  const el = document.getElementById('roles-grid');
  if (!el) return;
  const roles = [
    { name: 'Company Owner', desc: 'Full system access — can approve all critical actions', perms: ['View all modules', 'Approve critical actions', 'Manage users & roles', 'Access financial reports', 'Export all data', 'Audit log access', 'Configure system settings'] },
    { name: 'Admin', desc: 'Manage operations but cannot approve finance above $50k', perms: ['View all modules', 'Create/edit orders', 'Manage customers', 'Create invoices', 'Manage employees', 'User management', '✗ Cannot delete audit logs', '✗ Cannot override security settings'] },
    { name: 'Department Manager', desc: 'Manage their department only', perms: ['View department data', 'Manage team members', 'Create/edit orders', 'View financial summaries', '✗ Cannot access HR salaries', '✗ Cannot delete records'] },
    { name: 'Employee', desc: 'Limited read/write access to assigned tasks', perms: ['View assigned tasks', 'Update order status', 'Log stock movements', '✗ Cannot approve orders', '✗ Cannot view financials', '✗ Cannot manage users'] }
  ];
  el.innerHTML = roles.map(r => `
    <div class="role-card">
      <div class="role-name">${r.name}</div>
      <div class="role-desc">${r.desc}</div>
      <div class="permission-list">${r.perms.map(p => `
        <div class="permission-item">
          <span class="${p.startsWith('✗')?'perm-x':'perm-check'}">${p.startsWith('✗')?'✗':'✓'}</span>
          <span>${p.replace('✗ ','')}</span>
        </div>`).join('')}
      </div>
    </div>`).join('');
}

function renderAuditLog() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;
  // Non-admin users only see their own log entries
  const logs = hasPermission('seeAllUsers')
    ? APP.data.auditLog
    : APP.data.auditLog.filter(a => a.user === APP.currentUser?.name);
  tbody.innerHTML = logs.map(a => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace;font-size:11px">${a.time}</span></td>
      <td>${a.user}</td>
      <td><span class="badge badge-blue">${a.action}</span></td>
      <td>${a.module}</td>
      <td style="color:var(--text-secondary)">${a.details}</td>
      <td><span style="font-family:'DM Mono',monospace;color:var(--text-muted)">${a.ip}</span></td>
    </tr>`).join('');
}

function renderNotifications() {
  const el = document.getElementById('notif-list');
  if (!el) return;
  el.innerHTML = APP.data.notifications.map(n => `
    <div class="notif-item">
      <div class="notif-item-icon ${n.type}"><span>${n.icon}</span></div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-time">${n.msg}</div>
        <div class="notif-item-time" style="color:var(--text-muted)">${n.time}</div>
      </div>
    </div>`).join('');
}

function renderWarehouseSettings() {
  const el = document.getElementById('warehouse-settings');
  if (!el) return;
  el.innerHTML = APP.data.warehouses.map(w => `
    <div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;display:flex;justify-content:space-between;align-items:center">
      <span>${w.name} <small style="color:var(--text-muted)">${w.location}</small></span>
      <div style="display:flex;gap:6px">
        <button class="btn-icon" onclick="showToast('info','Edit Warehouse','Editing ${w.name}')" title="Edit">✎</button>
        <button class="btn-icon btn-danger" onclick="deleteWarehouse('${w.id}')" title="Delete">✕</button>
      </div>
    </div>`).join('');
}

function saveWarehouse() {
  const name = document.getElementById('wh-name').value.trim();
  if (!name) { showToast('error', 'Validation Error', 'Warehouse name is required.'); return; }
  APP.data.warehouses.push({
    id: nextId(APP.data.warehouses, 'W', 3),
    name,
    location: document.getElementById('wh-location').value,
    capacity: parseInt(document.getElementById('wh-capacity').value) || 1000,
    used: 0,
    products: 0,
    manager: document.getElementById('wh-manager').value
  });
  renderWarehouses();
  renderWarehouseSettings();
  closeModal();
  showToast('success', 'Warehouse Added', `${name} has been added.`);
  logAudit('Create', 'Settings', `Added warehouse: ${name}`);
}

function deleteWarehouse(id) {
  if (!hasPermission('canDelete')) { showToast('error', 'Access Denied', 'You cannot delete warehouses.'); return; }
  if (!confirm('Delete this warehouse?')) return;
  APP.data.warehouses = APP.data.warehouses.filter(w => w.id !== id);
  renderWarehouses();
  renderWarehouseSettings();
  showToast('warning', 'Warehouse Deleted', 'Warehouse has been removed.');
  logAudit('Delete', 'Settings', `Deleted warehouse ${id}`);
}

function nextId(items, prefix, pad) {
  const maxNum = items.reduce((max, item) => {
    const n = parseInt(String(item.id).replace(/\D/g, ''), 10) || 0;
    return Math.max(max, n);
  }, 0);
  return prefix + String(maxNum + 1).padStart(pad, '0');
}
function openModal(id) {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-' + id).classList.remove('hidden');
  // Populate dynamic dropdowns
  if (id === 'add-movement') {
    const sel = document.getElementById('mov-product');
    if (sel) sel.innerHTML = APP.data.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  // Reset edit mode
  if (editingProductId) {
    editingProductId = null;
    const h2 = document.querySelector('#modal-add-inventory .modal-header h2');
    if (h2) h2.textContent = 'Add New Product';
  }
}

function saveInventoryProduct() {
  const name = document.getElementById('inv-name').value.trim();
  if (!name) { showToast('error', 'Validation Error', 'Product name is required.'); return; }
  const productData = {
    name,
    type: document.getElementById('inv-type').value,
    color: document.getElementById('inv-color').value,
    size: document.getElementById('inv-size').value,
    quality: document.getElementById('inv-quality').value,
    supplier: document.getElementById('inv-supplier').value,
    price: parseFloat(document.getElementById('inv-price').value) || 0,
    stock: parseFloat(document.getElementById('inv-stock').value) || 0,
    warehouse: document.getElementById('inv-warehouse').value,
    usage: document.getElementById('inv-usage').value,
    minStock: parseFloat(document.getElementById('inv-min').value) || 50,
    origin: document.getElementById('inv-origin').value,
    notes: document.getElementById('inv-notes').value
  };
  if (editingProductId) {
    const idx = APP.data.products.findIndex(x => x.id === editingProductId);
    if (idx !== -1) {
      APP.data.products[idx] = { ...APP.data.products[idx], ...productData };
      showToast('success', 'Product Updated', `${name} has been updated.`);
      logAudit('Update', 'Inventory', `Updated product: ${name}`);
    }
    editingProductId = null;
    document.querySelector('#modal-add-inventory .modal-header h2').textContent = 'Add New Product';
  } else {
    const product = {
      id: nextId(APP.data.products, 'P', 3),
      ...productData
    };
    APP.data.products.push(product);
    showToast('success', 'Product Added', `${name} has been added to inventory.`);
    logAudit('Create', 'Inventory', `Added product: ${name}`);
  }
  renderInventoryTable();
  closeModal();
  saveToStorage();
}

function saveOrder() {
  const customer = document.getElementById('order-customer').value;
  const product = document.getElementById('order-product').value;
  const qty = document.getElementById('order-qty').value;
  if (!qty) { showToast('error', 'Validation Error', 'Quantity is required.'); return; }
  const total = document.getElementById('order-total').value;
  const maxOrdNum = APP.data.orders.reduce((max, o) => Math.max(max, parseInt(o.id.split('-').pop(), 10) || 0), 240);
  const id = `ORD-${new Date().getFullYear()}-${maxOrdNum + 1}`;
  APP.data.orders.unshift({ id, customer, product, qty: parseInt(qty), total, status: 'Preparing', type: document.getElementById('order-type').value, date: new Date().toISOString().split('T')[0] });
  renderOrders();
  closeModal();
  showToast('success', 'Order Created', `${id} has been created for ${customer}.`);
  logAudit('Create', 'Sales', `New order ${id} for ${customer}`);
  saveToStorage();
}

function saveCustomer() {
  const name = document.getElementById('cust-name').value.trim();
  if (!name) { showToast('error', 'Validation Error', 'Customer name is required.'); return; }
  APP.data.customers.push({
    id: nextId(APP.data.customers, 'C', 3),
    name,
    company: document.getElementById('cust-company').value,
    email: document.getElementById('cust-email').value,
    phone: document.getElementById('cust-phone').value,
    country: document.getElementById('cust-country').value,
    type: document.getElementById('cust-type').value,
    reliability: document.getElementById('cust-reliability').value,
    orders: 0, totalValue: '$0', points: 0, tier: 'Bronze'
  });
  renderCustomers();
  renderLoyalty();
  closeModal();
  showToast('success', 'Customer Added', `${name} has been added to CRM.`);
  logAudit('Create', 'CRM', `New customer: ${name}`);
  saveToStorage();
}

function saveInvoice() {
  const customer = document.getElementById('inv-cust').value;
  const baseAmount = parseFloat(document.getElementById('inv-amount').value) || 0;
  if (!baseAmount) { showToast('error', 'Validation Error', 'Invoice amount is required.'); return; }
  const tax = parseFloat(document.getElementById('inv-tax').value) || 0;
  const customs = parseFloat(document.getElementById('inv-customs').value) || 0;
  const shipping = parseFloat(document.getElementById('inv-ship-cost').value) || 0;
  const grandTotal = baseAmount + (baseAmount * tax / 100) + customs + shipping;
  const year = new Date().getFullYear();
  const maxInvNum = APP.data.invoices.reduce((max, i) => Math.max(max, parseInt(i.id.split('-').pop(), 10) || 0), 88);
  const id = `INV-${year}-${String(maxInvNum + 1).padStart(3, '0')}`;
  APP.data.invoices.unshift({
    id, customer,
    amount: '$' + baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    grandTotal: '$' + grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }),
    tax, customs, shipping,
    currency: document.getElementById('inv-curr').value,
    due: document.getElementById('inv-due').value,
    status: 'Draft',
    method: document.getElementById('inv-pay-method').value,
    notes: document.getElementById('inv-notes2').value,
    ref: document.getElementById('inv-ref').value
  });
  renderInvoices();
  renderPaymentsSummary();
  closeModal();
  showToast('success', 'Invoice Created', `${id} for ${customer} — Total: $${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  logAudit('Create', 'Accounting', `Invoice ${id} for ${customer} — $${grandTotal.toFixed(2)}`);
  saveToStorage();
}

function saveEmployee() {
  const name = document.getElementById('emp-name').value.trim();
  if (!name) { showToast('error', 'Validation Error', 'Employee name is required.'); return; }
  APP.data.employees.push({
    id: nextId(APP.data.employees, 'E', 3),
    name, title: document.getElementById('emp-title').value,
    dept: document.getElementById('emp-dept').value,
    email: document.getElementById('emp-email').value,
    phone: document.getElementById('emp-phone').value,
    salary: 'EGP ' + parseInt(document.getElementById('emp-salary').value || 0).toLocaleString(),
    hire: document.getElementById('emp-hire').value,
    role: document.getElementById('emp-role').value,
    perf: 80
  });
  renderEmployees();
  closeModal();
  showToast('success', 'Employee Added', `${name} has been added.`);
  logAudit('Create', 'HR', `New employee: ${name}`);
}

function saveUser() {
  const name = document.getElementById('usr-name').value.trim();
  const email = document.getElementById('usr-email').value.trim();
  if (!name || !email) { showToast('error', 'Validation Error', 'Name and email are required.'); return; }
  APP.data.users.push({
    id: nextId(APP.data.users, 'U', 3),
    name, email,
    role: document.getElementById('usr-role').value,
    dept: document.getElementById('usr-dept').value,
    status: document.getElementById('usr-status').value,
    lastLogin: 'Never'
  });
  renderUsers();
  closeModal();
  showToast('success', 'User Created', `${name} can now log in to the system.`);
  logAudit('Create', 'Users', `New user: ${name} (${email})`);
}

function saveMovement() {
  const product = document.getElementById('mov-product').value;
  const qty = document.getElementById('mov-qty').value;
  if (!qty) { showToast('error', 'Validation Error', 'Quantity is required.'); return; }
  const movTypeRaw = document.getElementById('mov-type').value;
  const movType = movTypeRaw.split(' ')[0]; // e.g. 'Inbound'
  APP.data.movements.unshift({
    date: new Date().toISOString().split('T')[0],
    product, type: movType,
    qty: parseInt(qty),
    from: document.getElementById('mov-from').value,
    to: document.getElementById('mov-to').value,
    ref: document.getElementById('mov-ref').value || 'MANUAL',
    user: APP.currentUser?.name || 'Admin'
  });
  // Update product stock level
  const prod = APP.data.products.find(p => p.name === product);
  if (prod) {
    if (movType === 'Inbound' || movType === 'Return') {
      prod.stock += parseInt(qty);
    } else if (movType === 'Outbound') {
      prod.stock = Math.max(0, prod.stock - parseInt(qty));
    }
    renderInventoryTable();
  }
  renderMovements();
  closeModal();
  showToast('success', 'Movement Recorded', `Stock movement logged for ${product}.`);
  logAudit('Create', 'Inventory', `Stock movement: ${qty}m² ${movType} — ${product}`);
}

function calcOrderTotal() {
  const qty = parseFloat(document.getElementById('order-qty').value) || 0;
  const price = parseFloat(document.getElementById('order-price').value) || 0;
  document.getElementById('order-total').value = '$' + (qty * price).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

function calcInvoiceTotal() {
  const amount = parseFloat(document.getElementById('inv-amount')?.value) || 0;
  const tax = parseFloat(document.getElementById('inv-tax')?.value) || 0;
  const customs = parseFloat(document.getElementById('inv-customs')?.value) || 0;
  const shipping = parseFloat(document.getElementById('inv-ship-cost')?.value) || 0;
  const total = amount + (amount * tax / 100) + customs + shipping;
  const el = document.getElementById('inv-total-display');
  if (el) el.textContent = '$' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===== FILTER/SEARCH =====
function filterTable(tableId, query) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  const q = query.toLowerCase();
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.classList.toggle('hidden-row', q !== '' && !text.includes(q));
  });
}

function filterByCol(tableId, colIndex, value) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    if (!value) { row.classList.remove('hidden-row'); return; }
    const cell = row.cells[colIndex];
    const text = cell ? cell.textContent.trim() : '';
    row.classList.toggle('hidden-row', !text.includes(value));
  });
}

function filterMovements() {
  const from = document.getElementById('mov-date-from')?.value;
  const to = document.getElementById('mov-date-to')?.value;
  const tbody = document.getElementById('mov-tbody');
  if (!tbody) return;
  let filtered = APP.data.movements;
  if (from) filtered = filtered.filter(m => m.date >= from);
  if (to)   filtered = filtered.filter(m => m.date <= to);
  tbody.innerHTML = filtered.map(m => `
    <tr>
      <td><span style="font-family:'DM Mono',monospace">${m.date}</span></td>
      <td>${m.product}</td>
      <td><span class="badge ${m.type==='Inbound'?'badge-green':m.type==='Outbound'?'badge-red':m.type==='Transfer'?'badge-blue':'badge-amber'}">${m.type}</span></td>
      <td><strong style="font-family:'DM Mono',monospace">${m.qty}</strong></td>
      <td>${m.from}</td>
      <td>${m.to}</td>
      <td><span style="font-family:'DM Mono',monospace;color:var(--gold)">${m.ref}</span></td>
      <td>${m.user}</td>
    </tr>`).join('');
  showToast('success', 'Filter Applied', `Showing ${filtered.length} movement${filtered.length !== 1 ? 's' : ''}.`);
}

// ===== GLOBAL SEARCH =====
function globalSearch(q) {
  const panel = document.getElementById('search-results');
  if (!q || q.length < 2) { if (panel) panel.style.display = 'none'; return; }
  const results = [];
  APP.data.products.forEach(p => { if (p.name.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Product', name: p.name, sub: p.type + ' · ' + p.warehouse, link: 'inventory' }); });
  APP.data.customers.forEach(c => { if (c.name.toLowerCase().includes(q.toLowerCase()) || c.company.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Customer', name: c.name, sub: c.company + ' · ' + c.country, link: 'crm' }); });
  APP.data.orders.forEach(o => { if (o.id.toLowerCase().includes(q.toLowerCase()) || o.customer.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Order', name: o.id, sub: o.customer + ' · ' + o.total, link: 'sales' }); });
  APP.data.invoices.forEach(i => { if (i.id.toLowerCase().includes(q.toLowerCase())) results.push({ type: 'Invoice', name: i.id, sub: i.customer + ' · ' + i.amount, link: 'accounting' }); });

  if (!panel) {
    const p = document.createElement('div');
    p.id = 'search-results';
    p.className = 'search-results-panel';
    document.querySelector('.search-bar').appendChild(p);
  }
  const rPanel = document.getElementById('search-results');
  if (results.length === 0) {
    rPanel.innerHTML = '<div class="search-result-item" style="color:var(--text-muted);font-style:italic">No results found</div>';
  } else {
    rPanel.innerHTML = results.slice(0, 8).map(r => `
      <div class="search-result-item" onclick="showModule('${r.link}');this.parentElement.style.display='none'">
        <span class="badge badge-blue" style="font-size:10px;margin-right:6px">${r.type}</span>
        <strong>${r.name}</strong>
        <span style="color:var(--text-muted);margin-left:6px;font-size:11px">${r.sub}</span>
      </div>`).join('');
  }
  rPanel.style.display = 'block';
}
function closeSearchPanel(e) {
  if (!e.target.closest('.search-bar')) {
    const p = document.getElementById('search-results');
    if (p) p.style.display = 'none';
  }
}
document.addEventListener('click', closeSearchPanel);

// ===== SIDEBAR =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-content');
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('expanded');
}

// ===== NOTIFICATIONS =====
function toggleNotif() {
  document.getElementById('notif-panel').classList.toggle('hidden');
}

// ===== LANGUAGE / I18N =====
const TRANSLATIONS = {
  en: {
    'Dashboard': 'Dashboard', 'Inventory Management': 'Inventory Management',
    'Sales & Export': 'Sales & Export', 'CRM & Customers': 'CRM & Customers',
    'Accounting': 'Accounting', 'Analytics': 'Analytics',
    'Human Resources': 'Human Resources', 'Users & Access': 'Users & Access',
    'Settings': 'Settings', 'Sign Out': 'Sign Out',
    'Executive Dashboard': 'Executive Dashboard', 'Total Stock (m²)': 'Total Stock (m²)',
    'Active Orders': 'Active Orders', 'Monthly Revenue': 'Monthly Revenue',
    'Active Alerts': 'Active Alerts', 'Total Customers': 'Total Customers',
    'Active Shipments': 'Active Shipments', 'Export Report': 'Export Report',
    'Search clients, orders, products...': 'Search clients, orders, products...',
    '+ Add Product': '+ Add Product', 'Stock Movements': 'Stock Movements',
    'Products': 'Products', 'Warehouses': 'Warehouses',
    'Movements': 'Movements', 'Batches & QR': 'Batches & QR',
    '+ New Order': '+ New Order', 'Orders': 'Orders', 'Shipments': 'Shipments',
    'Contracts': 'Contracts', 'Pricing Rules': 'Pricing Rules',
    '+ Add Customer': '+ Add Customer', 'Customers': 'Customers',
    'Leads': 'Leads', 'Complaints': 'Complaints', 'Loyalty Program': 'Loyalty Program',
    'Financial Reports': 'Financial Reports', '+ New Invoice': '+ New Invoice',
    'Invoices': 'Invoices', 'Payments': 'Payments', 'Expenses': 'Expenses', 'Reports': 'Reports',
    'Export PDF': 'Export PDF', 'Export Excel': 'Export Excel',
    '+ Add Employee': '+ Add Employee', 'Employees': 'Employees',
    'Attendance': 'Attendance', 'Payroll': 'Payroll', 'Leaves': 'Leaves',
    'Audit Log': 'Audit Log', '+ Add User': '+ Add User', 'Roles & Permissions': 'Roles & Permissions',
    'System Settings': 'System Settings', 'Welcome Back': 'Welcome Back',
    'Sign in to your export management system': 'Sign in to your export management system',
    'Email Address': 'Email Address', 'Password': 'Password', 'Sign In': 'Sign In',
  },
  ar: {
    'Dashboard': 'لوحة التحكم', 'Inventory Management': 'إدارة المخزون',
    'Sales & Export': 'المبيعات والتصدير', 'CRM & Customers': 'إدارة العملاء',
    'Accounting': 'المحاسبة', 'Analytics': 'التحليلات',
    'Human Resources': 'الموارد البشرية', 'Users & Access': 'المستخدمون والصلاحيات',
    'Settings': 'الإعدادات', 'Sign Out': 'تسجيل الخروج',
    'Executive Dashboard': 'لوحة التحكم التنفيذية', 'Total Stock (m²)': 'إجمالي المخزون (م²)',
    'Active Orders': 'الطلبات النشطة', 'Monthly Revenue': 'الإيرادات الشهرية',
    'Active Alerts': 'التنبيهات النشطة', 'Total Customers': 'إجمالي العملاء',
    'Active Shipments': 'الشحنات النشطة', 'Export Report': 'تصدير التقرير',
    'Search clients, orders, products...': 'بحث عن عملاء، طلبات، منتجات...',
    '+ Add Product': '+ إضافة منتج', 'Stock Movements': 'حركة المخزون',
    'Products': 'المنتجات', 'Warehouses': 'المستودعات',
    'Movements': 'الحركات', 'Batches & QR': 'الدفعات ورمز QR',
    '+ New Order': '+ طلب جديد', 'Orders': 'الطلبات', 'Shipments': 'الشحنات',
    'Contracts': 'العقود', 'Pricing Rules': 'قواعد التسعير',
    '+ Add Customer': '+ إضافة عميل', 'Customers': 'العملاء',
    'Leads': 'العملاء المحتملون', 'Complaints': 'الشكاوى', 'Loyalty Program': 'برنامج الولاء',
    'Financial Reports': 'التقارير المالية', '+ New Invoice': '+ فاتورة جديدة',
    'Invoices': 'الفواتير', 'Payments': 'المدفوعات', 'Expenses': 'المصروفات', 'Reports': 'التقارير',
    'Export PDF': 'تصدير PDF', 'Export Excel': 'تصدير Excel',
    '+ Add Employee': '+ إضافة موظف', 'Employees': 'الموظفون',
    'Attendance': 'الحضور', 'Payroll': 'كشف الرواتب', 'Leaves': 'الإجازات',
    'Audit Log': 'سجل التدقيق', '+ Add User': '+ إضافة مستخدم', 'Roles & Permissions': 'الأدوار والصلاحيات',
    'System Settings': 'إعدادات النظام', 'Welcome Back': 'مرحباً بعودتك',
    'Sign in to your export management system': 'تسجيل الدخول إلى نظام إدارة التصدير',
    'Email Address': 'البريد الإلكتروني', 'Password': 'كلمة المرور', 'Sign In': 'تسجيل الدخول',
  }
};

function t(key) {
  return (TRANSLATIONS[APP.currentLang] || {})[key] || key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
}

function toggleLang() {
  APP.currentLang = APP.currentLang === 'en' ? 'ar' : 'en';
  const isAr = APP.currentLang === 'ar';
  document.getElementById('lang-label').textContent = isAr ? 'AR' : 'EN';
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  document.documentElement.lang = APP.currentLang;
  applyTranslations();
  showToast('info', isAr ? 'اللغة' : 'Language', isAr ? 'تم التبديل إلى العربية' : 'Switched to English');
}

// ===== TOAST =====
function showToast(type, title, msg, duration = 4000) {
  const icons = { success: '✅', error: '🔴', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-icon">${icons[type]||'ℹ️'}</div><div class="toast-body"><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== AUDIT LOG =====
function logAudit(action, module, details) {
  if (!APP.currentUser) return;
  APP.data.auditLog.unshift({
    time: new Date().toLocaleString('en-GB').replace(',', ''),
    user: APP.currentUser.name,
    action, module, details,
    ip: getRandomIP()
  });
  renderAuditLog();
}

function getRandomIP() {
  return `192.168.1.${Math.floor(Math.random() * 100) + 100}`;
}

// ===== ACTIONS =====
let editingProductId = null;

function editProduct(id) {
  const p = APP.data.products.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('inv-name').value = p.name;
  document.getElementById('inv-type').value = p.type;
  document.getElementById('inv-color').value = p.color;
  document.getElementById('inv-size').value = p.size;
  document.getElementById('inv-quality').value = p.quality;
  document.getElementById('inv-supplier').value = p.supplier;
  document.getElementById('inv-price').value = p.price;
  document.getElementById('inv-stock').value = p.stock;
  document.getElementById('inv-warehouse').value = p.warehouse;
  document.getElementById('inv-usage').value = p.usage;
  document.getElementById('inv-min').value = p.minStock;
  document.getElementById('inv-origin').value = p.origin;
  document.getElementById('inv-notes').value = p.notes || '';
  document.querySelector('#modal-add-inventory .modal-header h2').textContent = 'Edit Product';
  openModal('add-inventory');
}

// ===== ACTIONS =====
function deleteProduct(id) {
  if (!hasPermission('canDelete')) { showToast('error', 'Access Denied', 'You do not have permission to delete products.'); return; }
  const p = APP.data.products.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete ${p.name}? This action cannot be undone.`)) return;
  APP.data.products = APP.data.products.filter(x => x.id !== id);
  renderInventoryTable();
  showToast('warning', 'Product Deleted', `${p.name} has been removed from inventory.`);
  logAudit('Delete', 'Inventory', `Deleted product: ${p.name}`);
}

function viewBatch(id) {
  const p = APP.data.products.find(x => x.id === id);
  const batches = APP.data.batches.filter(b => b.product === p?.name);
  if (batches.length === 0) { showToast('info', 'No Batches', `No batch records found for ${p?.name || id}.`); return; }
  const detail = batches.map(b => `<strong>${b.id}</strong>: ${b.qty} m² — ${b.quality} — ${b.origin} — ${b.date}`).join('\n');
  alert(`Batch History for ${p?.name}:\n\n${detail}`);
}

function viewOrder(id) {
  const o = APP.data.orders.find(x => x.id === id);
  if (!o) return;
  alert(`Order Details\n\nID: ${o.id}\nCustomer: ${o.customer}\nProduct: ${o.product}\nQuantity: ${o.qty} m²\nTotal: ${o.total}\nStatus: ${o.status}\nType: ${o.type}\nDate: ${o.date}`);
}

function viewCustomer(id) {
  const c = APP.data.customers.find(x => x.id === id);
  if (!c) return;
  alert(`Customer Profile\n\n${c.name}\n${c.company}\nCountry: ${c.country}\nEmail: ${c.email}\nPhone: ${c.phone}\nType: ${c.type}\nOrders: ${c.orders}\nTotal Value: ${c.totalValue}\nLoyalty Points: ${c.points} (${c.tier})`);
}

function updateOrderStatus(id) {
  if (!hasPermission('canApprove')) { showToast('error', 'Access Denied', 'You do not have permission to update order status.'); return; }
  const order = APP.data.orders.find(o => o.id === id);
  if (!order) return;
  const statuses = ['Preparing', 'Shipped', 'Delivered', 'Paid'];
  const idx = statuses.indexOf(order.status);
  if (idx === statuses.length - 1) { showToast('info', 'No Change', `Order ${id} is already at final status: ${order.status}`); return; }
  const nextStatus = statuses[idx + 1];
  if (confirm(`Update ${id} from "${order.status}" → "${nextStatus}"?`)) {
    order.status = nextStatus;
    renderOrders();
    showToast('success', 'Status Updated', `${id} is now "${nextStatus}"`);
    logAudit('Update', 'Sales', `Order ${id} status → ${nextStatus}`);
  }
}

function markInvoicePaid(id) {
  if (!hasPermission('canEditFinance')) {
    showToast('error', 'Access Denied', 'You do not have permission to mark invoices as paid.'); return;
  }
  const inv = APP.data.invoices.find(i => i.id === id);
  if (!inv) return;
  inv.status = 'Paid';
  renderInvoices();
  renderPaymentsSummary();
  showToast('success', 'Invoice Paid', `${id} has been marked as paid.`);
  logAudit('Update', 'Accounting', `Invoice ${id} marked as paid`);
}

function sendInvoiceReminder(id) {
  const inv = APP.data.invoices.find(i => i.id === id);
  if (!inv) return;
  showToast('info', 'Reminder Sent', `Payment reminder sent to ${inv.customer} for ${inv.amount}.`);
  logAudit('Send', 'Accounting', `Payment reminder sent for invoice ${id} to ${inv.customer}`);
}

function printInvoicePDF(id) {
  showToast('info', 'Generating PDF', `Invoice ${id} is being prepared as a PDF…`);
}

function approveLeave(empName, leaveType) {
  if (!hasPermission('canApprove')) { showToast('error', 'Access Denied', 'You do not have permission to approve leave.'); return; }
  showToast('success', 'Leave Approved', `${leaveType} for ${empName} has been approved.`);
  logAudit('Update', 'HR', `Leave approved for ${empName}`);
}

function rejectLeave(empName, leaveType) {
  if (!hasPermission('canApprove')) { showToast('error', 'Access Denied', 'You do not have permission to reject leave.'); return; }
  showToast('warning', 'Leave Rejected', `${leaveType} for ${empName} has been rejected.`);
  logAudit('Update', 'HR', `Leave rejected for ${empName}`);
}

function exportReport() { showToast('info', 'Export', 'Dashboard report is being exported to PDF...'); logAudit('Export', 'Dashboard', 'Exported dashboard report'); }
function refreshAnalytics() { renderAnalyticsCharts(); showToast('success', 'Analytics', 'Analytics data refreshed.'); }
function exportPDF() { showToast('info', 'Export PDF', 'Analytics report is being generated as PDF...'); logAudit('Export', 'Analytics', 'Exported analytics PDF'); }
function exportExcel() { showToast('info', 'Export Excel', 'Analytics data is being exported to Excel...'); logAudit('Export', 'Analytics', 'Exported analytics Excel'); }
function previewInvoice() { showToast('info', 'Preview', 'Invoice preview opened in print view.'); window.print(); }

// ===== KEYBOARD SHORTCUT =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.ctrlKey && e.key === '/') document.getElementById('global-search')?.focus();
});

// Close modal on overlay click already handled in HTML, but also stop propagation on modal itself
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => e.stopPropagation()));
