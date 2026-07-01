// Script to clear all admin data from localStorage
console.log('=== Clearing Admin Data ===');
// Clear products
localStorage.removeItem('itel.admin.products');
// Clear categories  
localStorage.removeItem('itel_categories');
console.log('Products cleared:', localStorage.getItem('itel.admin.products'));
console.log('Categories cleared:', localStorage.getItem('itel_categories'));
console.log('=== Done ===');