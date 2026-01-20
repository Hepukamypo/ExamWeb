/**
 * notifications.js
 * Модуль для отображения уведомлений
 */

/**
 * Показать уведомление
 * @param {string} message - текст уведомления
 * @param {string} type - тип уведомления (success, info, warning, danger)
 * @param {number} duration - длительность отображения в миллисекундах (по умолчанию 5000)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Создание элемента уведомления
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show mb-2`;
    notification.role = 'alert';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="flex-shrink-0 me-2">
                ${getNotificationIcon(type)}
            </div>
            <div class="flex-grow-1">
                ${message}
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Закрыть"></button>
        </div>
    `;
    
    // Добавление уведомления в контейнер
    const container = document.getElementById('notifications-container');
    if (container) {
        container.prepend(notification);
        
        // Автоматическое скрытие уведомления
        if (duration > 0) {
            setTimeout(() => {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(notification);
                bsAlert.close();
            }, duration);
        }
        
        // Добавление обработчика для ручного закрытия
        notification.querySelector('.btn-close').addEventListener('click', () => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(notification);
            bsAlert.close();
        });
    } else {
        console.warn('Контейнер для уведомлений не найден');
    }
}

/**
 * Получить иконку для уведомления в зависимости от типа
 * @param {string} type - тип уведомления
 * @returns {string} - HTML с иконкой
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '<i class="fas fa-check-circle fs-4 text-success"></i>';
        case 'info':
            return '<i class="fas fa-info-circle fs-4 text-info"></i>';
        case 'warning':
            return '<i class="fas fa-exclamation-triangle fs-4 text-warning"></i>';
        case 'danger':
            return '<i class="fas fa-exclamation-circle fs-4 text-danger"></i>';
        default:
            return '<i class="fas fa-bell fs-4 text-secondary"></i>';
    }
}

/**
 * Показать ошибку API
 * @param {Error} error - объект ошибки
 */
function showApiError(error) {
    let message = 'Произошла ошибка при обращении к API';
    
    if (error.message.includes('авторизации')) {
        message = 'Требуется авторизация. Пожалуйста, проверьте ваш API ключ.';
    } else if (error.message.includes('404')) {
        message = 'Запрашиваемый ресурс не найден.';
    } else if (error.message.includes('400')) {
        message = 'Некорректные параметры запроса.';
    } else if (error.message) {
        message = error.message;
    }
    
    showNotification(message, 'danger');
}

// Добавление функций в глобальную область видимости
window.showNotification = showNotification;
window.showApiError = showApiError;