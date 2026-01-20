/**
 * pagination.js
 * Модуль для генерации пагинации
 */

/**
 * Генерация элементов пагинации
 * @param {string} containerId - ID контейнера для пагинации
 * @param {number} totalPages - общее количество страниц
 * @param {number} currentPage - текущая страница
 * @param {Function} onPageChange - функция обратного вызова при изменении страницы
 */
function generatePagination(containerId, totalPages, currentPage, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Очистка контейнера
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Создание элементов пагинации
    const pagination = document.createElement('ul');
    pagination.className = 'pagination';
    
    // Кнопка "Предыдущая"
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `
        <button class="page-link" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    if (currentPage > 1) {
        prevItem.querySelector('button').addEventListener('click', () => onPageChange(currentPage - 1));
    }
    pagination.appendChild(prevItem);
    
    // Генерация номеров страниц
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Всегда показывать первую страницу
    if (startPage > 1) {
        const firstItem = document.createElement('li');
        firstItem.className = 'page-item';
        firstItem.innerHTML = '<button class="page-link">1</button>';
        firstItem.querySelector('button').addEventListener('click', () => onPageChange(1));
        pagination.appendChild(firstItem);
        
        if (startPage > 2) {
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = 'page-item disabled';
            ellipsisItem.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsisItem);
        }
    }
    
    // Основные страницы
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<button class="page-link">${i}</button>`;
        
        if (i !== currentPage) {
            pageItem.querySelector('button').addEventListener('click', () => onPageChange(i));
        }
        
        pagination.appendChild(pageItem);
    }
    
    // Всегда показывать последнюю страницу
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsisItem = document.createElement('li');
            ellipsisItem.className = 'page-item disabled';
            ellipsisItem.innerHTML = '<span class="page-link">...</span>';
            pagination.appendChild(ellipsisItem);
        }
        
        const lastItem = document.createElement('li');
        lastItem.className = 'page-item';
        lastItem.innerHTML = `<button class="page-link">${totalPages}</button>`;
        lastItem.querySelector('button').addEventListener('click', () => onPageChange(totalPages));
        pagination.appendChild(lastItem);
    }
    
    // Кнопка "Следующая"
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `
        <button class="page-link" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    if (currentPage < totalPages) {
        nextItem.querySelector('button').addEventListener('click', () => onPageChange(currentPage + 1));
    }
    pagination.appendChild(nextItem);
    
    // Добавление пагинации в контейнер
    container.appendChild(pagination);
}

// Добавление функции в глобальную область видимости
window.generatePagination = generatePagination;