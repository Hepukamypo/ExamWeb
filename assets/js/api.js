/**
 * api.js
 * Модуль для работы с API языковой школы
 */

// Глобальные переменные для API
// ВАЖНО: API_KEY НЕ объявлен здесь, он объявлен в index.html и cabinet.html

/**
 * Отправка GET запроса к API
 * @param {string} endpoint - конечная точка API
 * @returns {Promise} - промис с данными или ошибкой
 */
function apiGet(endpoint) {
    // Проверка наличия API ключа
    if (!API_KEY || API_KEY === 'ВАШ_API_КЛЮЧ') {
        const error = new Error('API ключ не установлен. Получите ключ в СДО Московского Политеха.');
        console.error('Ошибка API:', error.message);
        throw error;
    }
    
    const url = `${API_BASE_URL}${endpoint}?api_key=${API_KEY}`;
    console.log('Отправка GET запроса:', url);
    
    return fetch(url)
        .then(response => {
            console.log('Получен ответ от API:', response.status);
            
            if (!response.ok) {
                return response.json()
                    .then(data => {
                        const error = new Error(data.error || `Ошибка ${response.status}: ${response.statusText}`);
                        console.error('Ошибка API:', error.message);
                        throw error;
                    })
                    .catch(() => {
                        const error = new Error(`Ошибка ${response.status}: ${response.statusText}`);
                        console.error('Ошибка API:', error.message);
                        throw error;
                    });
            }
            
            return response.json();
        })
        .catch(error => {
            console.error(`Ошибка GET запроса к ${endpoint}:`, error);
            throw error;
        });
}

/**
 * Отправка POST запроса к API
 * @param {string} endpoint - конечная точка API
 * @param {Object} data - данные для отправки
 * @returns {Promise} - промис с данными или ошибкой
 */
function apiPost(endpoint, data) {
    // Проверка наличия API ключа
    if (!API_KEY || API_KEY === 'ВАШ_API_КЛЮЧ') {
        const error = new Error('API ключ не установлен. Получите ключ в СДО Московского Политеха.');
        console.error('Ошибка API:', error.message);
        throw error;
    }
    
    const url = `${API_BASE_URL}${endpoint}?api_key=${API_KEY}`;
    console.log('Отправка POST запроса:', url);
    console.log('Данные запроса:', data);
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Получен ответ от API:', response.status);
        
        if (!response.ok) {
            return response.json()
                .then(data => {
                    const error = new Error(data.error || `Ошибка ${response.status}: ${response.statusText}`);
                    console.error('Ошибка API:', error.message);
                    throw error;
                })
                .catch(() => {
                    const error = new Error(`Ошибка ${response.status}: ${response.statusText}`);
                    console.error('Ошибка API:', error.message);
                    throw error;
                });
        }
        
        return response.json();
    })
    .catch(error => {
        console.error(`Ошибка POST запроса к ${endpoint}:`, error);
        throw error;
    });
}

/**
 * Отправка PUT запроса к API
 * @param {string} endpoint - конечная точка API
 * @param {Object} data - данные для отправки
 * @returns {Promise} - промис с данными или ошибкой
 */
function apiPut(endpoint, data) {
    // Проверка наличия API ключа
    if (!API_KEY || API_KEY === 'ВАШ_API_КЛЮЧ') {
        const error = new Error('API ключ не установлен. Получите ключ в СДО Московского Политеха.');
        console.error('Ошибка API:', error.message);
        throw error;
    }
    
    const url = `${API_BASE_URL}${endpoint}?api_key=${API_KEY}`;
    console.log('Отправка PUT запроса:', url);
    console.log('Данные запроса:', data);
    
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('Получен ответ от API:', response.status);
        
        if (!response.ok) {
            return response.json()
                .then(data => {
                    const error = new Error(data.error || `Ошибка ${response.status}: ${response.statusText}`);
                    console.error('Ошибка API:', error.message);
                    throw error;
                })
                .catch(() => {
                    const error = new Error(`Ошибка ${response.status}: ${response.statusText}`);
                    console.error('Ошибка API:', error.message);
                    throw error;
                });
        }
        
        return response.json();
    })
    .catch(error => {
        console.error(`Ошибка PUT запроса к ${endpoint}:`, error);
        throw error;
    });
}

/**
 * Отправка DELETE запроса к API
 * @param {string} endpoint - конечная точка API
 * @returns {Promise} - промис с данными или ошибкой
 */
function apiDelete(endpoint) {
    // Проверка наличия API ключа
    if (!API_KEY || API_KEY === 'ВАШ_API_КЛЮЧ') {
        const error = new Error('API ключ не установлен. Получите ключ в СДО Московского Политеха.');
        console.error('Ошибка API:', error.message);
        throw error;
    }
    
    const url = `${API_BASE_URL}${endpoint}?api_key=${API_KEY}`;
    console.log('Отправка DELETE запроса:', url);
    
    return fetch(url, {
        method: 'DELETE'
    })
    .then(response => {
        console.log('Получен ответ от API:', response.status);
        
        if (!response.ok) {
            return response.json()
                .then(data => {
                    const error = new Error(data.error || `Ошибка ${response.status}: ${response.statusText}`);
                    console.error('Ошибка API:', error.message);
                    throw error;
                })
                .catch(() => {
                    const error = new Error(`Ошибка ${response.status}: ${response.statusText}`);
                    console.error('Ошибка API:', error.message);
                    throw error;
                });
        }
        
        return response.json();
    })
    .catch(error => {
        console.error(`Ошибка DELETE запроса к ${endpoint}:`, error);
        throw error;
    });
}

/**
 * Загрузка списка курсов
 * @returns {Promise} - промис со списком курсов
 */
function loadCourses() {
    const container = document.getElementById('coursesContainer');
    
    if (!container) {
        console.error('Контейнер для курсов не найден');
        return;
    }
    
    // Показываем индикатор загрузки
    container.innerHTML = `
        <div class="col text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
            <p class="mt-3 text-muted">Загрузка списка курсов...</p>
        </div>
    `;
    
    return apiGet('/api/courses')
        .then(courses => {
            console.log('Получены курсы:', courses);
            renderCourses(courses);
            return courses;
        })
        .catch(error => {
            console.error('Ошибка загрузки курсов:', error);
            showNotification('Ошибка загрузки курсов: ' + error.message, 'danger');
            
            // Показываем сообщение об ошибке вместо загрузки
            container.innerHTML = `
                <div class="col text-center py-5">
                    <i class="fas fa-exclamation-circle fs-2 text-danger mb-3"></i>
                    <h4>Ошибка загрузки данных</h4>
                    <p class="text-muted">Не удалось загрузить список курсов</p>
                    <p class="text-muted small">Ошибка: ${error.message}</p>
                    <button class="btn btn-primary mt-3" onclick="loadCourses()">
                        <i class="fas fa-redo me-1"></i>Попробовать снова
                    </button>
                </div>
            `;
        });
}

/**
 * Загрузка списка репетиторов
 * @returns {Promise} - промис со списком репетиторов
 */
function loadTutors() {
    const tableBody = document.getElementById('tutorsTableBody');
    
    if (!tableBody) {
        console.error('Таблица репетиторов не найдена');
        return;
    }
    
    // Показываем индикатор загрузки
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Загрузка...</span>
                </div>
                <p class="mt-3 text-muted">Загрузка списка репетиторов...</p>
            </td>
        </tr>
    `;
    
    return apiGet('/api/tutors')
        .then(tutors => {
            console.log('Получены репетиторы:', tutors);
            window.allTutors = tutors;
            renderTutors(tutors);
            return tutors;
        })
        .catch(error => {
            console.error('Ошибка загрузки репетиторов:', error);
            showNotification('Ошибка загрузки репетиторов: ' + error.message, 'danger');
            
            // Показываем сообщение об ошибке вместо загрузки
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="fas fa-exclamation-circle fs-2 text-danger mb-3"></i>
                        <h4>Ошибка загрузки данных</h4>
                        <p class="text-muted">Не удалось загрузить список репетиторов</p>
                        <p class="text-muted small">Ошибка: ${error.message}</p>
                        <button class="btn btn-primary mt-3" onclick="loadTutors()">
                            <i class="fas fa-redo me-1"></i>Попробовать снова
                        </button>
                    </td>
                </tr>
            `;
        });
}

/**
 * Загрузка списка заявок пользователя
 * @returns {Promise} - промис со списком заявок
 */
function loadUserOrders() {
    showLoader('ordersTableBody', 6);
    
    return apiGet('/api/orders')
        .then(orders => {
            console.log('Получены заявки:', orders);
            window.userOrders = orders;
            renderOrdersTable(orders);
            return orders;
        })
        .catch(error => {
            console.error('Ошибка загрузки заявок:', error);
            showApiError(error);
            renderEmptyOrdersTable();
        });
}

// Экспорт функций для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiGet,
        apiPost,
        apiPut,
        apiDelete,
        loadCourses,
        loadTutors,
        loadUserOrders
    };
}