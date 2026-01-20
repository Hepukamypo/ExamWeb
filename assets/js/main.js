// Глобальные переменные
window.allCourses = [];
window.allTutors = [];
window.orders = [];
window.selectedTutorId = null;

/**
 * Инициализация главной страницы (требование 3.2.1)
 */
function initHomePage() {
    // Показываем индикатор загрузки
    showLoadingIndicator('coursesContainer');
    showLoadingIndicator('tutorsTable');
    
    // Загружаем данные параллельно для оптимизации (требование 3.2.1)
    Promise.all([
        window.fetchCourses(),
        window.fetchTutors()
    ]).then(([courses, tutors]) => {
        // Сохраняем полученные данные
        window.allCourses = courses;
        window.allTutors = tutors;
        
        // Отображаем курсы
        window.renderCourses(courses, 1);
        
        // Настраиваем поиск по курсам (требование 3.1)
        window.setupCourseSearch(courses);
        
        // Отображаем репетиторов
        window.renderTutors(tutors);
        
        // Настраиваем фильтры для репетиторов (требование 3.3.1)
        window.setupTutorFilters(tutors);
        
        // Скрываем индикаторы загрузки
        hideLoadingIndicator('coursesContainer');
        hideLoadingIndicator('tutorsTable');
    }).catch(error => {
        console.error('Ошибка при загрузке данных:', error);
        window.showNotification('Не удалось загрузить данные с сервера. Попробуйте перезагрузить страницу.', 'danger');
        
        // Скрываем индикаторы загрузки даже при ошибке
        hideLoadingIndicator('coursesContainer');
        hideLoadingIndicator('tutorsTable');
    });
}

/**
 * Инициализация личного кабинета (требование 3.2.1)
 */
function initCabinetPage() {
    // Показываем индикатор загрузки
    showLoadingIndicator('ordersTable');
    
    // Загружаем заявки (требование 4.4)
    window.fetchOrders().then(orders => {
        window.orders = orders;
        window.loadOrdersPage(1);
        hideLoadingIndicator('ordersTable');
    }).catch(error => {
        console.error('Ошибка при загрузке заявок:', error);
        window.showNotification('Не удалось загрузить заявки. Попробуйте перезагрузить страницу.', 'danger');
        hideLoadingIndicator('ordersTable');
    });
}

/**
 * Загрузить страницу с заявками (требование 3.2.1)
 */
window.loadOrdersPage = function(page = 1) {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedOrders = window.orders.slice(startIndex, endIndex);
    
    window.renderOrdersTable(paginatedOrders, startIndex + 1);
    window.renderPagination('orders', Math.ceil(window.orders.length / ITEMS_PER_PAGE), page);
};

/**
 * Показать индикатор загрузки
 */
function showLoadingIndicator(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-3 text-muted">Загрузка данных...</p>
        </div>
    `;
}

/**
 * Скрыть индикатор загрузки
 */
function hideLoadingIndicator(containerId) {
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = '';
}

// Автоинициализация при загрузке страницы (требование 2)
document.addEventListener('DOMContentLoaded', function() {
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
    
    if (isHomePage) {
        initHomePage();
    } else {
        initCabinetPage();
    }
});